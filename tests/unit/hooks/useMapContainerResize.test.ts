/**
 * Tests for useMapContainerResize hook.
 * Tracks container size via ResizeObserver and schedules map.resize() on window resize.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useMapContainerResize } from "@/hooks/map/useMapContainerResize";

describe("useMapContainerResize", () => {
  let resizeCallback: (
    entries: { contentRect: { width: number; height: number } }[]
  ) => void;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    vi.mocked(global.ResizeObserver).mockImplementation(
      (
        cb: (
          entries: { contentRect: { width: number; height: number } }[]
        ) => void
      ) => {
        resizeCallback = cb;
        return { observe, unobserve: vi.fn(), disconnect };
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when container ref is null", () => {
    const containerRef = { current: null };
    const mapRef = { current: null };
    const { result } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef)
    );
    expect(result.current).toBeNull();
  });

  it("observes container when ref has element and updates size when ResizeObserver fires", async () => {
    const el = document.createElement("div");
    const containerRef = { current: el };
    const mapRef = { current: null };

    const { result, rerender } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef)
    );

    await new Promise<void>(r => requestAnimationFrame(() => r()));
    expect(observe).toHaveBeenCalledWith(el);

    act(() => {
      if (typeof resizeCallback === "function") {
        resizeCallback([{ contentRect: { width: 800, height: 600 } }]);
      }
    });
    expect(result.current).toEqual({ width: 800, height: 600 });
  });

  it("disconnects ResizeObserver on unmount", async () => {
    const el = document.createElement("div");
    const containerRef = { current: el };
    const mapRef = { current: null };

    const { unmount } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef)
    );
    await new Promise<void>(r => requestAnimationFrame(() => r()));
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it("adds and removes window resize and orientationchange listeners", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const containerRef = { current: document.createElement("div") };
    const mapRef = { current: null };

    const { unmount } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef)
    );

    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith(
      "orientationchange",
      expect.any(Function)
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith(
      "orientationchange",
      expect.any(Function)
    );

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("edge: ResizeObserver callback with empty entries does not throw", async () => {
    const el = document.createElement("div");
    const containerRef = { current: el };
    const mapRef = { current: null };

    renderHook(() => useMapContainerResize(containerRef, mapRef));
    await new Promise<void>(r => requestAnimationFrame(() => r()));

    expect(() => {
      if (typeof resizeCallback === "function") {
        resizeCallback([]);
      }
    }).not.toThrow();
  });

  it("edge: same dimensions reported again does not change state reference", async () => {
    const el = document.createElement("div");
    const containerRef = { current: el };
    const mapRef = { current: null };

    const { result } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef)
    );
    await new Promise<void>(r => requestAnimationFrame(() => r()));

    act(() => {
      if (typeof resizeCallback === "function") {
        resizeCallback([{ contentRect: { width: 400, height: 300 } }]);
      }
    });
    const first = result.current;
    expect(first).toEqual({ width: 400, height: 300 });

    act(() => {
      if (typeof resizeCallback === "function") {
        resizeCallback([{ contentRect: { width: 400, height: 300 } }]);
      }
    });
    const second = result.current;
    expect(second).toEqual({ width: 400, height: 300 });
    expect(second).toBe(first);
  });

  it("edge: zero width/height from ResizeObserver updates state", async () => {
    const el = document.createElement("div");
    const containerRef = { current: el };
    const mapRef = { current: null };

    const { result } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef)
    );
    await new Promise<void>(r => requestAnimationFrame(() => r()));

    act(() => {
      if (typeof resizeCallback === "function") {
        resizeCallback([{ contentRect: { width: 0, height: 0 } }]);
      }
    });
    expect(result.current).toEqual({ width: 0, height: 0 });
  });
});
