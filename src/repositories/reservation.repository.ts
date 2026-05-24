import type { ClientSession, Types } from 'mongoose';
import { ReservationModel } from '@/models/reservation';
import type { PaymentStatus, ReservationStatus } from '@/lib/domain';
import type { ReservationRecord } from '@/types/db';

export async function createReservationRecord(
  session: ClientSession,
  payload: Omit<ReservationRecord, '_id' | 'createdAt' | 'updatedAt'>,
): Promise<ReservationRecord> {
  const [reservation] = await ReservationModel.create([payload], { session });
  return reservation.toObject() as ReservationRecord;
}

export async function listReservations(limit = 25): Promise<ReservationRecord[]> {
  return ReservationModel.find().sort({ createdAt: -1 }).limit(limit).lean<ReservationRecord[]>();
}

export async function listExpiredPendingReservations(limit = 50): Promise<ReservationRecord[]> {
  return ReservationModel.find({
    status: 'PENDING',
    expiresAt: { $lte: new Date() },
  })
    .sort({ expiresAt: 1 })
    .limit(limit)
    .lean<ReservationRecord[]>();
}

export async function findReservationById(id: string): Promise<ReservationRecord | null> {
  return ReservationModel.findById(id).lean<ReservationRecord | null>();
}

export async function findReservationByCode(code: string): Promise<ReservationRecord | null> {
  return ReservationModel.findOne({ reservationCode: code }).lean<ReservationRecord | null>();
}

export async function findReservationByIdInSession(
  session: ClientSession,
  id: string,
): Promise<ReservationRecord | null> {
  return ReservationModel.findById(id).session(session).lean<ReservationRecord | null>();
}

export async function findReservationByCodeInSession(
  session: ClientSession,
  code: string,
): Promise<ReservationRecord | null> {
  return ReservationModel.findOne({ reservationCode: code }).session(session).lean<ReservationRecord | null>();
}

export async function confirmReservationRecord(
  session: ClientSession,
  id: string,
  paymentReference: string | null,
): Promise<ReservationRecord | null> {
  const now = new Date();

  return ReservationModel.findOneAndUpdate(
    { _id: id, status: 'PENDING', expiresAt: { $gt: now } },
    {
      $set: {
        status: 'CONFIRMED',
        paymentStatus: 'SUCCEEDED',
        paymentReference,
        confirmedAt: now,
      },
    },
    { new: true, session },
  ).lean<ReservationRecord | null>();
}

export async function releaseReservationRecord(
  session: ClientSession,
  id: string,
  paymentStatus: PaymentStatus,
  releaseReason: string,
): Promise<ReservationRecord | null> {
  const now = new Date();

  return ReservationModel.findOneAndUpdate(
    { _id: id, status: 'PENDING' },
    {
      $set: {
        status: 'RELEASED',
        paymentStatus,
        releaseReason,
        releasedAt: now,
      },
    },
    { new: true, session },
  ).lean<ReservationRecord | null>();
}

export async function releaseExpiredReservationRecord(
  session: ClientSession,
  reservationId: Types.ObjectId | string,
): Promise<ReservationRecord | null> {
  const now = new Date();

  return ReservationModel.findOneAndUpdate(
    { _id: reservationId, status: 'PENDING', expiresAt: { $lte: now } },
    {
      $set: {
        status: 'RELEASED',
        paymentStatus: 'FAILED',
        releaseReason: 'EXPIRED',
        releasedAt: now,
      },
    },
    { new: true, session },
  ).lean<ReservationRecord | null>();
}

export async function countReservationsByStatus(): Promise<{
  activeReservations: number;
  confirmedReservations: number;
  releasedReservations: number;
}> {
  const [activeReservations, confirmedReservations, releasedReservations] = await Promise.all([
    ReservationModel.countDocuments({ status: 'PENDING' }),
    ReservationModel.countDocuments({ status: 'CONFIRMED' }),
    ReservationModel.countDocuments({ status: 'RELEASED' }),
  ]);

  return {
    activeReservations,
    confirmedReservations,
    releasedReservations,
  };
}
