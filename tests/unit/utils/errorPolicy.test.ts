import { describe, expect, it, vi } from "vitest";

import { getAppErrorMessage, reportAppError } from "@/utils/errorPolicy";
import { logger } from "@/utils/logger";

describe("errorPolicy", () => {
  it("uses category fallback for retry errors", () => {
    const msg = getAppErrorMessage(
      { reason: "internal detail" },
      {
        category: "year-data-retry",
        operation: "retry",
        year: 1200,
      }
    );
    expect(msg).toBe(
      "Failed to load data after multiple attempts. Please refresh the page."
    );
  });

  it("formats load-year errors with year context", () => {
    const msg = getAppErrorMessage("Please try again.", {
      category: "year-data-load",
      operation: "load",
      year: 1000,
    });
    expect(msg).toContain("Failed to load data for year 1000:");
  });

  it("uses screenshot capture fallback for unknown errors", () => {
    const msg = getAppErrorMessage(
      { reason: "internal detail" },
      {
        category: "screenshot-capture",
        operation: "html2canvas",
      }
    );
    expect(msg).toBe("Could not save map image. Please try again.");
  });

  it("uses no-towns-data fallback message", () => {
    const msg = getAppErrorMessage(null, {
      category: "no-towns-data",
      operation: "loadYearData",
    });
    expect(msg).toBe("No towns data available.");
  });

  it("reports structured context to logger", () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    reportAppError(new Error("boom"), {
      category: "initialization",
      operation: "bootstrap",
    });
    expect(spy).toHaveBeenCalledWith(
      "[app-error]",
      expect.objectContaining({
        category: "initialization",
        operation: "bootstrap",
      })
    );
    spy.mockRestore();
  });
});
