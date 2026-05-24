import crypto from 'crypto';
import { DEFAULT_CURRENCY, DEFAULT_PAGE_SIZE, RESERVATION_WINDOW_MS } from '@/lib/constants';
import { ConflictError, GoneError, NotFoundError, ValidationError } from '@/lib/errors';
import { mapReservation } from '@/lib/mappers';
import { connectToDatabase, withMongoTransaction } from '@/lib/mongodb';
import { reservationCreateSchema, paymentReferenceSchema, releaseReservationSchema } from '@/lib/validators';
import {
  confirmInventoryReservation,
  listInventoryItems,
  releaseInventoryReservation,
  reserveInventoryUnits,
} from '@/repositories/inventory.repository';
import {
  confirmReservationRecord,
  countReservationsByStatus,
  createReservationRecord,
  findReservationByCode,
  findReservationById,
  findReservationByCodeInSession,
  findReservationByIdInSession,
  listReservations,
  releaseReservationRecord,
} from '@/repositories/reservation.repository';
import { releaseExpiredReservations } from '@/services/expiry.service';
import type { DashboardDTO, ReservationDTO } from '@/lib/domain';
import { mapDashboard } from '@/lib/mappers';

function buildReservationCode(): string {
  return `RES-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

export async function getDashboardData(): Promise<DashboardDTO> {
  await connectToDatabase();
  await releaseExpiredReservations();

  const [inventory, reservations, stats] = await Promise.all([
    listInventoryItems(),
    listReservations(DEFAULT_PAGE_SIZE),
    countReservationsByStatus(),
  ]);

  const inventoryValueCents = inventory.reduce((total, item) => total + item.availableQty * item.priceCents, 0);

  return mapDashboard(inventory, reservations, {
    ...stats,
    inventoryValueCents,
  });
}

export async function getInventoryOverview() {
  await connectToDatabase();
  await releaseExpiredReservations();
  return listInventoryItems();
}

export async function getReservationsOverview(limit = DEFAULT_PAGE_SIZE) {
  await connectToDatabase();
  await releaseExpiredReservations();
  return listReservations(limit);
}

export async function getReservationByIdentifier(identifier: string): Promise<ReservationDTO> {
  await connectToDatabase();
  const reservation = await findReservationById(identifier);
  const fallback = reservation ? reservation : await findReservationByCode(identifier);

  if (!fallback) {
    throw new NotFoundError('Reservation not found');
  }

  return mapReservation(fallback);
}

export async function createReservation(input: unknown): Promise<ReservationDTO> {
  const parsedInput = reservationCreateSchema.parse(input);
  await connectToDatabase();
  await releaseExpiredReservations();

  return withMongoTransaction(async (session) => {
    const inventory = await reserveInventoryUnits(session, parsedInput.sku, parsedInput.quantity);

    if (!inventory) {
      throw new ConflictError('Not enough inventory available for this reservation', 'INSUFFICIENT_STOCK');
    }

    const reservation = await createReservationRecord(session, {
      reservationCode: buildReservationCode(),
      customerName: parsedInput.customerName,
      customerEmail: parsedInput.customerEmail.toLowerCase(),
      sku: parsedInput.sku,
      quantity: parsedInput.quantity,
      unitPriceCents: inventory.priceCents,
      currency: inventory.currency || DEFAULT_CURRENCY,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      releaseReason: null,
      paymentReference: null,
      expiresAt: new Date(Date.now() + RESERVATION_WINDOW_MS),
      confirmedAt: null,
      releasedAt: null,
    });

    return mapReservation(reservation);
  });
}

export async function confirmReservation(identifier: string, input: unknown): Promise<ReservationDTO> {
  const parsedInput = paymentReferenceSchema.parse(input);
  await connectToDatabase();

  const existing = await findReservationById(identifier);
  const resolved = existing ?? (await findReservationByCode(identifier));

  if (!resolved) {
    throw new NotFoundError('Reservation not found');
  }

  if (resolved.status === 'CONFIRMED') {
    return mapReservation(resolved);
  }

  if (resolved.status === 'RELEASED') {
    throw new ConflictError('Released reservations cannot be confirmed', 'RESERVATION_RELEASED');
  }

  const now = new Date();

  if (resolved.expiresAt <= now) {
    throw new GoneError('Reservation has expired', 'RESERVATION_EXPIRED');
  }

  return withMongoTransaction(async (session) => {
    const reservation = await confirmReservationRecord(session, resolved._id.toString(), parsedInput.paymentReference ?? null);

    if (!reservation) {
      if (resolved.expiresAt <= new Date()) {
        throw new GoneError('Reservation has expired', 'RESERVATION_EXPIRED');
      }

      throw new ConflictError('Reservation is no longer confirmable', 'RESERVATION_NOT_PENDING');
    }

    const inventory = await confirmInventoryReservation(session, reservation.sku, reservation.quantity);

    if (!inventory) {
      throw new ConflictError('Inventory reservation ledger is inconsistent', 'INVENTORY_CONSISTENCY_ERROR');
    }

    return mapReservation(reservation);
  });
}

export async function releaseReservation(identifier: string, input: unknown): Promise<ReservationDTO> {
  const parsedInput = releaseReservationSchema.parse(input);
  await connectToDatabase();

  return withMongoTransaction(async (session) => {
    const resolved = (await findReservationByIdInSession(session, identifier)) ?? (await findReservationByCodeInSession(session, identifier));

    if (!resolved) {
      throw new NotFoundError('Reservation not found');
    }

    if (resolved.status === 'RELEASED') {
      return mapReservation(resolved);
    }

    if (resolved.status === 'CONFIRMED') {
      throw new ConflictError('Confirmed reservations cannot be released', 'RESERVATION_CONFIRMED');
    }

    const reservation = await releaseReservationRecord(session, resolved._id.toString(), 'FAILED', parsedInput.releaseReason ?? 'PAYMENT_FAILED');

    if (!reservation) {
      const latest = (await findReservationByIdInSession(session, resolved._id.toString())) ?? (await findReservationByCodeInSession(session, identifier));

      if (latest?.status === 'RELEASED') {
        return mapReservation(latest);
      }

      throw new ConflictError('Reservation is no longer releasable', 'RESERVATION_RELEASED');
    }

    const inventory = await releaseInventoryReservation(session, reservation.sku, reservation.quantity);

    if (!inventory) {
      throw new ConflictError('Inventory reservation ledger is inconsistent', 'INVENTORY_CONSISTENCY_ERROR');
    }

    return mapReservation(reservation);
  });
}

export async function releaseReservationByExpiry(identifier: string): Promise<ReservationDTO> {
  await connectToDatabase();

  return withMongoTransaction(async (session) => {
    const existing = (await findReservationByIdInSession(session, identifier)) ?? (await findReservationByCodeInSession(session, identifier));

    if (!existing) {
      throw new NotFoundError('Reservation not found');
    }

    if (existing.status === 'RELEASED') {
      return mapReservation(existing);
    }

    if (existing.status === 'CONFIRMED') {
      throw new ConflictError('Confirmed reservations are not expired', 'RESERVATION_CONFIRMED');
    }

    const reservation = await releaseReservationRecord(session, existing._id.toString(), 'FAILED', 'EXPIRED');

    if (!reservation) {
      const latest = (await findReservationByIdInSession(session, existing._id.toString())) ?? (await findReservationByCodeInSession(session, identifier));

      if (latest?.status === 'RELEASED') {
        return mapReservation(latest);
      }

      throw new ConflictError('Reservation already expired or released', 'RESERVATION_RELEASED');
    }

    const inventory = await releaseInventoryReservation(session, reservation.sku, reservation.quantity);

    if (!inventory) {
      throw new ConflictError('Inventory reservation ledger is inconsistent', 'INVENTORY_CONSISTENCY_ERROR');
    }

    return mapReservation(reservation);
  });
}
