import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

const mockInit = vi.hoisted(() => vi.fn());
const mockCaptureException = vi.hoisted(() => vi.fn());
const mockSetExtra = vi.hoisted(() => vi.fn());
const mockWithScope = vi.hoisted(() =>
  vi.fn((fn: (scope: { setExtra: (k: string, v: unknown) => void }) => void) =>
    fn({ setExtra: mockSetExtra })
  )
);

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

vi.mock("@sentry/react", () => ({
  init: mockInit,
  withScope: mockWithScope,
  captureException: mockCaptureException,
  browserTracingIntegration: vi.fn(() => "browserTracingIntegration"),
  replayIntegration: vi.fn(() => "replayIntegration"),
}));

describe("sentry utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does not initialize Sentry when DSN is absent", async () => {
    vi.stubEnv("VITE_SENTRY_DSN", "");
    const { initSentry } = await import("@/utils/sentry");
    initSentry();

    expect(mockInit).not.toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "[sentry] Disabled (VITE_SENTRY_DSN not set)"
    );
  });

  it("initializes Sentry when DSN is present", async () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://example@sentry.io/1");
    vi.stubEnv("VITE_SENTRY_TRACES_SAMPLE_RATE", "0.2");
    vi.stubEnv("VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE", "0.3");
    vi.stubEnv("VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE", "1.0");

    const { initSentry } = await import("@/utils/sentry");
    initSentry();

    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://example@sentry.io/1",
        tracesSampleRate: 0.2,
        replaysSessionSampleRate: 0.3,
        replaysOnErrorSampleRate: 1.0,
        enableLogs: true,
      })
    );
  });

  it("captures errors with contextual extras", async () => {
    const { captureSentryError } = await import("@/utils/sentry");
    const error = new Error("boom");
    captureSentryError(error, { category: "year-data-load", year: 1000 });

    expect(mockWithScope).toHaveBeenCalledOnce();
    expect(mockSetExtra).toHaveBeenCalledWith("category", "year-data-load");
    expect(mockSetExtra).toHaveBeenCalledWith("year", 1000);
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });
});
