import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import type { CameraFitTarget } from "./useMapViewState";

import type { FlyToOptions } from "maplibre-gl";

/** Single flight path: zooms out along an arc then in — feels much less “static” than easeTo. */
export const FLY_DURATION_MS = 500;
/** >1.42 = more pronounced zoom-out mid-flight (MapLibre default curve is 1.42). */
export const FLY_CURVE = 1.58;

interface UseAnimateCameraToFitParams {
  mapRef: RefObject<MapRef | null>;
  secondaryMapRef?: RefObject<MapRef | null>;
  cameraFitTarget: CameraFitTarget | null;
  onCameraFitComplete: () => void;
  syncViewStateFromMap: (state: CameraFitTarget) => void;
  cameraFitTargetRefForSync: RefObject<CameraFitTarget | null>;
  prefersReducedMotion?: boolean;
}

/**
 * Imperative camera animation to `cameraFitTarget`.
 * Map props must stay on `viewState` only (see MapView) so React does not snap to the target
 * and cancel this animation.
 */
export function useAnimateCameraToFit({
  mapRef,
  secondaryMapRef,
  cameraFitTarget,
  onCameraFitComplete,
  syncViewStateFromMap,
  cameraFitTargetRefForSync,
  prefersReducedMotion = false,
}: UseAnimateCameraToFitParams) {
  useEffect(() => {
    if (!cameraFitTarget) return;

    if (!mapRef.current) {
      const fallbackId = setTimeout(onCameraFitComplete, 80);
      return () => clearTimeout(fallbackId);
    }

    const map = mapRef.current.getMap();
    if (!map) return;

    let cancelled = false;
    let syncFallbackId: ReturnType<typeof setTimeout> | null = null;
    const target = cameraFitTarget;
    const refForSyncCurrent = cameraFitTargetRefForSync.current;

    const map2 = secondaryMapRef?.current?.getMap();

    const finishAnimation = () => {
      if (syncFallbackId !== null) {
        clearTimeout(syncFallbackId);
        syncFallbackId = null;
      }
      if (cancelled) return;
      onCameraFitComplete();
    };

    const onFinalMoveEnd = () => {
      if (cancelled) return;
      finishAnimation();
    };

    const scheduleFallback = (ms: number) => {
      if (syncFallbackId !== null) clearTimeout(syncFallbackId);
      syncFallbackId = setTimeout(() => {
        syncFallbackId = null;
        if (cancelled) return;
        finishAnimation();
      }, ms);
    };

    const runFly = () => {
      if (cancelled) return;
      map.stop();
      map2?.stop();

      const centerTarget: [number, number] = [
        target.longitude,
        target.latitude,
      ];
      const zTarget = target.zoom;

      if (prefersReducedMotion) {
        map.jumpTo({ center: centerTarget, zoom: zTarget });
        map2?.jumpTo({ center: centerTarget, zoom: zTarget });
        finishAnimation();
        return;
      }

      const flyOpts: FlyToOptions = {
        center: centerTarget,
        zoom: zTarget,
        duration: FLY_DURATION_MS,
        curve: FLY_CURVE,
        essential: true,
      };

      map.flyTo(flyOpts);
      map2?.flyTo(flyOpts);

      scheduleFallback(FLY_DURATION_MS + 400);
      map.once("moveend", onFinalMoveEnd);
    };

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (!cancelled) runFly();
      });
    });

    return () => {
      cancelled = true;
      if (syncFallbackId !== null) clearTimeout(syncFallbackId);
      cancelAnimationFrame(rafId);
      map.stop();
      map2?.stop();
      if (refForSyncCurrent !== null) {
        syncViewStateFromMap(target);
      }
    };
  }, [
    cameraFitTarget,
    onCameraFitComplete,
    syncViewStateFromMap,
    mapRef,
    secondaryMapRef,
    cameraFitTargetRefForSync,
    prefersReducedMotion,
  ]);
}
