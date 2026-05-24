import { Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { getOrCreateModel } from '@/models/model-factory';

export const reservationStatuses = ['PENDING', 'CONFIRMED', 'RELEASED'] as const;

const reservationSchema = new Schema(
  {
    reservationCode: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true, maxlength: 48 },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    inventory: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 160 },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, index: true, maxlength: 180 },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: reservationStatuses,
      default: 'PENDING',
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    confirmedAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
    releaseReason: { type: String, default: null, trim: true, maxlength: 120 },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'reservations',
  },
);

reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ product: 1, warehouse: 1, createdAt: -1 });
reservationSchema.index({ customerEmail: 1, createdAt: -1 });

export type Reservation = InferSchemaType<typeof reservationSchema>;
export type ReservationDocument = HydratedDocument<Reservation>;

export const ReservationModel = getOrCreateModel('Reservation', reservationSchema);
