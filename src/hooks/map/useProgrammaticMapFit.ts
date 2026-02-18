import { useEffect, useRef, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import type { ProgrammaticTarget } from "./useMapViewState";

const PROGRAMMATIC_FIT_DURATION_MS = 480;
const PROGRAMMATIC_FIT_FALLBACK_MS = PROGRAMMATIC_FIT_DURATION_MS + 120;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface UseProgrammaticMapFitParams {
  mapRef: RefObject<MapRef | null>;
  programmaticTarget: ProgrammaticTarget | null;
  onProgrammaticAnimationEnd: () => void;
  syncViewStateFromMap: (state: ProgrammaticTarget) => void;
  programmaticTargetRefForSync: RefObject<ProgrammaticTarget | null>;
}

/**
 * Runs a smooth easeTo when programmaticTarget is set (e.g. after resize).
 * Returns a ref that is true while animating so the consumer can ignore onMove during the animation.
 */
export function useProgrammaticMapFit({
  mapRef,
  programmaticTarget,
  onProgrammaticAnimationEnd,
  syncViewStateFromMap,
  programmaticTargetRefForSync,
}: UseProgrammaticMapFitParams) {
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!programmaticTarget) return;

    if (!mapRef.current) {
      const fallbackId = setTimeout(onProgrammaticAnimationEnd, 80);
      return () => clearTimeout(fallbackId);
    }

    const map = mapRef.current.getMap();
    if (!map) return;

    let cancelled = false;
    let syncFallbackId: ReturnType<typeof setTimeout> | null = null;
    isAnimatingRef.current = true;
    const target = programmaticTarget;
    const refForSyncCurrent = programmaticTargetRefForSync.current;

    const onMoveEnd = () => {
      map.off("moveend", onMoveEnd);
      if (syncFallbackId !== null) {
        clearTimeout(syncFallbackId);
        syncFallbackId = null;
      }
      if (cancelled) return;
      isAnimatingRef.current = false;
      onProgrammaticAnimationEnd();
    };

    map.once("moveend", onMoveEnd);

    syncFallbackId = setTimeout(() => {
      syncFallbackId = null;
      if (cancelled) return;
      map.off("moveend", onMoveEnd);
      isAnimatingRef.current = false;
      onProgrammaticAnimationEnd();
    }, PROGRAMMATIC_FIT_FALLBACK_MS);

    const runEase = () => {
      if (cancelled) return;
      map.stop();
      const center: [number, number] = [target.longitude, target.latitude];
      map.jumpTo({ center, zoom: map.getZoom() });
      map.easeTo({
        center,
        zoom: target.zoom,
        duration: PROGRAMMATIC_FIT_DURATION_MS,
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
      isAnimatingRef.current = false;
      if (syncFallbackId !== null) clearTimeout(syncFallbackId);
      cancelAnimationFrame(rafId);
      map.off("moveend", onMoveEnd);
      map.stop();
      if (refForSyncCurrent !== null) {
        syncViewStateFromMap(target);
      }
    };
  }, [
    programmaticTarget,
    onProgrammaticAnimationEnd,
    syncViewStateFromMap,
    mapRef,
    programmaticTargetRefForSync,
  ]);

  return isAnimatingRef;
}
