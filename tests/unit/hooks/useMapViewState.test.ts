/**
 * Tests for useMapViewState hook
 *
 * View state syncs to fit-from-props only when longitude, latitude, or zoom change
 * (e.g. after remount). It does not sync on viewport resize so year changes don't reset the map.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMapViewState } from "@/hooks/map/useMapViewState";

describe("useMapViewState", () => {
  const defaultProps = {
    longitude: 10.0,
    latitude: 50.0,
    zoom: 5,
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

  it("should sync viewState to fit when longitude/latitude/zoom props change", () => {
    const { result, rerender } = renderHook(props => useMapViewState(props), {
      initialProps: defaultProps,
    });

    act(() => {
      result.current.handleMove({
        viewState: {
          longitude: 20.0,
          latitude: 60.0,
          zoom: 6,
        },
      });
    });

    // Props change → sync to new fit.
    rerender({
      longitude: 15.0,
      latitude: 55.0,
      zoom: 4,
    });

    act(() => {});

    expect(result.current.viewState.longitude).toBe(15.0);
    expect(result.current.viewState.latitude).toBe(55.0);
    expect(result.current.viewState.zoom).toBe(4);
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

  it("does not sync viewState when only viewport would change (preserves user pan/zoom)", () => {
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

    // Rerender with same fit props (e.g. viewport changed but lon/lat/zoom from parent unchanged).
    rerender({ ...defaultProps });

    act(() => {});

    // No sync: fit props unchanged, so user's viewState is preserved.
    expect(result.current.viewState.zoom).toBe(7);
    expect(result.current.viewState.longitude).toBe(11);
    expect(result.current.viewState.latitude).toBe(51);
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
