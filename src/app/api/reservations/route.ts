import { NextResponse } from 'next/server';
import { withRouteHandler, readJsonBody } from '@/lib/route';
import { createReservation, getReservationsOverview } from '@/services/reservation.service';

export const GET = withRouteHandler(async () => {
  const reservations = await getReservationsOverview();
  return NextResponse.json({ data: reservations }, { status: 200 });
});

export const POST = withRouteHandler(async (request) => {
  const body = await readJsonBody<unknown>(request);
  const reservation = await createReservation(body);
  return NextResponse.json({ data: reservation }, { status: 201 });
});
