import { NextRequest, NextResponse } from 'next/server';
import type { AppError } from './app-error';
import { createErrorResponse, createSuccessResponse } from './response';
import { getStatusCodeInfo } from './status-map';

/**
 * Type for async route handler functions.
 */
export type AsyncRouteHandler<T = unknown> = (
  request: NextRequest,
  context?: { params: Record<string, string> },
) => Promise<NextResponse<T>>;

/**
 * Type for async request processing functions that return data.
 */
export type AsyncRequestHandler<T = unknown> = (
  request: NextRequest,
  context?: { params: Record<string, string> },
) => Promise<T>;

/**
 * Wraps an async route handler to catch errors and return standardized responses.
 * Handles AppError instances with proper status codes and user-friendly messages.
 */
export function withAsyncHandler<T = unknown>(handler: AsyncRouteHandler<T>) {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error, request);
    }
  };
}

/**
 * Wraps an async data processing function and returns a standardized JSON response.
 * Useful for API routes that transform requests to data and return success responses.
 */
export function withAsyncRequest<T = unknown>(handler: AsyncRequestHandler<T>) {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      const data = await handler(request, context);
      const response = createSuccessResponse(data);
      return NextResponse.json(response);
    } catch (error) {
      return handleError(error, request);
    }
  };
}

/**
 * Centralized error handler for route handlers.
 * Converts AppError and generic Error instances into standardized responses.
 */
export function handleError(error: unknown, request?: NextRequest): NextResponse {
  // Generate a trace ID for logging and debugging
  const traceId = generateTraceId();

  // Log the error with context
  logError(error, traceId, request);

  if (error instanceof Error && 'statusCode' in error && 'code' in error) {
    // Handle AppError instances
    const appError = error as AppError;
    const errorResponse = createErrorResponse(appError, traceId);
    return NextResponse.json(errorResponse, { status: appError.statusCode });
  }

  if (error instanceof Error) {
    // Handle generic Error instances
    const statusCode = 500;
    const statusInfo = getStatusCodeInfo(statusCode);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: statusInfo.userMessage,
          statusCode,
          retryable: true,
          traceId,
        },
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    );
  }

  // Handle unknown error types
  const statusCode = 500;
  const statusInfo = getStatusCodeInfo(statusCode);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: statusInfo.userMessage,
        statusCode,
        retryable: true,
        traceId,
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

/**
 * Generate a unique trace ID for error tracking.
 */
export function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 11);
  return `${timestamp}-${random}`;
}

/**
 * Log error with context for monitoring and debugging.
 * In production, this should send to a logging service like Sentry, CloudWatch, etc.
 */
export function logError(error: unknown, traceId: string, request?: NextRequest): void {
  const context = {
    traceId,
    timestamp: new Date().toISOString(),
    method: request?.method,
    url: request?.url,
    userAgent: request?.headers.get('user-agent'),
  };

  if (error instanceof Error && 'statusCode' in error && 'code' in error) {
    const appError = error as AppError;
    console.error('[AppError]', {
      ...context,
      code: appError.code,
      statusCode: appError.statusCode,
      message: appError.message,
      contextData: appError.context,
      stack: appError.stack,
    });
  } else if (error instanceof Error) {
    console.error('[Error]', {
      ...context,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error('[UnknownError]', {
      ...context,
      error,
    });
  }

  // TODO: Send to external logging service
  // await logToSentry({ error, traceId, context });
  // await logToCloudWatch({ error, traceId, context });
}

/**
 * Type-safe response creator for successful data returns.
 * Can be used directly in route handlers.
 */
export function jsonResponse<T>(data: T, statusCode: number = 200): NextResponse<ReturnType<typeof createSuccessResponse<T>>> {
  const response = createSuccessResponse(data);
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Type-safe error response creator.
 * Can be used directly in route handlers.
 */
export function jsonErrorResponse(appError: AppError | Error, statusCode?: number): NextResponse {
  const traceId = generateTraceId();
  logError(appError, traceId);

  if (appError instanceof Error && 'statusCode' in appError) {
    const error = appError as AppError;
    const errorResponse = createErrorResponse(error, traceId);
    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  const code = statusCode || 500;
  const errorResponse = createErrorResponse(appError, traceId);
  return NextResponse.json(errorResponse, { status: code });
}
