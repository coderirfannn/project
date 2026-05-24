import { connectToDatabase } from '@/lib/mongodb';
import { mapProduct, mapWarehouse } from '@/lib/mappers';
import { listProducts } from '@/repositories/product.repository';
import { listWarehouses } from '@/repositories/warehouse.repository';

export async function getProductsOverview() {
  await connectToDatabase();
  const products = await listProducts();
  return products.map(mapProduct);
}

export async function getWarehousesOverview() {
  await connectToDatabase();
  const warehouses = await listWarehouses();
  return warehouses.map(mapWarehouse);
}
