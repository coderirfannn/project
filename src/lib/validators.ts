import { z } from 'zod';

export const reservationConstants = {
  customerNameMinLength: 2,
  customerNameMaxLength: 120,
  customerEmailMaxLength: 180,
  skuMaxLength: 80,
  paymentReferenceMaxLength: 120,
  releaseReasonMaxLength: 120,
  reservationIdMaxLength: 64,
} as const;

export const trimmedString = (message = 'Invalid text input') =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(1, { message });

export const normalizedEmail = z
  .string({ required_error: 'Customer email is required', invalid_type_error: 'Customer email is required' })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address')
  .max(reservationConstants.customerEmailMaxLength, {
    message: `Email must be at most ${reservationConstants.customerEmailMaxLength} characters`,
  });

export const normalizedSku = z
  .string({ required_error: 'SKU is required', invalid_type_error: 'SKU is required' })
  .trim()
  .min(1, 'SKU is required')
  .max(reservationConstants.skuMaxLength, {
    message: `SKU must be at most ${reservationConstants.skuMaxLength} characters`,
  });

export const positiveQuantity = z
  .coerce.number({ invalid_type_error: 'Quantity must be a number' })
  .int('Quantity must be a whole number')
  .positive('Quantity must be greater than zero')
  .max(1000, 'Quantity is too large');

export const reservationId = z
  .string({ required_error: 'Reservation id is required', invalid_type_error: 'Reservation id is required' })
  .trim()
  .min(1, 'Reservation id is required')
  .max(reservationConstants.reservationIdMaxLength, {
    message: `Reservation id must be at most ${reservationConstants.reservationIdMaxLength} characters`,
  });

export const paymentReference = z
  .string({ invalid_type_error: 'Payment reference must be a string' })
  .trim()
  .min(1, 'Payment reference cannot be empty')
  .max(reservationConstants.paymentReferenceMaxLength, {
    message: `Payment reference must be at most ${reservationConstants.paymentReferenceMaxLength} characters`,
  })
  .optional();

export const releaseReason = z
  .string({ invalid_type_error: 'Release reason must be a string' })
  .trim()
  .min(1, 'Release reason cannot be empty')
  .max(reservationConstants.releaseReasonMaxLength, {
    message: `Release reason must be at most ${reservationConstants.releaseReasonMaxLength} characters`,
  })
  .optional();

export const createReservationSchema = z
  .object({
    customerName: z
      .string({ required_error: 'Customer name is required', invalid_type_error: 'Customer name is required' })
      .trim()
      .min(reservationConstants.customerNameMinLength, {
        message: `Customer name must be at least ${reservationConstants.customerNameMinLength} characters`,
      })
      .max(reservationConstants.customerNameMaxLength, {
        message: `Customer name must be at most ${reservationConstants.customerNameMaxLength} characters`,
      }),
    customerEmail: normalizedEmail,
    sku: normalizedSku,
    quantity: positiveQuantity,
  })
  .strict();

export const confirmReservationSchema = z
  .object({
    paymentReference,
  })
  .strict();

export const releaseReservationSchema = z
  .object({
    releaseReason,
  })
  .strict();

export const reservationRouteParamsSchema = z
  .object({
    id: reservationId,
  })
  .strict();

export const inventoryQuerySchema = z
  .object({
    sku: normalizedSku.optional(),
  })
  .strict();

export function formatReservationValidationError(error: z.ZodError): {
  message: string;
  issues: Array<{
    path: string;
    message: string;
    code: string;
  }>;
} {
  return {
    message: 'Reservation validation failed',
    issues: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
}

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ConfirmReservationInput = z.infer<typeof confirmReservationSchema>;
export type ReleaseReservationInput = z.infer<typeof releaseReservationSchema>;
export type ReservationRouteParamsInput = z.infer<typeof reservationRouteParamsSchema>;
export type ReservationValidationError = ReturnType<typeof formatReservationValidationError>;

export const reservationCreateSchema = createReservationSchema;
export const paymentReferenceSchema = confirmReservationSchema;
export const releaseReservationSchemaBody = releaseReservationSchema;

export type ReservationCreateInput = CreateReservationInput;
export type PaymentReferenceInput = ConfirmReservationInput;
export type ReleaseReservationInputBody = ReleaseReservationInput;
