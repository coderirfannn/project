import { Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { getOrCreateModel } from '@/models/model-factory';

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, index: true, maxlength: 120 },
    brand: { type: String, default: null, trim: true, maxlength: 120 },
    currency: { type: String, required: true, default: 'USD', trim: true, uppercase: true, maxlength: 3 },
    priceCents: { type: Number, required: true, min: 0 },
    barcode: { type: String, default: null, trim: true, sparse: true, index: true, maxlength: 64 },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'products',
  },
);

productSchema.index({ category: 1, isActive: 1, updatedAt: -1 });
productSchema.index({ brand: 1, isActive: 1 });

export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

export const ProductModel = getOrCreateModel('Product', productSchema);
