# Centralized Error Handling System

A production-level error handling system for the Inventory Reservation System. Provides custom error classes, standardized API responses, async wrappers, and frontend-friendly error messages.

## Overview

The error handling system consists of five main components:

1. **Custom Error Classes** - Typed error hierarchy extending AppError
2. **HTTP Status Mapping** - Status codes mapped to error codes and messages
3. **Standardized Responses** - Consistent JSON response format for API
4. **Async Wrappers** - Route handlers that catch and format errors
5. **Frontend Utilities** - Type-safe error handling in React components

## Quick Start

### Backend - Throwing Errors in Services

```typescript
import {
  ValidationError,
  NotFoundError,
  InventoryError,
  ConflictError,
  DatabaseError,
} from '@/lib/errors';

// Validation error
if (!productName) {
  throw new ValidationError('Product name is required', {
    field: 'productName',
  });
}

// Resource not found
if (!product) {
  throw new NotFoundError('Product not found', { productId });
}

// Business logic error
if (inventory < quantity) {
  throw new InventoryError(`Only ${inventory} units available`, {
    requested: quantity,
    available: inventory,
  });
}
```

### Backend - API Routes with Wrapper

```typescript
import { withAsyncRequest } from '@/lib/errors';

export const POST = withAsyncRequest(async (request: NextRequest) => {
  // Errors are automatically caught and formatted
  const product = await productService.createProduct(data);
  return product; // Returns success response automatically
});
```

### Frontend - Using Errors in React

```typescript
import { FrontendApiError, handleApiError, parseApiResponse } from '@/lib/errors';

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
      const errors = error.getValidationErrors();
      setFieldErrors(Object.fromEntries(errors.map(e => [e.field, e.message])));
    } else if (error.isServerError()) {
      showRetry(error.message);
    } else {
      showError(error.message);
    }
  },
});
```

## Error Classes

All error classes extend `AppError` and support context metadata.

### Available Error Classes

| Class | Status Code | Use Case |
|-------|-------------|----------|
| `ValidationError` | 400 | Invalid input data |
| `AuthenticationError` | 401 | Missing/invalid auth |
| `AuthorizationError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | State conflicts, duplicates |
| `RateLimitError` | 429 | Rate limiting |
| `DatabaseError` | 500 | Database failures |
| `ExternalServiceError` | 503 | Third-party API issues |
| `BusinessLogicError` | 400 | Domain-specific errors |
| `InventoryError` | 400 | Stock-related failures |
| `ReservationError` | 400 | Reservation failures |

### Example - Creating Errors with Context

```typescript
throw new InventoryError(
  'Insufficient stock for product',
  {
    productId: '123',
    requested: 10,
    available: 5,
    warehouseId: 'WH-1'
  }
);
```

## API Response Format

All API responses follow a standardized envelope format.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name",
    ...
  },
  "timestamp": "2024-05-24T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input and try again.",
    "statusCode": 400,
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "retryable": false,
    "traceId": "1234567890abcdef-abcdef1234567890"
  },
  "timestamp": "2024-05-24T10:30:00.000Z"
}
```

## Async Handler Wrappers

### `withAsyncRequest<T>(handler)`

Wraps a handler that returns data. Automatically creates a success response.

```typescript
export const GET = withAsyncRequest(async (request, context) => {
  // Return data directly
  const products = await productService.getAll();
  return products;
  // Wrapper returns: { success: true, data: products, ... }
});
```

### `withAsyncHandler<T>(handler)`

Wraps a handler that returns a NextResponse. Handles error catching.

```typescript
export const POST = withAsyncHandler(async (request, context) => {
  const data = await someOperation();
  return NextResponse.json({ data });
  // Errors are caught and formatted
});
```

### `handleError(error, request?)`

Centralized error handler for manual error handling.

```typescript
try {
  await operation();
} catch (error) {
  return handleError(error, request);
}
```

## Frontend Error Handling

### `FrontendApiError`

Type-safe error class for frontend use.

```typescript
import { FrontendApiError } from '@/lib/errors';

try {
  const data = await parseApiResponse(response);
} catch (error) {
  if (error instanceof FrontendApiError) {
    // Type-safe error handling
    console.log(error.code); // 'VALIDATION_ERROR'
    console.log(error.statusCode); // 400
    console.log(error.message); // User-friendly message
    
    if (error.isValidationError()) {
      const fieldErrors = error.getValidationErrors();
      // [{ field: 'email', message: '...' }]
    }
  }
}
```

### `handleApiError(response)`

Parses API response and throws FrontendApiError if unsuccessful.

```typescript
const response = await fetch('/api/products', { method: 'POST' });

if (!response.ok) {
  await handleApiError(response);
}

const json = await response.json();
```

### `parseApiResponse(response)`

Extracts data from success response or throws error from error response.

```typescript
const response = await fetch('/api/products').then(r => r.json());
const data = parseApiResponse(response);
// Type-safe: returns data or throws FrontendApiError
```

### Helper Functions

```typescript
// Get user-friendly message
const message = getErrorMessage(error, 'Default message');

// Check if should retry
if (shouldRetry(error)) {
  // Implement retry logic
}

// Get retry delay with exponential backoff
const delay = getRetryDelay(error, attemptNumber);

// Get error code for programmatic handling
const code = getErrorCode(error);

// Check specific error type
if (isErrorType(error, 'VALIDATION_ERROR')) {
  // Handle validation
}
```

## Error Messages

User-friendly error messages mapped to error codes.

### Using Message Mapping

```typescript
import { userFriendlyMessages, getErrorMessageFor } from '@/lib/errors';

// Get specific message
const message = userFriendlyMessages.INSUFFICIENT_STOCK;
// "There is not enough stock available."

// Or use helper
const message = getErrorMessageFor('INSUFFICIENT_STOCK');
```

### Validation Messages

```typescript
import { validationMessages, getValidationMessage } from '@/lib/errors';

// Generate validation message
const message = getValidationMessage('Email', 'email');
// "Please enter a valid email address"

const message = getValidationMessage('Password', 'minLength', 8);
// "Password must be at least 8 characters"
```

## HTTP Status Code Mapping

Utilities for status code handling.

```typescript
import {
  getStatusCodeInfo,
  isClientError,
  isServerError,
  isRetriable,
  getErrorCategory,
} from '@/lib/errors';

// Get info for status code
const info = getStatusCodeInfo(400);
// { code: 'BAD_REQUEST', message: '...', userMessage: '...' }

// Check error category
if (isClientError(400)) { /* 4xx error */ }
if (isServerError(500)) { /* 5xx error */ }
if (isRetriable(503)) { /* Should retry */ }

const category = getErrorCategory(404); // 'client' | 'server' | 'unknown'
```

## Error Logging and Tracing

Each error response includes a unique trace ID for debugging.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "traceId": "17174a8n3vg-f1a2b3c4d5e6f"
  }
}
```

The trace ID is logged server-side with full error context:
- Error code and message
- Stack trace
- Request context (method, URL, user agent)
- Error-specific details

This enables tracking errors across frontend and backend.

## Migration from Old Error Handling

### Before

```typescript
// Service
if (!resource) throw new Error('Not found');

// Route
try {
  const data = await service.get();
  return Response.json({ data });
} catch (e) {
  return Response.json({ error: e.message }, { status: 500 });
}

// Component
const mutation = useMutation({
  onError: (error) => setError(error.message),
});
```

### After

```typescript
// Service
import { NotFoundError } from '@/lib/errors';
if (!resource) throw new NotFoundError('Resource not found');

// Route
import { withAsyncRequest } from '@/lib/errors';
export const GET = withAsyncRequest(async (request) => {
  const data = await service.get();
  return data;
});

// Component
import { FrontendApiError } from '@/lib/errors';
const mutation = useMutation({
  onError: (error: FrontendApiError) => {
    if (error.isValidationError()) {
      setFieldErrors(error.getValidationErrors());
    } else {
      setError(error.message);
    }
  },
});
```

## Best Practices

1. **Always throw typed errors in services** - Use specific error classes (ValidationError, NotFoundError, etc.)
2. **Use context for debugging** - Include relevant data: `new NotFoundError('msg', { id, type })`
3. **Use wrappers in routes** - `withAsyncRequest` or `withAsyncHandler` for automatic error handling
4. **Parse responses in React** - Use `parseApiResponse` or `handleApiError` for type safety
5. **Handle specific errors** - Check error types in React: `error.isValidationError()`, `error.isServerError()`
6. **Implement retry logic** - Use `shouldRetry()` and `getRetryDelay()` for resilience
7. **Show user-friendly messages** - Use `error.message` (not stack traces) in UI
8. **Track errors with trace ID** - Store trace ID in logs for debugging

## Architecture Diagram

```
Error Hierarchy:
  AppError (base)
    ├── ValidationError (400)
    ├── AuthenticationError (401)
    ├── AuthorizationError (403)
    ├── NotFoundError (404)
    ├── ConflictError (409)
    ├── RateLimitError (429)
    ├── DatabaseError (500)
    ├── ExternalServiceError (503)
    └── BusinessLogicError (400)
         ├── InventoryError
         └── ReservationError

Response Flow:
  Service Layer
      ↓ (throws AppError)
  Route Handler (withAsyncRequest/withAsyncHandler)
      ↓ (catches & formats)
  Standardized JSON Response
      ↓
  Frontend (parseApiResponse/handleApiError)
      ↓ (throws FrontendApiError)
  React Component (onError handler)
```

## Files Included

- `app-error.ts` - Error class hierarchy
- `status-map.ts` - HTTP status code mappings
- `response.ts` - Response formatting utilities
- `async-handler.ts` - Route handler wrappers
- `frontend.ts` - Frontend error utilities
- `error-messages.ts` - User-friendly messages
- `index.ts` - Centralized exports
- `INTEGRATION_GUIDE.ts` - Code examples and patterns
- `README.md` - This documentation

## Next Steps

1. Update existing API routes to use `withAsyncRequest` wrapper
2. Update services to throw typed errors
3. Update React components to handle `FrontendApiError`
4. Integrate with external logging service (Sentry, CloudWatch, etc.)
5. Add error monitoring and alerting
