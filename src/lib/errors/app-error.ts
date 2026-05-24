/**
 * Base application error class with standardized error information.
 * All application errors should extend this class.
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = true;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(this.context && { context: this.context }),
    };
  }
}

/**
 * Validation error for input/request validation failures.
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error for missing/invalid authentication.
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for insufficient permissions.
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error for missing resources.
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error for state conflicts (e.g., duplicate resource).
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Record<string, unknown>) {
    super(message, 'CONFLICT_ERROR', 409, context);
    this.name = 'ConflictError';
  }
}

/**
 * Database error for data access issues.
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, context);
    this.name = 'DatabaseError';
  }
}

/**
 * External service error for third-party API failures.
 */
export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service unavailable', context?: Record<string, unknown>) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 503, context);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Rate limit error for throttling.
 */
export class RateLimitError extends AppError {
  readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number, context?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', 429, context);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.retryAfter && { retryAfter: this.retryAfter }),
    };
  }
}

/**
 * Business logic error for domain-specific failures.
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR', context?: Record<string, unknown>) {
    super(message, code, 400, context);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Inventory-specific error for stock-related failures.
 */
export class InventoryError extends BusinessLogicError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'INVENTORY_ERROR', context);
    this.name = 'InventoryError';
  }
}

/**
 * Reservation-specific error for reservation failures.
 */
export class ReservationError extends BusinessLogicError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'RESERVATION_ERROR', context);
    this.name = 'ReservationError';
  }
}
