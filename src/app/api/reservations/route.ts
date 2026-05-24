import { withRouteHandler, readJsonBody } from '@/lib/route';
import { jsonDataResponse } from '@/lib/route';
import { createReservation, getReservationsOverview } from '@/services/reservation.service';

export const GET = withRouteHandler(async () => {
  const reservations = await getReservationsOverview();
  return jsonDataResponse(reservations);
});

export const POST = withRouteHandler(async (request) => {
  const body = await readJsonBody<unknown>(request);
  const reservation = await createReservation(body);
  return jsonDataResponse(reservation, 201);
});
