/**
 * User-friendly error messages mapped to error codes.
 * Provides consistent messaging across the application.
 * Suitable for i18n integration by replacing message strings.
 */

export const userFriendlyMessages = {
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_INPUT: 'The information you provided is not valid.',
  MISSING_REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',

  // Authentication errors
  AUTHENTICATION_ERROR: 'Please log in to continue.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please try again later.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',

  // Authorization errors
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  INSUFFICIENT_PERMISSIONS: 'Your account does not have the required permissions.',
  ADMIN_ONLY: 'This action is only available to administrators.',

  // Resource errors
  NOT_FOUND_ERROR: 'The resource you are looking for does not exist.',
  PRODUCT_NOT_FOUND: 'The product could not be found.',
  ORDER_NOT_FOUND: 'The order could not be found.',
  USER_NOT_FOUND: 'The user could not be found.',
  RESOURCE_NOT_FOUND: 'The requested resource does not exist.',

  // Conflict errors
  CONFLICT_ERROR: 'This action conflicts with the current state.',
  DUPLICATE_EMAIL: 'This email address is already in use.',
  DUPLICATE_USERNAME: 'This username is already taken.',
  RESOURCE_ALREADY_EXISTS: 'This resource already exists.',
  STATE_CONFLICT: 'The resource state does not allow this operation.',

  // Inventory-specific errors
  INVENTORY_ERROR: 'Unable to process inventory request.',
  INSUFFICIENT_STOCK: 'There is not enough stock available.',
  INVALID_QUANTITY: 'Please enter a valid quantity.',
  WAREHOUSE_NOT_FOUND: 'The warehouse could not be found.',
  INVENTORY_UPDATE_FAILED: 'Failed to update inventory.',

  // Reservation-specific errors
  RESERVATION_ERROR: 'Unable to process reservation.',
  RESERVATION_EXPIRED: 'Your reservation has expired.',
  INVALID_RESERVATION_STATE: 'This action is not valid for the current reservation state.',
  RESERVATION_NOT_FOUND: 'The reservation could not be found.',
  CANNOT_MODIFY_CONFIRMED: 'You cannot modify a confirmed reservation.',
  CANNOT_CONFIRM_RESERVATION: 'This reservation cannot be confirmed.',
  CANNOT_RELEASE_RESERVATION: 'This reservation cannot be released.',

  // Payment errors
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  INVALID_PAYMENT_METHOD: 'The payment method is not valid.',
  PAYMENT_DECLINED: 'Your payment was declined. Please try another method.',

  // Database errors
  DATABASE_ERROR: 'A database error occurred. Please try again later.',
  DATA_INTEGRITY_ERROR: 'A data integrity error occurred.',

  // External service errors
  EXTERNAL_SERVICE_ERROR: 'An external service is currently unavailable.',
  PAYMENT_GATEWAY_ERROR: 'The payment gateway is unavailable. Please try again later.',
  EMAIL_SERVICE_ERROR: 'Unable to send email. Please try again later.',

  // Rate limiting
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  RATE_LIMIT_EXCEEDED: 'You have made too many requests. Please try again later.',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts. Please try again later.',

  // Server errors
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
  GATEWAY_TIMEOUT: 'The request took too long. Please try again.',
  NOT_IMPLEMENTED: 'This feature is not yet available.',

  // Network errors
  NETWORK_ERROR: 'A network error occurred. Please check your connection and try again.',
  REQUEST_TIMEOUT: 'The request timed out. Please try again.',
  CONNECTION_REFUSED: 'Unable to connect to the server. Please check your connection.',

  // Unknown errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
} as const;

export type ErrorCode = keyof typeof userFriendlyMessages;

/**
 * Get user-friendly message for an error code.
 * Returns the message or a fallback if the code is not found.
 */
export function getErrorMessageFor(code: string, fallback: string = 'An error occurred'): string {
  return userFriendlyMessages[code as ErrorCode] || fallback;
}

/**
 * Get validation message for common validation scenarios.
 */
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  email: 'Please enter a valid email address',
  minLength: (fieldName: string, length: number) => `${fieldName} must be at least ${length} characters`,
  maxLength: (fieldName: string, length: number) => `${fieldName} must not exceed ${length} characters`,
  pattern: (fieldName: string) => `${fieldName} is not in the correct format`,
  number: (fieldName: string) => `${fieldName} must be a number`,
  positive: (fieldName: string) => `${fieldName} must be greater than 0`,
  future: (fieldName: string) => `${fieldName} must be in the future`,
  past: (fieldName: string) => `${fieldName} must be in the past`,
  match: (fieldName: string) => `${fieldName} does not match`,
};

/**
 * Get validation message for a specific field and rule.
 */
export function getValidationMessage(
  fieldName: string,
  rule: keyof typeof validationMessages,
  ...args: any[]
): string {
  const messageFn = validationMessages[rule] as any;

  if (typeof messageFn === 'function') {
    return messageFn(fieldName, ...args);
  }

  return messageFn;
}
