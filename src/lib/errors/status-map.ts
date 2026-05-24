/**
 * HTTP status code to error information mapping for common scenarios.
 * Used to normalize errors into frontend-friendly responses.
 */
export const statusCodeMap = {
  // 4xx Client Errors
  400: {
    code: 'BAD_REQUEST',
    message: 'Invalid request. Please check your input and try again.',
    userMessage: 'Invalid request.',
  },
  401: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required. Please log in and try again.',
    userMessage: 'Authentication required.',
  },
  403: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.',
    userMessage: 'Insufficient permissions.',
  },
  404: {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found.',
    userMessage: 'Resource not found.',
  },
  409: {
    code: 'CONFLICT',
    message: 'The request conflicts with the current state of the server.',
    userMessage: 'Resource conflict.',
  },
  422: {
    code: 'UNPROCESSABLE_ENTITY',
    message: 'The request could not be processed due to validation errors.',
    userMessage: 'Invalid data provided.',
  },
  429: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please wait before trying again.',
    userMessage: 'Too many requests. Please try again later.',
  },

  // 5xx Server Errors
  500: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    userMessage: 'Something went wrong. Please try again later.',
  },
  501: {
    code: 'NOT_IMPLEMENTED',
    message: 'This feature is not yet implemented.',
    userMessage: 'This feature is not available.',
  },
  502: {
    code: 'BAD_GATEWAY',
    message: 'Service temporarily unavailable. Please try again later.',
    userMessage: 'Service unavailable. Please try again later.',
  },
  503: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'The service is temporarily unavailable. Please try again later.',
    userMessage: 'Service unavailable. Please try again later.',
  },
  504: {
    code: 'GATEWAY_TIMEOUT',
    message: 'The request timed out. Please try again.',
    userMessage: 'Request timed out. Please try again.',
  },
} as const;

export type StatusCode = keyof typeof statusCodeMap;

/**
 * Get error information from status code.
 * Returns standardized error info or sensible defaults.
 */
export function getStatusCodeInfo(statusCode: number) {
  const info = statusCodeMap[statusCode as StatusCode];

  if (info) {
    return info;
  }

  // Default for unknown status codes
  if (statusCode >= 400 && statusCode < 500) {
    return {
      code: 'CLIENT_ERROR',
      message: 'An error occurred with your request.',
      userMessage: 'Invalid request.',
    };
  }

  if (statusCode >= 500 && statusCode < 600) {
    return {
      code: 'SERVER_ERROR',
      message: 'An unexpected server error occurred. Please try again later.',
      userMessage: 'Something went wrong. Please try again later.',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
    userMessage: 'An error occurred.',
  };
}

/**
 * Error category by status code range.
 */
export function getErrorCategory(statusCode: number): 'client' | 'server' | 'unknown' {
  if (statusCode >= 400 && statusCode < 500) return 'client';
  if (statusCode >= 500 && statusCode < 600) return 'server';
  return 'unknown';
}

/**
 * Check if error is a client error (4xx).
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Check if error is a server error (5xx).
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Check if error is retriable based on status code.
 */
export function isRetriable(statusCode: number): boolean {
  // Client errors (except for specific cases) are generally not retriable
  if (statusCode === 429) return true; // Rate limited - retriable with backoff
  if (statusCode === 409) return true; // Conflict - might resolve with retry
  if (statusCode >= 400 && statusCode < 500) return false;

  // All 5xx errors are retriable
  return statusCode >= 500;
}
