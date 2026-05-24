import type { ApiErrorResponse, ApiResponse } from './response';

/**
 * Frontend-facing error class for handling API errors in React.
 * Wraps the API error response with helpful methods.
 */
export class FrontendApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly traceId?: string;
  readonly retryable: boolean;
  readonly retryAfter?: number;

  constructor(response: ApiErrorResponse, originalError?: Error) {
    super(response.message);
    this.name = 'FrontendApiError';
    this.statusCode = response.statusCode;
    this.code = response.code;
    this.details = response.details;
    this.traceId = response.traceId;
    this.retryable = response.retryable ?? false;
    this.retryAfter = response.retryAfter;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Check if this is a validation error.
   */
  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  /**
   * Check if this is an authentication error.
   */
  isAuthError(): boolean {
    return this.code === 'AUTHENTICATION_ERROR';
  }

  /**
   * Check if this is an authorization error.
   */
  isAuthzError(): boolean {
    return this.code === 'AUTHORIZATION_ERROR';
  }

  /**
   * Check if this is a not found error.
   */
  isNotFoundError(): boolean {
    return this.code === 'NOT_FOUND_ERROR';
  }

  /**
   * Check if this is a server error.
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if this is a client error.
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Get validation errors array if this is a validation error.
   */
  getValidationErrors(): Array<{ field: string; message: string }> {
    if (!this.isValidationError()) {
      return [];
    }

    const errors = this.details?.errors;
    if (Array.isArray(errors)) {
      return errors;
    }

    return [];
  }

  /**
   * Get a specific validation error for a field.
   */
  getFieldError(field: string): string | null {
    const errors = this.getValidationErrors();
    const fieldError = errors.find((e) => e.field === field);
    return fieldError?.message || null;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      traceId: this.traceId,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Parse an API response and throw FrontendApiError if unsuccessful.
 * Returns the data if successful.
 */
export function parseApiResponse<T>(response: ApiResponse<T>): T {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  if (!response.success && response.error) {
    throw new FrontendApiError(response.error);
  }

  throw new FrontendApiError(
    {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      retryable: true,
    },
    new Error('Invalid API response'),
  );
}

/**
 * Handle API errors in fetch calls.
 * Parses JSON responses and throws FrontendApiError.
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiResponse<never> | null = null;

  try {
    errorData = await response.json();
  } catch {
    // Fall back to status text if response isn't JSON
    throw new FrontendApiError({
      code: 'NETWORK_ERROR',
      message: response.statusText || 'Network request failed',
      statusCode: response.status,
      retryable: response.status >= 500,
    });
  }

  if (errorData?.error) {
    throw new FrontendApiError(errorData.error);
  }

  throw new FrontendApiError({
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    statusCode: response.status,
    retryable: response.status >= 500,
  });
}

/**
 * Get user-friendly error message from various error types.
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  if (error instanceof FrontendApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

/**
 * Check if error should be retried.
 */
export function shouldRetry(error: unknown): boolean {
  if (error instanceof FrontendApiError) {
    return error.retryable;
  }

  return false;
}

/**
 * Get retry delay in milliseconds.
 */
export function getRetryDelay(error: unknown, attemptNumber: number = 1): number {
  if (error instanceof FrontendApiError && error.retryAfter) {
    return error.retryAfter * 1000;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s... up to 30s
  const delay = Math.min(Math.pow(2, attemptNumber - 1) * 1000, 30000);

  // Add jitter
  return delay + Math.random() * 1000;
}

/**
 * Get error code for programmatic error handling.
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof FrontendApiError) {
    return error.code;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Check if error is a specific type.
 */
export function isErrorType(error: unknown, code: string): boolean {
  if (error instanceof FrontendApiError) {
    return error.code === code;
  }

  return false;
}
