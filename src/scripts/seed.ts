import { connectToDatabase } from '@/lib/mongodb';
import { seedInventoryItems } from '@/repositories/inventory.repository';

async function main() {
  await connectToDatabase();

  await seedInventoryItems([
    {
      sku: 'SKU-IRON-24',
      name: 'Ironline Workstation',
      description: 'A durable workstation for heavy operational workloads.',
      currency: 'USD',
      priceCents: 129900,
      totalQty: 12,
      availableQty: 12,
    },
    {
      sku: 'SKU-AERO-12',
      name: 'AeroEdge Monitor',
      description: 'Ultra-clear 27-inch display for control rooms and analysts.',
      currency: 'USD',
      priceCents: 34900,
      totalQty: 20,
      availableQty: 20,
    },
    {
      sku: 'SKU-CORE-09',
      name: 'CoreVault Scanner',
      description: 'Secure scanning unit for fast intake and fulfillment checks.',
      currency: 'USD',
      priceCents: 18900,
      totalQty: 40,
      availableQty: 40,
    },
  ]);

  console.log('Seeded inventory items successfully');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
