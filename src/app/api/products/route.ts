import { withRouteHandler } from '@/lib/route';
import { jsonDataResponse } from '@/lib/route';
import { getProductsOverview } from '@/services/catalog.service';

export const GET = withRouteHandler(async () => {
  const products = await getProductsOverview();
  return jsonDataResponse(products);
});
