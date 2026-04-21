import * as Sentry from "@sentry/react";
import { logger } from "./logger";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const appOriginRegex =
  typeof window !== "undefined"
    ? new RegExp(
        `^${window.location.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
      )
    : null;

export const initSentry = (): void => {
  if (!sentryDsn) {
    logger.info("[sentry] Disabled (VITE_SENTRY_DSN not set)");
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_RELEASE || undefined,
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: Number(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1
    ),
    tracePropagationTargets: [
      "localhost",
      ...(appOriginRegex ? [appOriginRegex] : []),
    ],
    replaysSessionSampleRate: Number(
      import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE ?? 0.1
    ),
    replaysOnErrorSampleRate: Number(
      import.meta.env.VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE ?? 1.0
    ),
    enableLogs: true,
  });
};

export const captureSentryError = (
  error: unknown,
  context?: Record<string, unknown>
): void => {
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
};
