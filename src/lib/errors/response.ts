import { AppError } from './app-error';
import { getStatusCodeInfo, isServerError } from './status-map';

/**
 * Standardized API response wrapper for both success and error responses.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  timestamp: string;
}

/**
 * Standardized error response format sent to clients.
 * Includes frontend-friendly messages and error codes for programmatic handling.
 */
export interface ApiErrorResponse {
  code: string;
  message: string; // Frontend-friendly message
  statusCode: number;
  details?: {
    field?: string;
    reason?: string;
    [key: string]: unknown;
  };
  retryable?: boolean;
  retryAfter?: number;
  traceId?: string;
}

/**
 * Create a standardized success response.
 */
export function createSuccessResponse<T>(data: T, timestamp?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: timestamp || new Date().toISOString(),
  };
}

/**
 * Create a standardized error response from an AppError.
 * Includes frontend-friendly messages and safe error details.
 */
export function createErrorResponse(error: AppError | Error, traceId?: string): ApiResponse<never> {
  const now = new Date().toISOString();

  if (error instanceof AppError) {
    const statusInfo = getStatusCodeInfo(error.statusCode);

    return {
      success: false,
      error: {
        code: error.code,
        message: statusInfo.userMessage,
        statusCode: error.statusCode,
        details: error.context,
        retryable: error.statusCode === 429 || (error.statusCode >= 500 && error.statusCode < 600),
        ...(error.statusCode === 429 && {
          retryAfter: (error as any).retryAfter,
        }),
        ...(traceId && { traceId }),
      },
      timestamp: now,
    };
  }

  // Handle generic Error objects
  const statusCode = 500;
  const statusInfo = getStatusCodeInfo(statusCode);

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: statusInfo.userMessage,
      statusCode,
      retryable: true,
      ...(traceId && { traceId }),
    },
    timestamp: now,
  };
}

/**
 * Create a standardized error response from a status code and message.
 * Useful for middleware and error boundaries.
 */
export function createStatusErrorResponse(statusCode: number, message?: string, traceId?: string): ApiResponse<never> {
  const statusInfo = getStatusCodeInfo(statusCode);
  const now = new Date().toISOString();

  return {
    success: false,
    error: {
      code: statusInfo.code,
      message: message || statusInfo.userMessage,
      statusCode,
      retryable: statusCode === 429 || isServerError(statusCode),
      ...(traceId && { traceId }),
    },
    timestamp: now,
  };
}

/**
 * Create a validation error response with field-level details.
 */
export function createValidationErrorResponse(
  errors: Array<{ field: string; message: string }>,
  traceId?: string,
): ApiResponse<never> {
  const now = new Date().toISOString();

  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed. Please check your input.',
      statusCode: 400,
      details: {
        errors,
      },
      retryable: false,
      ...(traceId && { traceId }),
    },
    timestamp: now,
  };
}

/**
 * Extract frontend-friendly message from error response.
 * Falls back to default message if unavailable.
 */
export function getErrorMessage(response: ApiResponse<never>, fallback: string = 'An error occurred'): string {
  return response.error?.message || fallback;
}

/**
 * Check if response is a success response.
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> {
  return response.success === true && !response.error;
}

/**
 * Check if response is an error response.
 */
export function isErrorResponse(response: ApiResponse): response is ApiResponse<never> {
  return response.success === false && !!response.error;
}

/**
 * Check if error response is retriable.
 */
export function isErrorRetriable(response: ApiResponse<never>): boolean {
  return response.error?.retryable ?? false;
}

/**
 * Get retry delay in milliseconds from error response.
 * Uses Retry-After header value if available, or exponential backoff calculation.
 */
export function getRetryDelay(response: ApiResponse<never>, attemptNumber: number = 1): number {
  const retryAfter = response.error?.retryAfter;

  if (retryAfter) {
    return retryAfter * 1000; // Convert to milliseconds
  }

  // Exponential backoff: 1s, 2s, 4s, 8s... up to 30s
  const delay = Math.min(Math.pow(2, attemptNumber - 1) * 1000, 30000);

  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}
