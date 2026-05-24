import { model, models, Schema } from 'mongoose';

const inventoryItemSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    currency: { type: String, required: true, default: 'USD', trim: true },
    priceCents: { type: Number, required: true, min: 0 },
    totalQty: { type: Number, required: true, min: 0 },
    availableQty: { type: Number, required: true, min: 0 },
    reservedQty: { type: Number, required: true, min: 0, default: 0 },
    soldQty: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const InventoryItemModel = models.InventoryItem || model('InventoryItem', inventoryItemSchema);
