import { withRouteHandler, jsonDataResponse } from '@/lib/route';
import { getInventoryOverview } from '@/services/reservation.service';

export const GET = withRouteHandler(async () => {
  const inventory = await getInventoryOverview();
  return jsonDataResponse(inventory);
});
