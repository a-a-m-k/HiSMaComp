/**
 * Centralized user-facing error messages.
 * Use for consistency and easier copy updates.
 */

/**
 * Returns a safe, user-facing message from an unknown error.
 *
 * @param error - Caught error (Error instance or unknown)
 * @param fallback - Message when error has no usable message
 */
export function getUserFacingMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}
