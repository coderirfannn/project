import type { Types } from 'mongoose';
import type { PaymentStatus, ReservationStatus } from '@/lib/domain';

export interface ProductRecord {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseRecord {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemRecord {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationRecord {
  _id: Types.ObjectId;
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
  expiresAt: Date;
  confirmedAt: Date | null;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
