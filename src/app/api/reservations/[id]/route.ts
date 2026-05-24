import { withRouteHandler, resolveRouteParamId, jsonDataResponse } from '@/lib/route';
import { getReservationByIdentifier } from '@/services/reservation.service';

export const GET = withRouteHandler(async (_request, context) => {
  const id = await resolveRouteParamId(context);
  const reservation = await getReservationByIdentifier(id);
  return jsonDataResponse(reservation);
});
