"use client";

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ReservationCountdown } from '@/components/dashboard/reservation-countdown';
import type { DashboardDTO, ReservationDTO } from '@/lib/domain';
import { toApiErrorMessage, useCreateReservationMutation, useDashboardQuery, useReservationActionMutation } from '@/lib/react-query';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Clock3, Package, ShieldCheck, Sparkles, TimerReset, TriangleAlert } from 'lucide-react';

type FormState = {
  customerName: string;
  customerEmail: string;
  sku: string;
  quantity: number;
};

type ToastState = {
  kind: 'success' | 'error' | 'info';
  message: string;
} | null;

function statusBadgeVariant(status: ReservationDTO['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'success';
    case 'RELEASED':
      return 'destructive';
    default:
      return 'warning';
  }
}

function reservationSummaryColor(status: ReservationDTO['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    case 'RELEASED':
      return 'bg-red-50 text-red-900 border-red-200';
    default:
      return 'bg-amber-50 text-amber-900 border-amber-200';
  }
}

export function InventoryReservationDashboard({ initialDashboard }: { initialDashboard: DashboardDTO }) {
  const dashboardQuery = useDashboardQuery(initialDashboard);
  const dashboard = dashboardQuery.data ?? initialDashboard;
  const createReservationMutation = useCreateReservationMutation();
  const confirmReservationMutation = useReservationActionMutation('confirm');
  const releaseReservationMutation = useReservationActionMutation('release');
  const [toast, setToast] = useState<ToastState>(null);
  const [form, setForm] = useState<FormState>({
    customerName: '',
    customerEmail: '',
    sku: initialDashboard.inventory[0]?.sku ?? '',
    quantity: 1,
  });

  const selectedInventory = useMemo(
    () => dashboard.inventory.find((item) => item.sku === form.sku) ?? dashboard.inventory[0] ?? null,
    [dashboard.inventory, form.sku],
  );

  useEffect(() => {
    if (!form.sku && dashboard.inventory[0]) {
      setForm((current) => ({ ...current, sku: dashboard.inventory[0].sku }));
    }
  }, [dashboard.inventory, form.sku]);

  async function refreshDashboard() {
    try {
      await dashboardQuery.refetch();
    } catch {
      setToast({ kind: 'error', message: 'Unable to refresh dashboard right now.' });
    }
  }

  async function handleCreateReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedInventory || selectedInventory.availableQty <= 0) {
      setToast({ kind: 'error', message: 'No available stock for the selected item.' });
      return;
    }

    try {
      await createReservationMutation.mutateAsync(form);
      setToast({ kind: 'success', message: 'Reservation created successfully.' });
      setForm((current) => ({
        ...current,
        customerName: '',
        customerEmail: '',
        quantity: 1,
      }));
      await dashboardQuery.refetch();
    } catch (error) {
      setToast({ kind: 'error', message: toApiErrorMessage(error, 'Reservation request failed.') });
    }
  }

  async function handleReservationAction(id: string, action: 'confirm' | 'release') {
    try {
      await (action === 'confirm'
        ? confirmReservationMutation.mutateAsync({ reservationId: id, paymentReference: `PAY-${id.slice(0, 8).toUpperCase()}` })
        : releaseReservationMutation.mutateAsync({ reservationId: id, releaseReason: 'PAYMENT_FAILED' }));

      setToast({
        kind: 'success',
        message: action === 'confirm' ? 'Reservation confirmed and inventory committed.' : 'Reservation released and stock restored.',
      });
      await dashboardQuery.refetch();
    } catch (error) {
      setToast({ kind: 'error', message: toApiErrorMessage(error, 'Reservation action failed.') });
    }
  }

  const totalAvailable = dashboard.inventory.reduce((sum, item) => sum + item.availableQty, 0);
  const totalReserved = dashboard.inventory.reduce((sum, item) => sum + item.reservedQty, 0);
  const totalSold = dashboard.inventory.reduce((sum, item) => sum + item.soldQty, 0);
  const confirmReservationId = confirmReservationMutation.variables?.reservationId;
  const releaseReservationId = releaseReservationMutation.variables?.reservationId;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-0">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em]">Reservation engine</span>
            </div>
            <div className="max-w-3xl space-y-3">
              <CardTitle className="text-3xl sm:text-4xl">Concurrency-safe inventory reservations with MongoDB transactions.</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Reservations lock stock for 10 minutes. If payment succeeds, stock is committed. If payment fails or expires, inventory is restored atomically.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={<Package className="h-4 w-4" />} label="Available units" value={String(totalAvailable)} subtext="Live inventory pool" />
              <MetricCard icon={<TimerReset className="h-4 w-4" />} label="Reserved units" value={String(totalReserved)} subtext="Countdown active" />
              <MetricCard icon={<ShieldCheck className="h-4 w-4" />} label="Committed units" value={String(totalSold)} subtext="Payment confirmed" />
              <MetricCard icon={<Clock3 className="h-4 w-4" />} label="Inventory value" value={formatCurrency(dashboard.stats.inventoryValueCents)} subtext="Available stock at cost" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-950 text-white shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-white">Create reservation</CardTitle>
            <CardDescription className="text-slate-300">
              Reserve one or more units with atomic stock checks. The server rejects oversell attempts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateReservation}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="customerName">
                    Customer name
                  </Label>
                  <Input
                    id="customerName"
                    value={form.customerName}
                    onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                    placeholder="Alex Carter"
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="customerEmail">
                    Email address
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                    placeholder="alex@company.com"
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="sku">
                    Inventory item
                  </Label>
                  <select
                    id="sku"
                    value={form.sku}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sku: event.target.value,
                        quantity: 1,
                      }))
                    }
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm outline-none ring-0 transition-colors focus:border-emerald-400"
                  >
                    {dashboard.inventory.map((item) => (
                      <option key={item.id} value={item.sku} className="text-slate-900">
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="quantity">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedInventory?.availableQty ?? 1}
                    value={form.quantity}
                    onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {selectedInventory ? (
                  <div className="space-y-1">
                    <p className="font-medium text-white">{selectedInventory.name}</p>
                    <p>
                      {selectedInventory.availableQty} available, {selectedInventory.reservedQty} reserved, {formatCurrency(selectedInventory.priceCents)} each
                    </p>
                  </div>
                ) : (
                  <p>No inventory configured yet. Run the seed script or connect your own collection.</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400" disabled={createReservationMutation.isPending || !dashboard.inventory.length}>
                {createReservationMutation.isPending ? 'Reserving stock...' : 'Reserve inventory'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active reservations" value={String(dashboard.stats.activeReservations)} description="Pending release countdowns" />
        <StatCard label="Confirmed reservations" value={String(dashboard.stats.confirmedReservations)} description="Committed after payment" />
        <StatCard label="Released reservations" value={String(dashboard.stats.releasedReservations)} description="Expired or payment failed" />
        <StatCard label="Refresh status" value={dashboardQuery.isFetching ? 'Syncing' : 'Live'} description="Auto-refreshes every 15 seconds" />
      </section>

      {dashboardQuery.error ? (
        <Alert variant="destructive">
          <div className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4" />
            <p>{toApiErrorMessage(dashboardQuery.error, 'Unable to refresh dashboard right now.')}</p>
          </div>
        </Alert>
      ) : null}

      {toast ? (
        <Alert variant={toast.kind === 'error' ? 'destructive' : toast.kind === 'success' ? 'success' : 'default'}>
          <div className="flex items-start gap-2">
            {toast.kind === 'error' ? <TriangleAlert className="mt-0.5 h-4 w-4" /> : <Sparkles className="mt-0.5 h-4 w-4" />}
            <p>{toast.message}</p>
          </div>
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {dashboard.inventory.map((item) => (
          <Card key={item.id} className="border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.sku}</CardDescription>
                </div>
                <Badge variant={item.availableQty > 0 ? 'success' : 'destructive'}>{item.availableQty > 0 ? 'In stock' : 'Empty'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{item.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Available</span>
                  <span className="font-semibold text-slate-900">{item.availableQty}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-slate-900"
                    style={{ width: `${Math.max(8, (item.availableQty / Math.max(1, item.totalQty)) * 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <div className="font-semibold text-slate-900">{item.totalQty}</div>
                    Total
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <div className="font-semibold text-slate-900">{item.reservedQty}</div>
                    Reserved
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <div className="font-semibold text-slate-900">{item.soldQty}</div>
                    Sold
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Unit price</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.priceCents, item.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Reservations</h2>
            <p className="text-sm text-slate-600">Live queue with countdown and payment actions.</p>
          </div>
          <Button variant="outline" onClick={() => void refreshDashboard()} disabled={dashboardQuery.isFetching}>
            {dashboardQuery.isFetching ? 'Refreshing...' : 'Refresh now'}
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft backdrop-blur-xl">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            <div className="col-span-12 sm:col-span-3">Reservation</div>
            <div className="col-span-12 sm:col-span-2">Customer</div>
            <div className="col-span-4 sm:col-span-2">Item</div>
            <div className="col-span-4 sm:col-span-1">Qty</div>
            <div className="col-span-4 sm:col-span-1">Status</div>
            <div className="col-span-6 sm:col-span-1">Expires</div>
            <div className="col-span-6 sm:col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard.reservations.length > 0 ? (
              dashboard.reservations.map((reservation) => (
                <div key={reservation.id} className={`grid grid-cols-12 gap-4 px-5 py-4 text-sm ${reservationSummaryColor(reservation.status)}`}>
                  <div className="col-span-12 sm:col-span-3">
                    <div className="font-semibold text-slate-950">{reservation.reservationCode}</div>
                    <div className="mt-1 text-xs text-slate-500">Created {formatDateTime(reservation.createdAt)}</div>
                  </div>
                  <div className="col-span-12 sm:col-span-2">
                    <div className="font-medium text-slate-900">{reservation.customerName}</div>
                    <div className="text-xs text-slate-500">{reservation.customerEmail}</div>
                  </div>
                  <div className="col-span-4 sm:col-span-2 font-medium text-slate-900">{reservation.sku}</div>
                  <div className="col-span-4 sm:col-span-1 font-mono text-slate-900">{reservation.quantity}</div>
                  <div className="col-span-4 sm:col-span-1">
                    <Badge variant={statusBadgeVariant(reservation.status)}>{reservation.status}</Badge>
                  </div>
                  <div className="col-span-6 sm:col-span-1 font-mono text-slate-900">
                    <ReservationCountdown expiresAt={reservation.expiresAt} status={reservation.status} />
                  </div>
                  <div className="col-span-6 flex items-center justify-end gap-2 sm:col-span-2">
                    {reservation.status === 'PENDING' ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => void handleReservationAction(reservation.id, 'confirm')} disabled={confirmReservationId === reservation.id && confirmReservationMutation.isPending}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => void handleReservationAction(reservation.id, 'release')} disabled={releaseReservationId === reservation.id && releaseReservationMutation.isPending}>
                          Release
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">{reservation.status === 'CONFIRMED' ? 'Committed' : `Released ${reservation.releaseReason ?? 'manually'}`}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No reservations yet. Create one from the form to exercise the workflow.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, subtext }: { icon: ReactNode; label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-emerald-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold text-slate-950">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{subtext}</p>
    </div>
  );
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <Card className="border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold text-slate-950">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
