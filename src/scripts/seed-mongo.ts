import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/product.schema';
import { WarehouseModel } from '@/models/warehouse.schema';
import { InventoryModel } from '@/models/inventory.schema';
import { logger } from '@/lib/logger';

type SeedOptions = {
  dryRun?: boolean;
  force?: boolean;
};

async function upsertProducts(products: Array<any>, options: SeedOptions = {}) {
  const ops = products.map((p) => ({
    updateOne: {
      filter: { sku: p.sku },
      update: { $set: p },
      upsert: true,
    },
  }));

  if (options.dryRun) {
    logger.info('Dry run - product upsert operations prepared', { count: ops.length });
    return [];
  }

  await ProductModel.bulkWrite(ops, { ordered: false });
  return ProductModel.find({ sku: { $in: products.map((p) => p.sku) } }).lean();
}

async function upsertWarehouses(warehouses: Array<any>, options: SeedOptions = {}) {
  const ops = warehouses.map((w) => ({
    updateOne: {
      filter: { code: w.code },
      update: { $set: w },
      upsert: true,
    },
  }));

  if (options.dryRun) {
    logger.info('Dry run - warehouse upsert operations prepared', { count: ops.length });
    return [];
  }

  await WarehouseModel.bulkWrite(ops, { ordered: false });
  return WarehouseModel.find({ code: { $in: warehouses.map((w) => w.code) } }).lean();
}

async function upsertInventories(inventories: Array<any>, options: SeedOptions = {}) {
  const ops = inventories.map((inv) => ({
    updateOne: {
      filter: { sku: inv.sku },
      update: { $set: inv },
      upsert: true,
    },
  }));

  if (options.dryRun) {
    logger.info('Dry run - inventory upsert operations prepared', { count: ops.length });
    return [];
  }

  await InventoryModel.bulkWrite(ops, { ordered: false });
  return InventoryModel.find({ sku: { $in: inventories.map((i) => i.sku) } }).lean();
}

export async function seedAll(options: SeedOptions = {}) {
  if (process.env.NODE_ENV === 'production' && !options.force && process.env.SEED_FORCE !== 'true') {
    throw new Error('Refusing to run seed in production environment without --force or SEED_FORCE=true');
  }

  await connectToDatabase();

  // Sample realistic ecommerce data
  const sampleWarehouses = [
    {
      code: 'WH-EAST',
      name: 'East Coast Fulfillment',
      description: 'Primary fulfillment center serving the east coast.',
      address: {
        line1: '120 Logistics Way',
        line2: null,
        city: 'Newark',
        state: 'NJ',
        postalCode: '07114',
        country: 'US',
      },
      timezone: 'America/New_York',
      capacityUnits: 50000,
      isActive: true,
    },
    {
      code: 'WH-WEST',
      name: 'West Coast Hub',
      description: 'Secondary center with expedited shipping options.',
      address: {
        line1: '450 Harbor Road',
        line2: 'Suite B',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90012',
        country: 'US',
      },
      timezone: 'America/Los_Angeles',
      capacityUnits: 42000,
      isActive: true,
    },
    {
      code: 'WH-EU',
      name: 'EU Distribution',
      description: 'European distribution center (low-latency shipping).',
      address: {
        line1: 'Baker Street 221B',
        line2: null,
        city: 'London',
        state: null,
        postalCode: 'NW1 6XE',
        country: 'GB',
      },
      timezone: 'Europe/London',
      capacityUnits: 30000,
      isActive: true,
    },
  ];

  const sampleProducts = [
    {
      sku: 'TS-1001',
      name: 'Trailblazer Running Shoes',
      description: 'Lightweight performance running shoes for daily training.',
      category: 'Footwear',
      brand: 'TrailCo',
      currency: 'USD',
      priceCents: 8999,
      barcode: '0123456789012',
      attributes: { color: 'Black', sizeRange: '6-12' },
      isActive: true,
    },
    {
      sku: 'BK-2207',
      name: 'EverGreen Water Bottle 1L',
      description: 'Insulated stainless steel water bottle keeps liquids cold for 24h.',
      category: 'Accessories',
      brand: 'EverGreen',
      currency: 'USD',
      priceCents: 2499,
      barcode: '0987654321098',
      attributes: { color: 'Teal', capacity: '1L' },
      isActive: true,
    },
    {
      sku: 'JR-5012',
      name: 'Journey Backpack 30L',
      description: 'Durable travel backpack with laptop sleeve and multiple compartments.',
      category: 'Bags',
      brand: 'Nomad',
      currency: 'USD',
      priceCents: 7499,
      barcode: '1122334455667',
      attributes: { color: 'Olive', capacity: '30L' },
      isActive: true,
    },
    {
      sku: 'HD-8800',
      name: 'Home Desk Lamp',
      description: 'LED desk lamp with adjustable brightness and warm/cool modes.',
      category: 'Home',
      brand: 'Lumina',
      currency: 'USD',
      priceCents: 3999,
      barcode: '2233445566778',
      attributes: { color: 'White', watts: 7 },
      isActive: true,
    },
  ];

  // Upsert warehouses and products
  const createdWarehouses = await upsertWarehouses(sampleWarehouses, options);
  const createdProducts = await upsertProducts(sampleProducts, options);

  // Map for quick lookup
  const warehouseMap = new Map<string, any>();
  (createdWarehouses || []).forEach((w: any) => warehouseMap.set(w.code, w));

  const productMap = new Map<string, any>();
  (createdProducts || []).forEach((p: any) => productMap.set(p.sku, p));

  // Build inventory entries combining products x warehouses
  const inventoryEntries: Array<any> = [];

  for (const p of sampleProducts) {
    for (const w of sampleWarehouses) {
      const productDoc = productMap.get(p.sku);
      const warehouseDoc = warehouseMap.get(w.code);
      if (!productDoc || !warehouseDoc) continue;

      const sku = `${p.sku}-${w.code}`;

      // realistic stock numbers
      const totalUnits = Math.floor(20 + Math.random() * 180);
      const reservedUnits = Math.floor(Math.random() * 5);
      const reorderPoint = Math.floor(totalUnits * 0.2);
      const safetyStock = Math.max(2, Math.floor(totalUnits * 0.05));

      inventoryEntries.push({
        sku,
        name: p.name,
        description: p.description,
        currency: p.currency,
        priceCents: p.priceCents,
        product: productDoc._id,
        warehouse: warehouseDoc._id,
        totalUnits,
        reservedUnits,
        reorderPoint,
        safetyStock,
        isActive: true,
      });
    }
  }

  await upsertInventories(inventoryEntries, options);

  logger.info('Seeding complete', { products: sampleProducts.length, warehouses: sampleWarehouses.length, inventory: inventoryEntries.length });
}

// CLI runner
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const force = args.includes('--force') || process.env.SEED_FORCE === 'true';

    try {
      if (process.env.NODE_ENV === 'production' && !force) {
        console.error('Refusing to run seed in production without --force or environment variable SEED_FORCE=true');
        process.exit(1);
      }

      await seedAll({ dryRun, force });
      await disconnectFromDatabase();
      console.log('Seed finished');
      process.exit(0);
    } catch (error) {
      console.error('Seed failed:', error instanceof Error ? error.message : error);
      await disconnectFromDatabase().catch(() => undefined);
      process.exit(1);
    }
  })();
}
