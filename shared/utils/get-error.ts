import { createError, H3Error } from 'h3'

/**
 * Normalizes thrown values into `H3Error`s for consistent API responses.
 *
 * - Re-throws existing `H3Error`s as-is
 * - Wraps standard `Error` objects as 500 Internal errors
 * - Handles unknown throw shapes with a generic 500
 */
export default function (error: unknown) {
  
  if (error instanceof H3Error) {
    throw createError(error)
  }
      
  if (error instanceof Error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_SERVER_ERROR',
      message: error.message,
    })
  }
      
  throw createError({
    statusCode: 500,
    statusMessage: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  })
}
