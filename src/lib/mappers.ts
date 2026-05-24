import type { DashboardDTO, InventoryItemDTO, ProductDTO, ReservationDTO, WarehouseDTO } from '@/lib/domain';
import type { InventoryItemRecord, ProductRecord, ReservationRecord, WarehouseRecord } from '@/types/db';

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return (value instanceof Date ? value : new Date(value)).toISOString();
}

export function mapInventoryItem(record: InventoryItemRecord): InventoryItemDTO {
  return {
    id: record._id.toString(),
    sku: record.sku,
    name: record.name,
    description: record.description,
    currency: record.currency,
    priceCents: record.priceCents,
    totalQty: record.totalQty,
    availableQty: record.availableQty,
    reservedQty: record.reservedQty,
    soldQty: record.soldQty,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapProduct(record: ProductRecord): ProductDTO {
  return {
    id: record._id.toString(),
    sku: record.sku,
    name: record.name,
    description: record.description,
    category: record.category,
    brand: record.brand,
    currency: record.currency,
    priceCents: record.priceCents,
    barcode: record.barcode,
    attributes: record.attributes,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapWarehouse(record: WarehouseRecord): WarehouseDTO {
  return {
    id: record._id.toString(),
    code: record.code,
    name: record.name,
    description: record.description,
    address: {
      line1: record.address.line1,
      line2: record.address.line2,
      city: record.address.city,
      state: record.address.state,
      postalCode: record.address.postalCode,
      country: record.address.country,
    },
    timezone: record.timezone,
    capacityUnits: record.capacityUnits,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapReservation(record: ReservationRecord): ReservationDTO {
  return {
    id: record._id.toString(),
    reservationCode: record.reservationCode,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    sku: record.sku,
    quantity: record.quantity,
    unitPriceCents: record.unitPriceCents,
    currency: record.currency,
    status: record.status,
    paymentStatus: record.paymentStatus,
    releaseReason: record.releaseReason,
    paymentReference: record.paymentReference,
    expiresAt: record.expiresAt.toISOString(),
    confirmedAt: toIso(record.confirmedAt),
    releasedAt: toIso(record.releasedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapDashboard(
  inventory: InventoryItemRecord[],
  reservations: ReservationRecord[],
  stats: DashboardDTO['stats'],
): DashboardDTO {
  return {
    inventory: inventory.map(mapInventoryItem),
    reservations: reservations.map(mapReservation),
    stats,
  };
}
