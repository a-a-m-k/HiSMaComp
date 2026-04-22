import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useYearDataController } from "@/context/useYearDataController";
import { mockTownsMinimal } from "../../helpers/testUtils";

const {
  mockGetFilteredTowns,
  mockCalculateBoundsCenter,
  mockAnnounce,
  mockRetryWithBackoff,
  mockReportAppError,
  mockGetAppErrorMessage,
  mockTrackEvent,
  mockTrackTiming,
} = vi.hoisted(() => ({
  mockGetFilteredTowns: vi.fn(),
  mockCalculateBoundsCenter: vi.fn(() => ({
    latitude: 48.8566,
    longitude: 2.3522,
  })),
  mockAnnounce: vi.fn(),
  mockRetryWithBackoff: vi.fn(
    async (fn: () => Promise<unknown>) => fn() as Promise<void>
  ),
  mockReportAppError: vi.fn(),
  mockGetAppErrorMessage: vi.fn(
    (error: unknown, context?: { category?: string }) => {
      const category = context?.category;
      if (category === "no-towns-data") return "No towns data available.";
      if (category === "year-data-retry") {
        return "Failed to load data after multiple attempts. Please refresh the page.";
      }
      if (error instanceof Error) return error.message;
      return "Unexpected error";
    }
  ),
  mockTrackEvent: vi.fn(),
  mockTrackTiming: vi.fn(),
}));

vi.mock("@/utils/retry", () => ({
  retryWithBackoff: mockRetryWithBackoff,
}));

vi.mock("@/services", () => ({
  yearDataService: {
    getFilteredTowns: mockGetFilteredTowns,
  },
}));

vi.mock("@/utils/geoBounds", () => ({
  calculateBoundsCenter: mockCalculateBoundsCenter,
}));

vi.mock("@/utils/accessibility", () => ({
  announce: mockAnnounce,
}));

vi.mock("@/utils/errorPolicy", () => ({
  reportAppError: mockReportAppError,
  getAppErrorMessage: mockGetAppErrorMessage,
}));

vi.mock("@/utils/observability", () => ({
  trackEvent: mockTrackEvent,
  trackTiming: mockTrackTiming,
}));

describe("useYearDataController", () => {
  const emptyTowns: typeof mockTownsMinimal = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRetryWithBackoff.mockImplementation(
      async (fn: () => Promise<unknown>) => {
        await fn();
      }
    );
    mockGetFilteredTowns.mockImplementation((towns, year: number) =>
      towns.filter(
        (t: { populationByYear?: Record<string, number> }) =>
          t.populationByYear?.[String(year)] != null
      )
    );
    mockCalculateBoundsCenter.mockImplementation(() => ({
      latitude: 48.8566,
      longitude: 2.3522,
    }));
  });

  it("loads filtered towns after bounds initialization", async () => {
    const { result } = renderHook(() =>
      useYearDataController({ towns: mockTownsMinimal, selectedYear: 1000 })
    );

    await waitFor(() => {
      expect(result.current.filteredTowns).toHaveLength(2);
    });
    expect(result.current.error).toBeNull();
  });

  it("sets error when calculateBoundsCenter fails during init", async () => {
    mockCalculateBoundsCenter.mockImplementation(() => {
      throw new Error("bounds");
    });

    const { result } = renderHook(() =>
      useYearDataController({ towns: mockTownsMinimal, selectedYear: 1000 })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.filteredTowns).toEqual([]);
  });

  it("sets error and announces when getFilteredTowns throws", async () => {
    mockGetFilteredTowns.mockImplementation(() => {
      throw new Error("service failure");
    });

    const { result } = renderHook(() =>
      useYearDataController({ towns: mockTownsMinimal, selectedYear: 1000 })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(mockAnnounce).toHaveBeenCalledWith(expect.any(String), "assertive");
  });

  it("retry with empty towns sets a clear error", async () => {
    const { result } = renderHook(() =>
      useYearDataController({ towns: emptyTowns, selectedYear: 800 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.retry();
    });

    expect(result.current.error).toBe("No towns data available.");
    expect(mockAnnounce).toHaveBeenCalledWith(
      "No towns data available.",
      "assertive"
    );
  });

  it("updates filtered towns when selectedYear changes", async () => {
    const { result, rerender } = renderHook(
      ({ year }: { year: number }) =>
        useYearDataController({ towns: mockTownsMinimal, selectedYear: year }),
      { initialProps: { year: 800 } }
    );

    await waitFor(() => {
      expect(result.current.filteredTowns).toHaveLength(1);
    });
    expect(result.current.filteredTowns[0]?.name).toBe("Paris");

    rerender({ year: 1000 });

    await waitFor(() => {
      expect(result.current.filteredTowns).toHaveLength(2);
    });
  });

  it("after retry exhaustion, surfaces retry category message", async () => {
    mockGetFilteredTowns.mockImplementation(() => {
      throw new Error("always fail");
    });

    const { result } = renderHook(() =>
      useYearDataController({ towns: mockTownsMinimal, selectedYear: 1000 })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    mockRetryWithBackoff.mockRejectedValue({ reason: "exhausted" });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Failed to load data after multiple attempts. Please refresh the page."
      );
    });
  });
});
