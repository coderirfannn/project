/**
 * Centralized error handling system exports.
 * Provides custom error classes, response formatting, and utilities.
 */

// Error classes
export {
  AppError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  InventoryError,
  NotFoundError,
  RateLimitError,
  ReservationError,
  ValidationError,
} from './app-error';

// HTTP status mapping
export {
  getErrorCategory,
  getStatusCodeInfo,
  isClientError,
  isRetriable,
  isServerError,
  type StatusCode,
} from './status-map';

// Response formatting
export {
  createErrorResponse,
  createStatusErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  getErrorMessage,
  getRetryDelay,
  isErrorResponse,
  isErrorRetriable,
  isSuccessResponse,
  type ApiErrorResponse,
  type ApiResponse,
} from './response';

// Async handlers and utilities
export {
  generateTraceId,
  handleError,
  jsonErrorResponse,
  jsonResponse,
  logError,
  withAsyncHandler,
  withAsyncRequest,
  type AsyncRequestHandler,
  type AsyncRouteHandler,
} from './async-handler';

// Frontend error handling
export {
  FrontendApiError,
  getErrorCode,
  getErrorMessage as getFrontendErrorMessage,
  getRetryDelay as getFrontendRetryDelay,
  handleApiError,
  isErrorType,
  parseApiResponse,
  shouldRetry,
} from './frontend';

// Error messages
export { getErrorMessageFor, getValidationMessage, userFriendlyMessages } from './error-messages';
