"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveCountdown } from '@/components/shared/live-countdown';
import type { ReservationDTO } from '@/lib/domain';
import { toApiErrorMessage, useReservationActionMutation, useReservationQuery } from '@/lib/react-query';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { CheckCircle2, Loader2, ShoppingBag, XCircle } from 'lucide-react';

function statusVariant(status: ReservationDTO['status']) {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'RELEASED') return 'destructive';
  return 'warning';
}

function isExpired(reservation: ReservationDTO | null) {
  return !!reservation && reservation.status === 'PENDING' && new Date(reservation.expiresAt).getTime() <= Date.now();
}

export function ReservationCheckoutClient({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const reservationQuery = useReservationQuery(reservationId);
  const reservation = reservationQuery.data ?? null;
  const confirmMutation = useReservationActionMutation('confirm');
  const releaseMutation = useReservationActionMutation('release');
  const [paymentReference, setPaymentReference] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservation) {
      return;
    }

    setPaymentReference(reservation.paymentReference ?? `PAY-${reservation.reservationCode.replace(/[^A-Z0-9]/gi, '').slice(-8)}`);
  }, [reservation]);

  const expired = isExpired(reservation);
  const canAct = !!reservation && reservation.status === 'PENDING' && !expired;
  const confirmPending = confirmMutation.isPending && confirmMutation.variables?.reservationId === reservationId;
  const releasePending = releaseMutation.isPending && releaseMutation.variables?.reservationId === reservationId;

  async function refreshReservation() {
    await reservationQuery.refetch();
  }

  async function handleAction(action: 'confirm' | 'cancel') {
    if (!reservation) {
      return;
    }

    setActionError(null);

    try {
      const nextReservation =
        action === 'confirm'
          ? await confirmMutation.mutateAsync({ reservationId, paymentReference })
          : await releaseMutation.mutateAsync({ reservationId, releaseReason: 'CUSTOMER_CANCELLED' });

      if (action === 'confirm') {
        setPaymentReference(nextReservation.paymentReference ?? paymentReference);
      }
    } catch (error) {
      setActionError(toApiErrorMessage(error, 'Reservation action failed'));
    }
  }

  if (reservationQuery.isLoading && !reservation) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <Skeleton className="h-5 w-40 bg-white/[0.08]" />
            <Skeleton className="h-4 w-64 bg-white/[0.08]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full bg-white/[0.08]" />
            <Skeleton className="h-10 w-full bg-white/[0.08]" />
            <Skeleton className="h-10 w-full bg-white/[0.08]" />
          </CardContent>
        </Card>
        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <Skeleton className="h-5 w-32 bg-white/[0.08]" />
            <Skeleton className="h-4 w-48 bg-white/[0.08]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 w-full bg-white/[0.08]" />
            <Skeleton className="h-10 w-full bg-white/[0.08]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((reservationQuery.error && !reservation) || (!reservation && !reservationQuery.isLoading)) {
    return (
      <Card className="surface-panel-dark mx-auto max-w-2xl text-white">
        <CardHeader>
          <p className="section-eyebrow text-slate-400">Checkout</p>
          <CardTitle className="font-display text-[1.15rem] tracking-[-0.02em] text-white">Checkout unavailable</CardTitle>
          <CardDescription className="text-slate-400">We could not load this reservation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="border-white/10 bg-red-500/10 text-red-200">
            {toApiErrorMessage(reservationQuery.error, 'Unable to load reservation')}
          </Alert>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void refreshReservation()} className="bg-white text-slate-950 hover:bg-slate-100">
              Retry
            </Button>
            <Button variant="outline" onClick={() => router.push('/products')}>
              Back to catalog
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reservation) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="space-y-4">
        <Card className="surface-panel-dark text-white">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="section-eyebrow text-slate-400">Reservation checkout</p>
                <CardTitle className="font-display text-[1.35rem] tracking-[-0.03em] text-white sm:text-[1.6rem]">Review and complete reservation</CardTitle>
                <CardDescription className="mt-1 max-w-2xl text-slate-400">
                  Confirm payment, cancel the hold, or leave the reservation to expire.
                </CardDescription>
              </div>
              <Badge variant={statusVariant(reservation.status)}>{reservation.status}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryChip label="Reservation" value={reservation.reservationCode} />
              <SummaryChip label="Expires in" value={<LiveCountdown expiresAt={reservation.expiresAt} className="font-mono text-sm font-semibold text-white" expiredLabel="Expired" />} />
              <SummaryChip label="Payment" value={reservation.paymentStatus} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-[0.85rem] border border-white/[0.08] bg-white/[0.04] p-2 text-white">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reserved item</p>
                  <h3 className="mt-1 text-lg font-medium text-white">{reservation.sku}</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Customer" value={reservation.customerName} />
                <StatCard label="Email" value={reservation.customerEmail} />
                <StatCard label="Quantity" value={String(reservation.quantity)} />
                <StatCard label="Unit price" value={formatCurrency(reservation.unitPriceCents, reservation.currency)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert variant={expired ? 'destructive' : 'default'} className="border-white/10 bg-white/[0.04] text-slate-200">
          {expired ? 'This reservation has expired. The cleanup job will release the stock if it has not already been processed.' : 'Keep this page open while payment is completed or the reservation is cancelled.'}
        </Alert>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <CardTitle className="font-display text-[1.05rem] tracking-[-0.02em] text-white">Actions</CardTitle>
            <CardDescription className="text-slate-400">Confirm or cancel the reservation. Actions are idempotent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionError ? <Alert variant="destructive">{actionError}</Alert> : null}
            {reservationQuery.error && reservation ? <Alert variant="destructive">{toApiErrorMessage(reservationQuery.error, 'Unable to refresh reservation')}</Alert> : null}

            <div className="space-y-2">
              <Label htmlFor="payment-reference" className="text-slate-400">
                Payment reference
              </Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                disabled={!canAct}
                placeholder="PAY-12345678"
                aria-describedby="payment-reference-hint"
              />
              <p id="payment-reference-hint" className="text-xs text-slate-500">
                Use the payment processor reference or keep the generated value.
              </p>
            </div>

            <Button className="w-full bg-white text-slate-950 hover:bg-slate-100" size="lg" onClick={() => void handleAction('confirm')} disabled={!canAct || confirmPending || releasePending}>
              {confirmPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Confirm reservation
            </Button>

            <Button className="w-full" size="lg" variant="destructive" onClick={() => void handleAction('cancel')} disabled={!canAct || confirmPending || releasePending}>
              {releasePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Cancel reservation
            </Button>

            <Button className="w-full" variant="outline" onClick={() => router.push('/products')}>
              Continue shopping
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <CardTitle className="font-display text-[1.05rem] tracking-[-0.02em] text-white">Timeline</CardTitle>
            <CardDescription className="text-slate-400">Reservation lifecycle in real time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <TimelineRow label="Created" value={formatDateTime(reservation.createdAt)} />
            <TimelineRow label="Expires" value={formatDateTime(reservation.expiresAt)} />
            <TimelineRow label="Confirmed" value={reservation.confirmedAt ? formatDateTime(reservation.confirmedAt) : 'Pending'} />
            <TimelineRow label="Released" value={reservation.releasedAt ? formatDateTime(reservation.releasedAt) : reservation.releaseReason ?? 'Pending'} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.03] px-3 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-sm">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium text-white">{value}</p>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}
