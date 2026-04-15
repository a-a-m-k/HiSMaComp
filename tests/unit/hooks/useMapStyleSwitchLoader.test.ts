import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMapStyleSwitchLoader } from "@/hooks/map/useMapStyleSwitchLoader";

describe("useMapStyleSwitchLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("completes dark-mode switch only after overlay and basemap are idle", () => {
    const { result, rerender } = renderHook(
      ({ mode }) => useMapStyleSwitchLoader({ mapStyleMode: mode }),
      { initialProps: { mode: "light" } }
    );

    expect(result.current.isStyleSwitching).toBe(false);

    rerender({ mode: "dark" });
    expect(result.current.isStyleSwitching).toBe(true);

    act(() => {
      result.current.onOverlayIdle();
    });
    expect(result.current.isStyleSwitching).toBe(true);

    act(() => {
      result.current.onBasemapIdle();
    });
    expect(result.current.isStyleSwitching).toBe(false);
  });

  it("completes light-mode switch when overlay is idle", () => {
    const { result, rerender } = renderHook(
      ({ mode }) => useMapStyleSwitchLoader({ mapStyleMode: mode }),
      { initialProps: { mode: "dark" } }
    );

    rerender({ mode: "light" });
    expect(result.current.isStyleSwitching).toBe(true);

    act(() => {
      result.current.onOverlayIdle();
    });
    expect(result.current.isStyleSwitching).toBe(false);
  });

  it("invokes onFirstIdle only once", () => {
    const onFirstIdle = vi.fn();
    const { result } = renderHook(() =>
      useMapStyleSwitchLoader({ mapStyleMode: "light", onFirstIdle })
    );

    act(() => {
      result.current.onOverlayIdle();
      result.current.onOverlayIdle();
      result.current.onOverlayIdle();
    });

    expect(onFirstIdle).toHaveBeenCalledTimes(1);
  });

  it("falls back after timeout when idle events do not fire", () => {
    const { result, rerender } = renderHook(
      ({ mode }) =>
        useMapStyleSwitchLoader({
          mapStyleMode: mode,
          styleSwitchTimeoutMs: 1000,
        }),
      { initialProps: { mode: "light" } }
    );

    rerender({ mode: "dark" });
    expect(result.current.isStyleSwitching).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isStyleSwitching).toBe(false);
  });
});
