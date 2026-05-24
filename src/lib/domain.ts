export const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'RELEASED'] as const;
export const PAYMENT_STATUSES = ['PENDING', 'SUCCEEDED', 'FAILED'] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string | null;
  currency: string;
  priceCents: number;
  barcode: string | null;
  attributes: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
  };
  timezone: string;
  capacityUnits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemDTO {
  id: string;
  sku: string;
  name: string;
  description: string;
  currency: string;
  priceCents: number;
  totalQty: number;
  availableQty: number;
  reservedQty: number;
  soldQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationDTO {
  id: string;
  reservationCode: string;
  customerName: string;
  customerEmail: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  releaseReason: string | null;
  paymentReference: string | null;
  expiresAt: string;
  confirmedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardDTO {
  inventory: InventoryItemDTO[];
  reservations: ReservationDTO[];
  stats: {
    activeReservations: number;
    confirmedReservations: number;
    releasedReservations: number;
    inventoryValueCents: number;
  };
}
