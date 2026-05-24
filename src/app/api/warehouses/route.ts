import { withRouteHandler, jsonDataResponse } from '@/lib/route';
import { getWarehousesOverview } from '@/services/catalog.service';

export const GET = withRouteHandler(async () => {
  const warehouses = await getWarehousesOverview();
  return jsonDataResponse(warehouses);
});
