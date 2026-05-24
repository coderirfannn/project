'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { ApiError, fetchJson } from '@/lib/api-client';
import type { DashboardDTO, InventoryItemDTO, ProductDTO, ReservationDTO, WarehouseDTO } from '@/lib/domain';

export type CreateReservationInput = {
  customerName: string;
  customerEmail: string;
  sku: string;
  quantity: number;
};

export type ReservationActionInput = {
  reservationId: string;
  paymentReference?: string;
  releaseReason?: string;
};

export const queryKeys = {
  catalog: {
    all: ['catalog'] as const,
    products: () => ['catalog', 'products'] as const,
    inventory: () => ['catalog', 'inventory'] as const,
    warehouses: () => ['catalog', 'warehouses'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    detail: () => ['dashboard', 'detail'] as const,
  },
  reservations: {
    all: ['reservations'] as const,
    detail: (reservationId: string) => ['reservations', reservationId] as const,
  },
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function formatOptimisticExpiration(): string {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString();
}

function reserveInventoryRows(rows: InventoryItemDTO[], sku: string, quantity: number): InventoryItemDTO[] {
  let remaining = quantity;

  return rows.map((row) => {
    if (row.sku !== sku || remaining <= 0) {
      return row;
    }

    const consumed = Math.min(row.availableQty, remaining);
    remaining -= consumed;

    return {
      ...row,
      availableQty: row.availableQty - consumed,
      reservedQty: row.reservedQty + consumed,
    };
  });
}

function releaseInventoryRows(rows: InventoryItemDTO[], sku: string, quantity: number): InventoryItemDTO[] {
  let remaining = quantity;

  return rows.map((row) => {
    if (row.sku !== sku || remaining <= 0) {
      return row;
    }

    const released = Math.min(row.reservedQty, remaining);
    remaining -= released;

    return {
      ...row,
      availableQty: row.availableQty + released,
      reservedQty: row.reservedQty - released,
    };
  });
}

function confirmInventoryRows(rows: InventoryItemDTO[], sku: string, quantity: number): InventoryItemDTO[] {
  let remaining = quantity;

  return rows.map((row) => {
    if (row.sku !== sku || remaining <= 0) {
      return row;
    }

    const confirmed = Math.min(row.reservedQty, remaining);
    remaining -= confirmed;

    return {
      ...row,
      totalQty: row.totalQty - confirmed,
      reservedQty: row.reservedQty - confirmed,
      soldQty: row.soldQty + confirmed,
    };
  });
}

function reserveDashboardInventory(dashboard: DashboardDTO, sku: string, quantity: number): DashboardDTO {
  return {
    ...dashboard,
    inventory: reserveInventoryRows(dashboard.inventory, sku, quantity),
  };
}

function releaseDashboardInventory(dashboard: DashboardDTO, sku: string, quantity: number): DashboardDTO {
  return {
    ...dashboard,
    inventory: releaseInventoryRows(dashboard.inventory, sku, quantity),
  };
}

function confirmDashboardInventory(dashboard: DashboardDTO, sku: string, quantity: number): DashboardDTO {
  return {
    ...dashboard,
    inventory: confirmInventoryRows(dashboard.inventory, sku, quantity),
  };
}

function updateReservationEntry(
  reservation: ReservationDTO,
  changes: Partial<ReservationDTO> & Pick<ReservationDTO, 'status'>,
): ReservationDTO {
  return {
    ...reservation,
    ...changes,
  };
}

export function useCatalogData() {
  const productsQuery = useQuery({
    queryKey: queryKeys.catalog.products(),
    queryFn: () => fetchJson<ProductDTO[]>('/api/products'),
  });

  const inventoryQuery = useQuery({
    queryKey: queryKeys.catalog.inventory(),
    queryFn: () => fetchJson<InventoryItemDTO[]>('/api/inventory'),
  });

  const warehousesQuery = useQuery({
    queryKey: queryKeys.catalog.warehouses(),
    queryFn: () => fetchJson<WarehouseDTO[]>('/api/warehouses'),
  });

  const error = productsQuery.error ?? inventoryQuery.error ?? warehousesQuery.error;

  return {
    products: productsQuery.data ?? [],
    inventory: inventoryQuery.data ?? [],
    warehouses: warehousesQuery.data ?? [],
    isLoading: productsQuery.isLoading || inventoryQuery.isLoading || warehousesQuery.isLoading,
    isFetching: productsQuery.isFetching || inventoryQuery.isFetching || warehousesQuery.isFetching,
    error: error ? getErrorMessage(error, 'Failed to load catalog') : null,
    refetch: async () => {
      await Promise.all([productsQuery.refetch(), inventoryQuery.refetch(), warehousesQuery.refetch()]);
    },
  };
}

export function useDashboardQuery(initialDashboard?: DashboardDTO) {
  return useQuery({
    queryKey: queryKeys.dashboard.detail(),
    queryFn: () => fetchJson<DashboardDTO>('/api/dashboard'),
    initialData: initialDashboard,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useReservationQuery(reservationId: string) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(reservationId),
    queryFn: () => fetchJson<ReservationDTO>(`/api/reservations/${reservationId}`),
    enabled: Boolean(reservationId),
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 15_000 : false),
  });
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReservationInput) =>
      fetchJson<ReservationDTO>('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.catalog.all as QueryKey }),
        queryClient.cancelQueries({ queryKey: queryKeys.dashboard.all as QueryKey }),
      ]);

      const previousInventory = queryClient.getQueryData<InventoryItemDTO[]>(queryKeys.catalog.inventory());
      const previousDashboard = queryClient.getQueryData<DashboardDTO>(queryKeys.dashboard.detail());

      if (previousInventory) {
        queryClient.setQueryData<InventoryItemDTO[]>(queryKeys.catalog.inventory(), reserveInventoryRows(previousInventory, input.sku, input.quantity));
      }

      if (previousDashboard) {
        queryClient.setQueryData<DashboardDTO>(queryKeys.dashboard.detail(), reserveDashboardInventory(previousDashboard, input.sku, input.quantity));
      }

      return { previousInventory, previousDashboard };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(queryKeys.catalog.inventory(), context.previousInventory);
      }

      if (context?.previousDashboard) {
        queryClient.setQueryData(queryKeys.dashboard.detail(), context.previousDashboard);
      }
    },
    onSuccess: (reservation) => {
      queryClient.setQueryData(queryKeys.reservations.detail(reservation.id), reservation);
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
    },
  });
}

export function useReservationActionMutation(action: 'confirm' | 'release') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReservationActionInput) =>
      fetchJson<ReservationDTO>(
        action === 'confirm' ? `/api/reservations/${input.reservationId}/confirm` : `/api/reservations/${input.reservationId}/release`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body:
            action === 'confirm'
              ? JSON.stringify({ paymentReference: input.paymentReference })
              : JSON.stringify({ releaseReason: input.releaseReason }),
        },
      ),
    onMutate: async (input) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.cancelQueries({ queryKey: queryKeys.catalog.all }),
        queryClient.cancelQueries({ queryKey: queryKeys.reservations.detail(input.reservationId) }),
      ]);

      const previousReservation = queryClient.getQueryData<ReservationDTO>(queryKeys.reservations.detail(input.reservationId));
      const previousDashboard = queryClient.getQueryData<DashboardDTO>(queryKeys.dashboard.detail());
      const previousInventory = queryClient.getQueryData<InventoryItemDTO[]>(queryKeys.catalog.inventory());
      const optimisticReservation = previousReservation ?? previousDashboard?.reservations.find((item) => item.id === input.reservationId);

      if (optimisticReservation) {
        queryClient.setQueryData<ReservationDTO>(
          queryKeys.reservations.detail(input.reservationId),
          updateReservationEntry(optimisticReservation, {
            status: action === 'confirm' ? 'CONFIRMED' : 'RELEASED',
            paymentStatus: action === 'confirm' ? 'SUCCEEDED' : optimisticReservation.paymentStatus,
            paymentReference: action === 'confirm' ? input.paymentReference ?? optimisticReservation.paymentReference : optimisticReservation.paymentReference,
            releaseReason: action === 'release' ? input.releaseReason ?? optimisticReservation.releaseReason : optimisticReservation.releaseReason,
            confirmedAt: action === 'confirm' ? new Date().toISOString() : optimisticReservation.confirmedAt,
            releasedAt: action === 'release' ? new Date().toISOString() : optimisticReservation.releasedAt,
          }),
        );

        if (previousDashboard) {
          const nextReservations = previousDashboard.reservations.map((item) =>
            item.id === input.reservationId
              ? updateReservationEntry(item, {
                  status: action === 'confirm' ? 'CONFIRMED' : 'RELEASED',
                  paymentStatus: action === 'confirm' ? 'SUCCEEDED' : item.paymentStatus,
                  paymentReference: action === 'confirm' ? input.paymentReference ?? item.paymentReference : item.paymentReference,
                  releaseReason: action === 'release' ? input.releaseReason ?? item.releaseReason : item.releaseReason,
                  confirmedAt: action === 'confirm' ? new Date().toISOString() : item.confirmedAt,
                  releasedAt: action === 'release' ? new Date().toISOString() : item.releasedAt,
                })
              : item,
          );

          const inventoryUpdater = action === 'confirm' ? confirmDashboardInventory : releaseDashboardInventory;

          queryClient.setQueryData<DashboardDTO>(queryKeys.dashboard.detail(), {
            ...inventoryUpdater(previousDashboard, optimisticReservation.sku, optimisticReservation.quantity),
            reservations: nextReservations,
          });
        }

        if (previousInventory) {
          const nextInventory = action === 'confirm'
            ? confirmInventoryRows(previousInventory, optimisticReservation.sku, optimisticReservation.quantity)
            : releaseInventoryRows(previousInventory, optimisticReservation.sku, optimisticReservation.quantity);

          queryClient.setQueryData(queryKeys.catalog.inventory(), nextInventory);
        }
      }

      return { previousReservation, previousDashboard, previousInventory };
    },
    onError: (_error, variables, context) => {
      if (context?.previousReservation) {
        queryClient.setQueryData(queryKeys.reservations.detail(variables.reservationId), context.previousReservation);
      }

      if (context?.previousDashboard) {
        queryClient.setQueryData(queryKeys.dashboard.detail(), context.previousDashboard);
      }

      if (context?.previousInventory) {
        queryClient.setQueryData(queryKeys.catalog.inventory(), context.previousInventory);
      }
    },
    onSuccess: (reservation) => {
      queryClient.setQueryData(queryKeys.reservations.detail(reservation.id), reservation);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.detail(reservation.id) });
    },
  });
}

export function toApiErrorMessage(error: unknown, fallbackMessage: string): string {
  return getErrorMessage(error, fallbackMessage);
}