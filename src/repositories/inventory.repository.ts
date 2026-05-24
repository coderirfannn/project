import type { ClientSession } from 'mongoose';
import { InventoryModel } from '@/models/inventory.schema';
import type { InventoryItemDTO } from '@/lib/domain';
import type { InventoryItemRecord } from '@/types/db';

export async function listInventoryItems(): Promise<InventoryItemRecord[]> {
  return InventoryModel.find({ isActive: true }).sort({ createdAt: -1 }).lean<InventoryItemRecord[]>();
}

export async function findInventoryBySku(sku: string): Promise<InventoryItemRecord | null> {
  return InventoryModel.findOne({ sku }).lean<InventoryItemRecord | null>();
}

export async function reserveInventoryUnits(
  session: ClientSession,
  sku: string,
  quantity: number,
): Promise<InventoryItemRecord | null> {
  return InventoryModel.findOneAndUpdate(
    {
      sku,
      isActive: true,
      $expr: {
        $gte: [{ $subtract: ['$totalUnits', '$reservedUnits'] }, quantity],
      },
    },
    { $inc: { reservedUnits: quantity } },
    { new: true, session },
  ).lean<InventoryItemRecord | null>();
}

export async function releaseInventoryReservation(
  session: ClientSession,
  sku: string,
  quantity: number,
): Promise<InventoryItemRecord | null> {
  return InventoryModel.findOneAndUpdate(
    { sku, reservedUnits: { $gte: quantity } },
    { $inc: { reservedUnits: -quantity } },
    { new: true, session },
  ).lean<InventoryItemRecord | null>();
}

export async function confirmInventoryReservation(
  session: ClientSession,
  sku: string,
  quantity: number,
): Promise<InventoryItemRecord | null> {
  return InventoryModel.findOneAndUpdate(
    { sku, reservedUnits: { $gte: quantity }, totalUnits: { $gte: quantity } },
    { $inc: { totalUnits: -quantity, reservedUnits: -quantity } },
    { new: true, session },
  ).lean<InventoryItemRecord | null>();
}

export async function seedInventoryItems(items: Array<{
  sku: string;
  name: string;
  description: string;
  currency: string;
  priceCents: number;
  totalQty: number;
  availableQty?: number;
}>): Promise<void> {
  await InventoryModel.deleteMany({});
  await InventoryModel.insertMany(
    items.map((item) => ({
      sku: item.sku,
      name: item.name,
      description: item.description,
      currency: item.currency,
      priceCents: item.priceCents,
      product: new InventoryModel.base.Types.ObjectId(),
      warehouse: new InventoryModel.base.Types.ObjectId(),
      totalUnits: item.totalQty,
      reservedUnits: 0,
      reorderPoint: 0,
      safetyStock: 0,
      isActive: true,
    })),
  );
}
