import { withRouteHandler, readJsonBody, resolveRouteParamId, jsonDataResponse } from '@/lib/route';
import { confirmReservation } from '@/services/reservation.service';

export const POST = withRouteHandler(async (request, context) => {
  const id = await resolveRouteParamId(context);
  const body = await readJsonBody<unknown>(request);
  const reservation = await confirmReservation(id, body);
  return jsonDataResponse(reservation);
});
