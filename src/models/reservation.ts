import { model, models, Schema } from 'mongoose';

const reservationSchema = new Schema(
  {
    reservationCode: { type: String, required: true, unique: true, index: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    sku: { type: String, required: true, index: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD', trim: true },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'CONFIRMED', 'RELEASED'],
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['PENDING', 'SUCCEEDED', 'FAILED'],
      index: true,
    },
    releaseReason: { type: String, default: null, trim: true },
    paymentReference: { type: String, default: null, trim: true },
    expiresAt: { type: Date, required: true, index: true },
    confirmedAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ sku: 1, createdAt: -1 });

export const ReservationModel = models.Reservation || model('Reservation', reservationSchema);
