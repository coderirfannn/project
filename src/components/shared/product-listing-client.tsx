"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { InventoryItemDTO, ProductDTO } from '@/lib/domain';
import { toApiErrorMessage, useCatalogData, useCreateReservationMutation } from '@/lib/react-query';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, Loader2, ShoppingBag, Sparkles, Warehouse as WarehouseIcon } from 'lucide-react';

type ReservationRequest = {
  customerName: string;
  customerEmail: string;
  sku: string;
  quantity: number;
};

function buildFallbackProduct(item: InventoryItemDTO): ProductDTO {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    description: item.description,
    category: 'Inventory',
    brand: null,
    currency: item.currency,
    priceCents: item.priceCents,
    barcode: null,
    attributes: {},
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function ProductListingClient() {
  const router = useRouter();
  const { products, inventory, warehouses, isLoading, error, refetch } = useCatalogData();
  const createReservationMutation = useCreateReservationMutation();
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [reservationError, setReservationError] = useState<string | null>(null);

  useEffect(() => {
    const savedName = window.localStorage.getItem('reservation:name');
    const savedEmail = window.localStorage.getItem('reservation:email');

    if (savedName) {
      setCustomerName(savedName);
    }

    if (savedEmail) {
      setCustomerEmail(savedEmail);
    }
  }, []);

  const inventoryBySku = useMemo(() => {
    return inventory.reduce<Record<string, InventoryItemDTO>>((accumulator, row) => {
      accumulator[row.sku] = row;
      return accumulator;
    }, {});
  }, [inventory]);

  const availableProducts = products.length > 0 ? products : inventory.map(buildFallbackProduct);
  const selectedProduct = availableProducts.find((product) => product.sku === selectedSku) ?? availableProducts[0] ?? null;
  const selectedInventory = selectedProduct ? inventoryBySku[selectedProduct.sku] ?? null : null;
  const activeError = error ?? reservationError;

  const submitReservation = async () => {
    if (!selectedProduct) {
      return;
    }

    setReservationError(null);

    const payload: ReservationRequest = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      sku: selectedProduct.sku,
      quantity,
    };

    try {
      const reservation = await createReservationMutation.mutateAsync(payload);
      window.localStorage.setItem('reservation:name', payload.customerName);
      window.localStorage.setItem('reservation:email', payload.customerEmail);
      router.push(`/checkout/${reservation.id}`);
    } catch (requestError) {
      setReservationError(toApiErrorMessage(requestError, 'Unable to create reservation'));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="surface-panel-dark overflow-hidden rounded-[2rem] text-white">
        <div className="grid gap-8 px-5 py-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <Badge variant="outline" className="border-white/10 bg-white/8 text-white">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Modern reservation flow
            </Badge>
            <div className="space-y-4">
              <h2 className="max-w-2xl text-[2rem] font-semibold tracking-tight text-balance sm:text-[2.8rem] lg:text-[3.2rem]">
                Reserve inventory instantly with a clean, responsive ecommerce catalog.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-[0.98rem]">
                Browse products, compare stock across warehouses, and reserve in one optimistic checkout flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Responsive grid</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Optimistic checkout</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{warehouses.length} warehouses</span>
            </div>
          </div>

          <Card className="border-white/10 bg-white/7 text-white shadow-none backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Quick reserve</CardTitle>
              <CardDescription className="text-slate-300">Pick a product and lock stock in seconds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Selected item</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedProduct?.name ?? 'Choose a product'}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedProduct?.description ?? 'Click any reserve button to prefill this panel.'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="catalog-customer-name" className="text-slate-200">
                    Customer name
                  </Label>
                  <Input
                    id="catalog-customer-name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Your name"
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catalog-customer-email" className="text-slate-200">
                    Email address
                  </Label>
                  <Input
                    id="catalog-customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="email@domain.com"
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  aria-label="Quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full border-white/10 bg-white/5 text-white sm:w-28"
                />
                <Button
                  size="lg"
                  onClick={() => void submitReservation()}
                  className="flex-1 bg-emerald-500 text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,0.22)] hover:bg-emerald-400"
                  disabled={!selectedProduct || createReservationMutation.isPending || !customerName.trim() || !customerEmail.trim()}
                >
                  {createReservationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Reserve now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {activeError ? (
        <Alert variant="destructive" className="border-red-200 bg-red-50/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Unable to load catalog</p>
              <p className="text-sm opacity-90">{activeError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow text-emerald-600">Catalog</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Featured products</h3>
              <p className="text-sm text-slate-500">Compare stock and reserve directly from the catalog.</p>
            </div>
            <Badge variant="outline">{availableProducts.length} items</Badge>
          </div>

          {!isLoading && !error && availableProducts.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-white/80">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-18 text-center">
                <ShoppingBag className="h-9 w-9 text-slate-400" />
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold text-slate-950">No products loaded yet</h4>
                  <p className="max-w-md text-sm text-slate-500">
                    Seed inventory to populate the catalog and warehouse stock, or reconnect MongoDB Atlas to load live data.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {availableProducts.map((product) => {
                const stock = inventoryBySku[product.sku];
                const availableUnits = stock?.availableQty ?? 0;
                const reservedUnits = stock?.reservedQty ?? 0;
                const totalUnits = stock?.totalQty ?? 0;

                return (
                  <Card
                    key={product.id}
                    className={`group overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] ${selectedSku === product.sku ? 'ring-2 ring-emerald-500' : ''}`}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-xl text-slate-950">{product.name}</CardTitle>
                          <CardDescription className="mt-1">{product.category}</CardDescription>
                        </div>
                        <Badge variant={availableUnits > 0 ? 'success' : 'destructive'}>
                          {availableUnits > 0 ? 'In stock' : 'Sold out'}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{product.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Price</p>
                          <p className="text-lg font-semibold text-slate-950">{formatCurrency(product.priceCents, product.currency)}</p>
                        </div>
                        <ShoppingBag className="h-5 w-5 text-slate-400" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-slate-500">Available</p>
                          <p className="mt-1 font-semibold text-slate-950">{availableUnits}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-slate-500">Reserved</p>
                          <p className="mt-1 font-semibold text-slate-950">{reservedUnits}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-slate-500">Total</p>
                          <p className="mt-1 font-semibold text-slate-950">{totalUnits}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <span>Inventory snapshot</span>
                          <WarehouseIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {stock ? `Synced stock record ${stock.id}` : 'No inventory record loaded for this SKU yet.'}
                        </p>
                      </div>

                      <Button
                        className="w-full"
                        variant={selectedSku === product.sku ? 'secondary' : 'default'}
                        onClick={() => setSelectedSku(product.sku)}
                        disabled={availableUnits <= 0}
                      >
                        {createReservationMutation.isPending && selectedSku === product.sku ? 'Reserving...' : selectedSku === product.sku ? 'Selected' : 'Reserve'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="border-slate-200/80 bg-white/95 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Reservation summary</CardTitle>
              <CardDescription>Prefill details before sending the checkout request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Selected product</p>
                    <h4 className="mt-2 text-lg font-semibold text-slate-950">{selectedProduct.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">SKU {selectedProduct.sku}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Customer name</p>
                      <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Alex Carter" />
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Email</p>
                      <Input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="alex@company.com" type="email" />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Quantity</p>
                    <Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
                  </div>
                  <Button className="w-full" size="lg" onClick={() => void submitReservation()} disabled={createReservationMutation.isPending || !customerName.trim() || !customerEmail.trim()}>
                    {createReservationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Reserve and continue
                  </Button>
                  <p className="text-xs leading-5 text-slate-500">
                    This creates a temporary reservation and sends you to checkout with a live countdown.
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  Select a product to begin a reservation.
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
