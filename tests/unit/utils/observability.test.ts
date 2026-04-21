import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

describe("observability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks info events with structured payload", async () => {
    const { trackEvent } = await import("@/utils/observability");
    trackEvent({ name: "year_data_retry_clicked", data: { year: 1200 } });

    expect(mockLogger.info).toHaveBeenCalledWith("[telemetry:event]", {
      event: "year_data_retry_clicked",
      year: 1200,
    });
  });

  it("tracks warn and error events at matching log levels", async () => {
    const { trackEvent } = await import("@/utils/observability");
    trackEvent({ name: "warn_evt", level: "warn", data: { a: 1 } });
    trackEvent({ name: "err_evt", level: "error", data: { b: 2 } });

    expect(mockLogger.warn).toHaveBeenCalledWith("[telemetry:event]", {
      event: "warn_evt",
      a: 1,
    });
    expect(mockLogger.error).toHaveBeenCalledWith("[telemetry:event]", {
      event: "err_evt",
      b: 2,
    });
  });

  it("tracks timing with rounded milliseconds", async () => {
    const { trackTiming } = await import("@/utils/observability");
    trackTiming("towns_data_load_ms", 12.6, { result: "success" });

    expect(mockLogger.info).toHaveBeenCalledWith("[telemetry:event]", {
      event: "towns_data_load_ms",
      duration_ms: 13,
      result: "success",
    });
  });
});
