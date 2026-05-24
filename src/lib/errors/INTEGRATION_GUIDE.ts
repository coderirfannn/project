/**
 * Error Handling System Integration Guide
 * 
 * This file demonstrates how to use the centralized error handling system
 * throughout the application in API routes, services, and React components.
 */

// ============================================================================
// SECTION 1: API ROUTE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic API Route with Error Handling
 * 
 * Location: src/app/api/products/route.ts
 */
export const example1ApiRoute = `
import { NextRequest } from 'next/server';
import { withAsyncRequest } from '@/lib/errors';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { productService } from '@/services';

export const GET = withAsyncRequest(async (request: NextRequest) => {
  // The wrapper automatically catches errors and returns standardized responses
  const products = await productService.getAllProducts();
  return products;
});

export const POST = withAsyncRequest(async (request: NextRequest) => {
  const body = await request.json();

  // Throw validation errors for invalid input
  if (!body.name || body.name.trim() === '') {
    throw new ValidationError('Product name is required', {
      field: 'name',
      received: body.name,
    });
  }

  if (body.price <= 0) {
    throw new ValidationError('Product price must be greater than 0', {
      field: 'price',
      received: body.price,
    });
  }

  const product = await productService.createProduct(body);
  return product;
});
`;

/**
 * Example 2: Route with Resource Lookup
 * 
 * Location: src/app/api/products/[id]/route.ts
 */
export const example2ApiRoute = `
import { NextRequest } from 'next/server';
import { withAsyncRequest } from '@/lib/errors';
import { NotFoundError, AuthorizationError } from '@/lib/errors';
import { productService } from '@/services';
import { getCurrentUser } from '@/lib/auth';

export const GET = withAsyncRequest(async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const { id } = context.params;
  const product = await productService.getProductById(id);

  // Throw NotFoundError if resource doesn't exist
  if (!product) {
    throw new NotFoundError(\`Product with ID \${id} not found\`, {
      resourceId: id,
      resourceType: 'Product',
    });
  }

  return product;
});

export const PUT = withAsyncRequest(async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const { id } = context.params;
  const currentUser = await getCurrentUser();

  // Check permissions
  if (!currentUser) {
    throw new AuthenticationError('You must be logged in to update products');
  }

  if (!currentUser.isAdmin) {
    throw new AuthorizationError('Only administrators can update products');
  }

  const body = await request.json();
  const product = await productService.updateProduct(id, body);

  if (!product) {
    throw new NotFoundError(\`Product with ID \${id} not found\`);
  }

  return product;
});
`;

/**
 * Example 3: Complex Business Logic with Multiple Error Types
 * 
 * Location: src/app/api/reservations/route.ts
 */
export const example3ApiRoute = `
import { NextRequest } from 'next/server';
import { withAsyncRequest } from '@/lib/errors';
import {
  ValidationError,
  ConflictError,
  InventoryError,
  ReservationError,
  DatabaseError,
} from '@/lib/errors';
import { reservationService, inventoryService } from '@/services';

export const POST = withAsyncRequest(async (request: NextRequest) => {
  const body = await request.json();

  // Validation
  if (!body.productId || !body.quantity) {
    throw new ValidationError('Missing required fields', {
      missing: ['productId', 'quantity'],
    });
  }

  // Check inventory availability
  const available = await inventoryService.getAvailableQuantity(
    body.productId,
    body.warehouseId
  );

  if (available < body.quantity) {
    throw new InventoryError(
      \`Only \${available} units available, requested \${body.quantity}\`,
      {
        requested: body.quantity,
        available,
        productId: body.productId,
      }
    );
  }

  // Try to create reservation
  try {
    const reservation = await reservationService.createReservation({
      productId: body.productId,
      quantity: body.quantity,
      warehouseId: body.warehouseId,
      customerId: body.customerId,
    });

    // Check for state conflicts
    if (reservation.status === 'EXPIRED') {
      throw new ConflictError('Reservation expired during processing');
    }

    return reservation;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Duplicate')) {
      throw new ConflictError('A reservation for this product already exists');
    }

    if (error instanceof Error && error.message.includes('Database')) {
      throw new DatabaseError('Failed to create reservation in database', {
        originalError: error.message,
      });
    }

    throw error;
  }
});
`;

// ============================================================================
// SECTION 2: SERVICE LAYER EXAMPLES
// ============================================================================

/**
 * Example 4: Service with Error Handling
 * 
 * Location: src/services/reservation.service.ts (excerpt)
 */
export const example4Service = `
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  InventoryError,
  ReservationError,
} from '@/lib/errors';

export class ReservationService {
  async createReservation(data: CreateReservationInput) {
    // Validate input
    if (data.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    // Check inventory
    const inventory = await inventoryService.findByProductId(data.productId);
    if (!inventory) {
      throw new NotFoundError('Product not found in inventory');
    }

    if (inventory.available < data.quantity) {
      throw new InventoryError(
        \`Insufficient inventory. Available: \${inventory.available}\`
      );
    }

    // Check for existing reservations
    const existing = await this.findActiveReservation(
      data.customerId,
      data.productId
    );

    if (existing) {
      throw new ConflictError(
        'You already have an active reservation for this product'
      );
    }

    // Create reservation
    try {
      const reservation = await ReservationModel.create({
        ...data,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });

      // Reserve inventory
      await inventoryService.reserve(data.productId, data.quantity);

      return reservation;
    } catch (error) {
      throw new ReservationError(
        'Failed to create reservation',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async confirmReservation(reservationId: string) {
    const reservation = await ReservationModel.findById(reservationId);

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (reservation.status !== 'PENDING') {
      throw new ConflictError(
        \`Cannot confirm reservation with status: \${reservation.status}\`
      );
    }

    if (new Date() > reservation.expiresAt) {
      throw new ReservationError('Reservation has expired');
    }

    return await reservation.updateOne({ status: 'CONFIRMED' });
  }
}
`;

// ============================================================================
// SECTION 3: REACT COMPONENT EXAMPLES
// ============================================================================

/**
 * Example 5: React Component with React Query and Error Handling
 * 
 * Location: src/components/product-form.tsx (excerpt)
 */
export const example5Component = `
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FrontendApiError,
  getErrorMessage,
  parseApiResponse,
  handleApiError,
} from '@/lib/errors';

export function ProductForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductInput) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const json = await response.json();
      return parseApiResponse(json);
    },

    onError: (error: Error) => {
      if (error instanceof FrontendApiError) {
        // Handle validation errors
        if (error.isValidationError()) {
          const validationErrors = error.getValidationErrors();
          setFieldErrors(
            Object.fromEntries(
              validationErrors.map((e) => [e.field, e.message])
            )
          );
        }

        // Handle auth errors
        if (error.isAuthError()) {
          // Redirect to login
          window.location.href = '/login';
          return;
        }

        // Handle other errors
        const message = getErrorMessage(error, 'Failed to create product');
        showErrorToast(message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    createProductMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Product Name</label>
        <input
          name='name'
          type='text'
          error={fieldErrors['name']}
        />
        {fieldErrors['name'] && (
          <span className='error'>{fieldErrors['name']}</span>
        )}
      </div>

      {createProductMutation.isPending && <p>Creating...</p>}

      <button type='submit' disabled={createProductMutation.isPending}>
        Create Product
      </button>
    </form>
  );
}
`;

/**
 * Example 6: Custom Hook for Error Handling
 * 
 * Location: src/hooks/use-api-mutation.ts
 */
export const example6Hook = `
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { FrontendApiError, parseApiResponse, handleApiError } from '@/lib/errors';

interface UsApiMutationOptions<TData, TError = FrontendApiError>
  extends Omit<UseMutationOptions<TData, TError, any>, 'mutationFn'> {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string;
}

export function useApiMutation<TData = any>({
  url,
  method = 'POST',
  token,
  ...options
}: UsApiMutationOptions<TData>) {
  return useMutation<TData, FrontendApiError, Record<string, any>>({
    mutationFn: async (data) => {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: \`Bearer \${token}\` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const json = await response.json();
      return parseApiResponse(json);
    },
    ...options,
  });
}

// Usage:
const createProductMutation = useApiMutation({
  url: '/api/products',
  method: 'POST',
  onError: (error) => {
    if (error.isValidationError()) {
      // Handle validation
    } else if (error.isServerError()) {
      // Show retry option
    }
  },
});
`;

// ============================================================================
// SECTION 4: MIGRATION GUIDE
// ============================================================================

export const migrationGuide = `
# Error Handling System Migration Guide

## 1. Update Existing API Routes

Before:
\`\`\`typescript
export const GET = async (request) => {
  try {
    const data = await service.getData();
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
\`\`\`

After:
\`\`\`typescript
import { withAsyncRequest } from '@/lib/errors';

export const GET = withAsyncRequest(async (request) => {
  const data = await service.getData();
  return data; // Wrapper handles response formatting
});
\`\`\`

## 2. Update Services to Throw Typed Errors

Before:
\`\`\`typescript
if (!resource) {
  throw new Error('Not found');
}
\`\`\`

After:
\`\`\`typescript
import { NotFoundError } from '@/lib/errors';

if (!resource) {
  throw new NotFoundError('Resource not found', { resourceId });
}
\`\`\`

## 3. Update React Components

Before:
\`\`\`typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },
  onError: (error) => {
    setError(error.message);
  },
});
\`\`\`

After:
\`\`\`typescript
import { FrontendApiError, handleApiError } from '@/lib/errors';

const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) await handleApiError(res);
    return parseApiResponse(await res.json());
  },
  onError: (error: FrontendApiError) => {
    if (error.isValidationError()) {
      setFieldErrors(error.getValidationErrors());
    } else {
      setError(error.message);
    }
  },
});
\`\`\`

## 4. Update Existing Error Handling in react-query.ts

Use the new error system to enhance existing hooks:
- Replace manual error messages with FrontendApiError
- Use error.isValidationError(), error.isServerError(), etc.
- Add retryable logic based on error.retryable
`;

const integrationGuide = {
  example1ApiRoute,
  example2ApiRoute,
  example3ApiRoute,
  example4Service,
  example5Component,
  example6Hook,
  migrationGuide,
};

export default integrationGuide;
