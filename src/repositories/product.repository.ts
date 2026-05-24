import { ProductModel } from '@/models/product.schema';
import type { ProductRecord } from '@/types/db';

export async function listProducts(): Promise<ProductRecord[]> {
  return ProductModel.find({ isActive: true }).sort({ createdAt: -1 }).lean<ProductRecord[]>();
}
