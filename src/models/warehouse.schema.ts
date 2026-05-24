import { Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { getOrCreateModel } from '@/models/model-factory';

const warehouseAddressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true, maxlength: 180 },
    line2: { type: String, default: null, trim: true, maxlength: 180 },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    state: { type: String, default: null, trim: true, maxlength: 120 },
    postalCode: { type: String, required: true, trim: true, maxlength: 24 },
    country: { type: String, required: true, trim: true, uppercase: true, maxlength: 2 },
  },
  { _id: false },
);

const warehouseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true, maxlength: 40 },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: null, trim: true, maxlength: 2000 },
    address: { type: warehouseAddressSchema, required: true },
    timezone: { type: String, required: true, default: 'UTC', trim: true, maxlength: 64 },
    capacityUnits: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'warehouses',
  },
);

warehouseSchema.index({ 'address.country': 1, isActive: 1 });
warehouseSchema.index({ 'address.city': 1, isActive: 1 });

export type Warehouse = InferSchemaType<typeof warehouseSchema>;
export type WarehouseDocument = HydratedDocument<Warehouse>;

export const WarehouseModel = getOrCreateModel('Warehouse', warehouseSchema);
