import { WarehouseModel } from '@/models/warehouse.schema';
import type { WarehouseRecord } from '@/types/db';

export async function listWarehouses(): Promise<WarehouseRecord[]> {
  return WarehouseModel.find({ isActive: true }).sort({ createdAt: -1 }).lean<WarehouseRecord[]>();
}
