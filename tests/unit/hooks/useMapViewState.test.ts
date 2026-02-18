/**
 * Tests for useMapViewState hook
 *
 * View state syncs to fit-from-props when viewport or initial fit change.
 * Breakpoint crosses are handled by MapContainer (remount); this hook handles
 * same-device resize and initial sync.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMapViewState } from "@/hooks/map/useMapViewState";

describe("useMapViewState", () => {
  const defaultViewport = {
    screenWidth: 1920,
    screenHeight: 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  };
  const defaultProps = {
    longitude: 10.0,
    latitude: 50.0,
    zoom: 5,
    viewport: defaultViewport,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with provided values", () => {
    const { result } = renderHook(() => useMapViewState(defaultProps));

    expect(result.current.viewState.longitude).toBe(10.0);
    expect(result.current.viewState.latitude).toBe(50.0);
    expect(result.current.viewState.zoom).toBe(5);
  });

  it("should update viewState when handleMove is called and keep it when props unchanged", () => {
    const { result, rerender } = renderHook(props => useMapViewState(props), {
      initialProps: defaultProps,
    });

    act(() => {});

    expect(result.current.viewState.longitude).toBe(10.0);
    expect(result.current.viewState.latitude).toBe(50.0);
    expect(result.current.viewState.zoom).toBe(5);

    act(() => {
      result.current.handleMove({
        viewState: {
          longitude: 20.0,
          latitude: 60.0,
          zoom: 6,
        },
      });
    });

    act(() => {});
    rerender(defaultProps);

    // Props unchanged so effect does not overwrite; viewState stays what handleMove set.
    expect(result.current.viewState.longitude).toBe(20.0);
    expect(result.current.viewState.latitude).toBe(60.0);
    expect(result.current.viewState.zoom).toBe(6);
  });

  it("should sync viewState to fit when device type changes (viewport change)", () => {
    const { result, rerender } = renderHook(props => useMapViewState(props), {
      initialProps: {
        ...defaultProps,
        viewport: { ...defaultViewport, isMobile: false, isDesktop: true },
      },
    });

    rerender({
      ...defaultProps,
      viewport: { ...defaultViewport, isMobile: true, isDesktop: false },
    });

    act(() => {});

    // Syncs to fitTargetFromProps when viewport changes.
    expect(result.current.viewState.longitude).toBe(10.0);
    expect(result.current.viewState.latitude).toBe(50.0);
    expect(result.current.viewState.zoom).toBe(5);
  });

  it("should handle zoom changes from handleMove", () => {
    const { result } = renderHook(() => useMapViewState(defaultProps));

    const initialZoom = result.current.viewState.zoom;

    act(() => {
      result.current.handleMove({
        viewState: {
          longitude: 10.0,
          latitude: 50.0,
          zoom: initialZoom + 0.05,
        },
      });
    });

    expect(result.current.viewState.zoom).toBe(initialZoom + 0.05);
  });

  it("should sync viewState to fit when screen dimensions change", () => {
    const { result, rerender } = renderHook(props => useMapViewState(props), {
      initialProps: {
        ...defaultProps,
        viewport: { ...defaultViewport, screenWidth: 1920, screenHeight: 1080 },
      },
    });

    rerender({
      ...defaultProps,
      viewport: { ...defaultViewport, screenWidth: 1024, screenHeight: 768 },
    });

    act(() => {});

    expect(result.current.viewState.longitude).toBe(10.0);
    expect(result.current.viewState.latitude).toBe(50.0);
    expect(result.current.viewState.zoom).toBe(5);
  });

  it("syncs to fit on viewport resize (same device); zoom comes from props", () => {
    const { result, rerender } = renderHook(props => useMapViewState(props), {
      initialProps: defaultProps,
    });

    act(() => {
      result.current.handleMove({
        viewState: {
          longitude: 11,
          latitude: 51,
          zoom: 7,
        },
      });
    });

    rerender({
      ...defaultProps,
      viewport: {
        ...defaultViewport,
        screenWidth: 1920,
        screenHeight: 1030,
      },
    });

    act(() => {});

    // Viewport changed so we sync to fitTargetFromProps (zoom from props).
    expect(result.current.viewState.zoom).toBe(5);
    expect(result.current.viewState.longitude).toBe(10.0);
    expect(result.current.viewState.latitude).toBe(50.0);
  });

  it("syncs viewState when zoom (fit) props change", () => {
    const { result, rerender } = renderHook(props => useMapViewState(props), {
      initialProps: {
        ...defaultProps,
        zoom: 4,
      },
    });

    act(() => {
      result.current.handleMove({
        viewState: {
          longitude: 11,
          latitude: 51,
          zoom: 6,
        },
      });
    });

    rerender({
      ...defaultProps,
      zoom: 2,
    });

    act(() => {});

    expect(result.current.viewState.zoom).toBe(2);

    rerender({
      ...defaultProps,
      zoom: 2.05,
    });

    act(() => {});

    expect(result.current.viewState.zoom).toBe(2.05);
  });
});
