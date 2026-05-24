"use client";

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      return 'bg-emerald-500/8';
    case 'RELEASED':
      return 'bg-red-500/8';
    default:
      return 'bg-amber-500/8';
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
      <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="surface-panel-dark text-white">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-eyebrow text-slate-400">Overview</p>
                <CardTitle className="font-display text-[1.35rem] tracking-[-0.03em] text-white sm:text-[1.55rem]">Inventory reservation control</CardTitle>
                <CardDescription className="max-w-2xl text-slate-400">
                  Operational dashboard for atomic reservation, confirmation, and release flows.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-slate-300">
                {dashboardQuery.isFetching ? 'Syncing' : 'Live'}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile icon={<Package className="h-4 w-4" />} label="Available" value={String(totalAvailable)} />
              <StatTile icon={<TimerReset className="h-4 w-4" />} label="Reserved" value={String(totalReserved)} />
              <StatTile icon={<ShieldCheck className="h-4 w-4" />} label="Sold" value={String(totalSold)} />
              <StatTile icon={<Clock3 className="h-4 w-4" />} label="Value" value={formatCurrency(dashboard.stats.inventoryValueCents)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricChip label="Active reservations" value={dashboard.stats.activeReservations} />
              <MetricChip label="Confirmed reservations" value={dashboard.stats.confirmedReservations} />
              <MetricChip label="Released reservations" value={dashboard.stats.releasedReservations} />
              <MetricChip label="Refresh status" value={dashboardQuery.isFetching ? 1 : 0} valueLabel={dashboardQuery.isFetching ? 'Syncing' : 'Live'} />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <CardTitle className="font-display text-[1.05rem] tracking-[-0.02em] text-white">Create reservation</CardTitle>
            <CardDescription className="text-slate-400">Fast entry form for new stock holds.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateReservation}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-400" htmlFor="customerName">
                    Customer name
                  </Label>
                  <Input
                    id="customerName"
                    value={form.customerName}
                    onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                    placeholder="Alex Carter"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400" htmlFor="customerEmail">
                    Email address
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                    placeholder="alex@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1.15fr_0.7fr]">
                <div className="space-y-2">
                  <Label className="text-slate-400" htmlFor="sku">
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
                    className="flex h-9 w-full rounded-[0.8rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-100 outline-none transition-colors focus:border-white/20"
                  >
                    {dashboard.inventory.map((item) => (
                      <option key={item.id} value={item.sku} className="text-slate-900">
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400" htmlFor="quantity">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedInventory?.availableQty ?? 1}
                    value={form.quantity}
                    onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-slate-300">
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

              <Button type="submit" size="lg" className="w-full bg-white text-slate-950 hover:bg-slate-100" disabled={createReservationMutation.isPending || !dashboard.inventory.length}>
                {createReservationMutation.isPending ? 'Reserving stock...' : 'Reserve inventory'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {dashboardQuery.error ? (
        <Alert variant="destructive" className="border-white/10 bg-red-500/10 text-red-200">
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

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <CardTitle className="font-display text-[1.05rem] tracking-[-0.02em] text-white">Inventory</CardTitle>
            <CardDescription className="text-slate-400">Compact stock view with unit economics and utilization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[0.95rem] border border-white/[0.08]">
              <div className="grid grid-cols-[minmax(0,1.65fr)_0.55fr_0.55fr_0.65fr] gap-3 border-b border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <div>Item</div>
                <div>Avail.</div>
                <div>Res.</div>
                <div>Price</div>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {dashboard.inventory.map((item) => (
                  <div key={item.id} className={`grid grid-cols-[minmax(0,1.65fr)_0.55fr_0.55fr_0.65fr] gap-3 px-4 py-3 text-sm ${reservationSummaryColor(item.availableQty > 0 ? 'PENDING' : 'RELEASED')}`}>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{item.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">SKU {item.sku}</p>
                    </div>
                    <div className="font-mono text-white">{item.availableQty}</div>
                    <div className="font-mono text-slate-300">{item.reservedQty}</div>
                    <div className="font-medium text-white">{formatCurrency(item.priceCents, item.currency)}</div>
                    <div className="col-span-4 -mt-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(8, (item.availableQty / Math.max(1, item.totalQty)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel-dark text-white">
          <CardHeader>
            <CardTitle className="font-display text-[1.05rem] tracking-[-0.02em] text-white">Reservations</CardTitle>
            <CardDescription className="text-slate-400">Live queue with confirm and release actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[0.95rem] border border-white/[0.08]">
              <div className="grid grid-cols-[minmax(0,1.4fr)_0.95fr_0.5fr_0.55fr_0.85fr] gap-3 border-b border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <div>Reservation</div>
                <div>Customer</div>
                <div>Qty</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {dashboard.reservations.length > 0 ? (
                  dashboard.reservations.map((reservation) => (
                    <div key={reservation.id} className={`grid grid-cols-[minmax(0,1.4fr)_0.95fr_0.5fr_0.55fr_0.85fr] gap-3 px-4 py-3 text-sm ${reservationSummaryColor(reservation.status)}`}>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{reservation.reservationCode}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(reservation.createdAt)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{reservation.customerName}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{reservation.customerEmail}</p>
                      </div>
                      <div className="font-mono text-white">{reservation.quantity}</div>
                      <div>
                        <Badge variant={statusBadgeVariant(reservation.status)}>{reservation.status}</Badge>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {reservation.status === 'PENDING' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleReservationAction(reservation.id, 'confirm')}
                              disabled={confirmReservationId === reservation.id && confirmReservationMutation.isPending}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void handleReservationAction(reservation.id, 'release')}
                              disabled={releaseReservationId === reservation.id && releaseReservationMutation.isPending}
                            >
                              Release
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">{reservation.status === 'CONFIRMED' ? 'Committed' : `Released ${reservation.releaseReason ?? 'manually'}`}</span>
                        )}
                      </div>
                      <div className="col-span-5 -mt-1 flex items-center justify-end font-mono text-xs text-slate-400">
                        <ReservationCountdown expiresAt={reservation.expiresAt} status={reservation.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-slate-400">No reservations yet. Create one from the form to exercise the workflow.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.04] px-3 py-3">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <div className="mt-2 font-mono text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function MetricChip({ label, value, valueLabel }: { label: string; value: number; valueLabel?: string }) {
  return (
    <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.04] px-3 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-white">{valueLabel ?? value}</p>
    </div>
  );
}
