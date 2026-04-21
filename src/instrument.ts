import { initSentry } from "@/utils/sentry";

/**
 * Sidecar import loaded before app bootstrap so Sentry can patch globals
 * and capture startup/runtime errors consistently.
 */
initSentry();
