import { useEffect, useRef, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import type { CameraFitTarget } from "./useMapViewState";

const CAMERA_FIT_ANIMATION_DURATION_MS = 480;
const CAMERA_FIT_ANIMATION_FALLBACK_MS = CAMERA_FIT_ANIMATION_DURATION_MS + 120;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface UseAnimateCameraToFitParams {
  mapRef: RefObject<MapRef | null>;
  /** When set, the map will animate to this camera position (e.g. after resize). */
  cameraFitTarget: CameraFitTarget | null;
  /** Called when the map has finished animating to the target. */
  onCameraFitComplete: () => void;
  /** Updates React view state to match the map (called on cleanup if animation was in progress). */
  syncViewStateFromMap: (state: CameraFitTarget) => void;
  /** Ref mirror of cameraFitTarget for use in cleanup. */
  cameraFitTargetRefForSync: RefObject<CameraFitTarget | null>;
}

/**
 * When cameraFitTarget is set, animates the map camera to that position (e.g. after viewport resize).
 * Returns a ref that is true while the animation runs so the consumer can ignore onMove during it.
 */
export function useAnimateCameraToFit({
  mapRef,
  cameraFitTarget,
  onCameraFitComplete,
  syncViewStateFromMap,
  cameraFitTargetRefForSync,
}: UseAnimateCameraToFitParams) {
  const isCameraFitAnimatingRef = useRef(false);

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
    isCameraFitAnimatingRef.current = true;
    const target = cameraFitTarget;
    const refForSyncCurrent = cameraFitTargetRefForSync.current;

    const onMoveEnd = () => {
      map.off("moveend", onMoveEnd);
      if (syncFallbackId !== null) {
        clearTimeout(syncFallbackId);
        syncFallbackId = null;
      }
      if (cancelled) return;
      isCameraFitAnimatingRef.current = false;
      onCameraFitComplete();
    };

    map.once("moveend", onMoveEnd);

    syncFallbackId = setTimeout(() => {
      syncFallbackId = null;
      if (cancelled) return;
      map.off("moveend", onMoveEnd);
      isCameraFitAnimatingRef.current = false;
      onCameraFitComplete();
    }, CAMERA_FIT_ANIMATION_FALLBACK_MS);

    const runEase = () => {
      if (cancelled) return;
      map.stop();
      const center: [number, number] = [target.longitude, target.latitude];
      map.jumpTo({ center, zoom: map.getZoom() });
      map.easeTo({
        center,
        zoom: target.zoom,
        duration: CAMERA_FIT_ANIMATION_DURATION_MS,
        easing: easeInOutCubic,
      });
    };

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (!cancelled) runEase();
      });
    });

    return () => {
      cancelled = true;
      isCameraFitAnimatingRef.current = false;
      if (syncFallbackId !== null) clearTimeout(syncFallbackId);
      cancelAnimationFrame(rafId);
      map.off("moveend", onMoveEnd);
      map.stop();
      if (refForSyncCurrent !== null) {
        syncViewStateFromMap(target);
      }
    };
  }, [
    cameraFitTarget,
    onCameraFitComplete,
    syncViewStateFromMap,
    mapRef,
    cameraFitTargetRefForSync,
  ]);

  return isCameraFitAnimatingRef;
}
