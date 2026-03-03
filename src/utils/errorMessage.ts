/**
 * Safe user-facing error message from unknown error.
 * In production only returns a generic fallback unless the message is in a known-safe set.
 */

/** In tests, can be overridden to simulate production. */
export const __isProduction = (): boolean => import.meta.env.PROD;

/** Messages we allow to show as-is in production (e.g. from locales). */
const SAFE_MESSAGES = new Set([
  "No towns data available",
  "Something went wrong. Please try again.",
  "Reload the page to try again.",
  "Please refresh the page.",
  "Please try again.",
  "Failed to load data after multiple attempts. Please refresh the page.",
  "Failed to load historical data. Please try refreshing the page.",
]);

/** Heuristic: reject messages that look like internal paths or stack traces. */
function looksUnsafe(message: string): boolean {
  const s = message.trim();
  if (s.length > 200) return true;
  if (/[\n\r]/.test(s)) return true;
  if (/\/[\w.-]+\//.test(s) || /^[A-Z]:\\/.test(s)) return true;
  if (/\bat\s+[\w.]+\s+\(/.test(s)) return true;
  return false;
}

/**
 * Returns a user-facing error message. In production, only returns the raw message
 * if it is in SAFE_MESSAGES and does not look unsafe; otherwise returns fallback.
 */
export function getUserFacingMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  let raw: string | undefined;
  if (error instanceof Error && error.message) {
    raw = error.message;
  } else if (typeof error === "string") {
    raw = error;
  } else {
    return fallback;
  }

  if (!__isProduction()) {
    return raw;
  }

  if (SAFE_MESSAGES.has(raw) && !looksUnsafe(raw)) {
    return raw;
  }
  return fallback;
}
