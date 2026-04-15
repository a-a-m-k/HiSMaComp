/**
 * Tests for useAnimateCameraToFit: imperative flyTo / jumpTo camera animation
 * (must not spread cameraFitTarget into Map props — see MapView).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { MutableRefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import {
  useAnimateCameraToFit,
  FLY_DURATION_MS,
  FLY_CURVE,
} from "@/hooks/map/useAnimateCameraToFit";
import type { CameraFitTarget } from "@/hooks/map/useMapViewState";

function createMapLibreMapMock() {
  const flyTo = vi.fn();
  const jumpTo = vi.fn();
  const stop = vi.fn();
  let moveEndHandler: (() => void) | undefined;
  const once = vi.fn((event: string, handler: () => void) => {
    if (event === "moveend") {
      moveEndHandler = handler;
    }
  });

  return {
    flyTo,
    jumpTo,
    stop,
    once,
    fireMoveEnd: () => moveEndHandler?.(),
  };
}

function mapRefFromInstance(
  instance: ReturnType<typeof createMapLibreMapMock>
): React.RefObject<MapRef | null> {
  return {
    current: {
      getMap: () =>
        instance as unknown as ReturnType<NonNullable<MapRef["getMap"]>>,
    } as MapRef,
  };
}

describe("useAnimateCameraToFit", () => {
  const target: CameraFitTarget = {
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 5.5,
  };

  beforeEach(() => {
    vi.spyOn(global, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not call map methods when cameraFitTarget is null", () => {
    const primary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const onComplete = vi.fn();

    renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: null,
        onCameraFitComplete: onComplete,
        syncViewStateFromMap: vi.fn(),
        cameraFitTargetRefForSync: { current: null },
      })
    );

    expect(primary.flyTo).not.toHaveBeenCalled();
    expect(primary.jumpTo).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("schedules onCameraFitComplete when map ref is null", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const mapRef = { current: null } as React.RefObject<MapRef | null>;

    renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: target,
        onCameraFitComplete: onComplete,
        syncViewStateFromMap: vi.fn(),
        cameraFitTargetRefForSync: { current: null },
      })
    );

    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("calls flyTo on primary map with target, duration, curve, and essential", () => {
    const primary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const onComplete = vi.fn();

    renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: target,
        onCameraFitComplete: onComplete,
        syncViewStateFromMap: vi.fn(),
        cameraFitTargetRefForSync: { current: null },
      })
    );

    expect(primary.flyTo).toHaveBeenCalledTimes(1);
    expect(primary.flyTo).toHaveBeenCalledWith({
      center: [target.longitude, target.latitude],
      zoom: target.zoom,
      duration: FLY_DURATION_MS,
      curve: FLY_CURVE,
      essential: true,
    });
    expect(primary.stop).toHaveBeenCalled();
    expect(primary.once).toHaveBeenCalledWith("moveend", expect.any(Function));
  });

  it("calls flyTo on secondary map when secondaryMapRef is set", () => {
    const primary = createMapLibreMapMock();
    const secondary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const secondaryMapRef = mapRefFromInstance(secondary);

    renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        secondaryMapRef,
        cameraFitTarget: target,
        onCameraFitComplete: vi.fn(),
        syncViewStateFromMap: vi.fn(),
        cameraFitTargetRefForSync: { current: null },
      })
    );

    expect(secondary.flyTo).toHaveBeenCalledTimes(1);
    expect(secondary.flyTo).toHaveBeenCalledWith({
      center: [target.longitude, target.latitude],
      zoom: target.zoom,
      duration: FLY_DURATION_MS,
      curve: FLY_CURVE,
      essential: true,
    });
    expect(secondary.stop).toHaveBeenCalled();
  });

  it("uses jumpTo and completes immediately when prefersReducedMotion is true", () => {
    const primary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const onComplete = vi.fn();

    renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: target,
        onCameraFitComplete: onComplete,
        syncViewStateFromMap: vi.fn(),
        cameraFitTargetRefForSync: { current: null },
        prefersReducedMotion: true,
      })
    );

    expect(primary.jumpTo).toHaveBeenCalledWith({
      center: [target.longitude, target.latitude],
      zoom: target.zoom,
    });
    expect(primary.flyTo).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("invokes onCameraFitComplete when moveend fires", () => {
    const primary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const onComplete = vi.fn();

    renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: target,
        onCameraFitComplete: onComplete,
        syncViewStateFromMap: vi.fn(),
        cameraFitTargetRefForSync: { current: null },
      })
    );

    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      primary.fireMoveEnd();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls syncViewStateFromMap with target on unmount cleanup", () => {
    const primary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const sync = vi.fn();
    const cameraFitTargetRefForSync: MutableRefObject<CameraFitTarget | null> =
      { current: target };

    const { unmount } = renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: target,
        onCameraFitComplete: vi.fn(),
        syncViewStateFromMap: sync,
        cameraFitTargetRefForSync,
      })
    );

    act(() => {
      unmount();
    });

    expect(sync).toHaveBeenCalledWith(target);
  });

  it("skips syncViewStateFromMap on unmount when cameraFitTargetRefForSync.current is null", () => {
    const primary = createMapLibreMapMock();
    const mapRef = mapRefFromInstance(primary);
    const sync = vi.fn();

    const { unmount } = renderHook(() =>
      useAnimateCameraToFit({
        mapRef,
        cameraFitTarget: target,
        onCameraFitComplete: vi.fn(),
        syncViewStateFromMap: sync,
        cameraFitTargetRefForSync: { current: null },
      })
    );

    act(() => {
      unmount();
    });

    expect(sync).not.toHaveBeenCalled();
  });
});
