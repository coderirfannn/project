import { Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { getOrCreateModel } from '@/models/model-factory';

const inventorySchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    currency: { type: String, required: true, default: 'USD', trim: true, uppercase: true, maxlength: 3 },
    priceCents: { type: Number, required: true, min: 0 },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    totalUnits: { type: Number, required: true, min: 0 },
    reservedUnits: { type: Number, required: true, min: 0, default: 0 },
    reorderPoint: { type: Number, required: true, min: 0, default: 0 },
    safetyStock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'inventories',
  },
);

inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ sku: 1, isActive: 1 }, { unique: true });
inventorySchema.index({ warehouse: 1, reservedUnits: -1 });
inventorySchema.index({ product: 1, isActive: 1 });

export type Inventory = InferSchemaType<typeof inventorySchema>;
export type InventoryDocument = HydratedDocument<Inventory>;

export const InventoryModel = getOrCreateModel('Inventory', inventorySchema);
