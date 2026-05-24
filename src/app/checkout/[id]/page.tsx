import { ReservationCheckoutClient } from '@/components/shared/reservation-checkout-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ReservationCheckoutClient reservationId={resolvedParams.id} />;
}
