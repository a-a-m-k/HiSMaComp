import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOverlayButtonsVisible } from "@/hooks/ui/useOverlayButtonsVisible";
import { RESIZE_DEBOUNCE_MS } from "@/constants/breakpoints";

describe("useOverlayButtonsVisible", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("returns showOverlayButtons false when map not idle", () => {
    const { result } = renderHook(() => useOverlayButtonsVisible(false));
    expect(result.current.showOverlayButtons).toBe(false);
    expect(result.current.isResizing).toBe(false);
  });

  it("returns showOverlayButtons true when map idle and not resizing", () => {
    const { result } = renderHook(() => useOverlayButtonsVisible(true));
    expect(result.current.showOverlayButtons).toBe(true);
    expect(result.current.isResizing).toBe(false);
  });

  it("sets isResizing true and showOverlayButtons false on resize event", () => {
    const { result } = renderHook(() => useOverlayButtonsVisible(true));

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.isResizing).toBe(true);
    expect(result.current.showOverlayButtons).toBe(false);
  });

  it("clears isResizing after RESIZE_DEBOUNCE_MS of no resize", () => {
    const { result } = renderHook(() => useOverlayButtonsVisible(true));

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isResizing).toBe(true);

    act(() => {
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
    });

    expect(result.current.isResizing).toBe(false);
    expect(result.current.showOverlayButtons).toBe(true);
  });

  it("resets debounce timer on subsequent resize events", () => {
    const { result } = renderHook(() => useOverlayButtonsVisible(true));

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    act(() => {
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS - 50);
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    act(() => {
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS - 50);
    });
    expect(result.current.isResizing).toBe(true);

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.isResizing).toBe(false);
  });

  it("responds to orientationchange like resize", () => {
    const { result } = renderHook(() => useOverlayButtonsVisible(true));

    act(() => {
      window.dispatchEvent(new Event("orientationchange"));
    });
    expect(result.current.isResizing).toBe(true);
  });
});
