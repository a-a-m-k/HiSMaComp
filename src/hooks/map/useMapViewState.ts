import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

/** Viewport from useViewport(): dimensions + device flags (single source of truth). */
export interface MapViewport {
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Props for useMapViewState hook.
 * Viewport is a single object so callers use useViewport() and pass it through.
 */
interface UseMapViewStateProps {
  longitude: number;
  latitude: number;
  zoom: number;
  viewport: MapViewport;
}

/** Map camera: longitude, latitude, zoom. */
export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

/**
 * Target camera position (center + zoom) for "fit to view" animation.
 * When the layout resizes, we animate the map to this target so the view stays correct.
 * Same shape as MapViewState.
 */
export type CameraFitTarget = MapViewState;

interface UseMapViewStateReturn {
  viewState: MapViewState;
  handleMove: (evt: { viewState: MapViewState }) => void;
  /** When set, the map should animate to this camera position (e.g. after resize). */
  cameraFitTarget: CameraFitTarget | null;
  /** Called when the map has finished animating to cameraFitTarget. */
  onCameraFitComplete: () => void;
  /** Syncs React state with the map's current view. Used after fit animation. */
  syncViewStateFromMap: (state: CameraFitTarget) => void;
  /** Ref mirror of cameraFitTarget for use in animation cleanup. */
  cameraFitTargetRefForSync: React.RefObject<CameraFitTarget | null>;
}

/**
 * Manages map viewState and keeps it in sync with the initial fit from props.
 *
 * Breakpoint crosses (mobile ↔ tablet ↔ desktop) are handled by MapLayout
 * (remount with spinner), so this hook only sees same-device resizes or initial mount.
 * When fitTargetFromProps or viewport change, we sync viewState to the fit so zoom
 * and camera stay correct without relying on the map library's resize behavior.
 */
export function useMapViewState({
  longitude,
  latitude,
  zoom,
  viewport,
}: UseMapViewStateProps): UseMapViewStateReturn {
  const { screenWidth, screenHeight, isMobile, isTablet, isDesktop } = viewport;

  const fitTargetFromProps = useMemo(
    () => ({ longitude, latitude, zoom }),
    [longitude, latitude, zoom]
  );

  const [viewState, setViewState] = useState(fitTargetFromProps);
  const [cameraFitTarget, setCameraFitTarget] =
    useState<CameraFitTarget | null>(null);
  const cameraFitTargetRef = useRef<CameraFitTarget | null>(null);
  const cameraFitTargetRefForSync = useRef<CameraFitTarget | null>(null);
  cameraFitTargetRefForSync.current = cameraFitTarget;
  /** When fit animation ends, apply this target to viewState (avoids setState inside setState). */
  const pendingCameraFitTargetRef = useRef<CameraFitTarget | null>(null);

  /** Sync view to fit when initial fit or viewport changes (same-device resize or props update). */
  useEffect(() => {
    setViewState(fitTargetFromProps);
  }, [
    fitTargetFromProps,
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop,
  ]);

  /** Apply pending camera fit target to viewState when animation ends. */
  useEffect(() => {
    if (
      cameraFitTarget === null &&
      pendingCameraFitTargetRef.current !== null
    ) {
      const target = pendingCameraFitTargetRef.current;
      pendingCameraFitTargetRef.current = null;
      setViewState(target);
    }
  }, [cameraFitTarget]);

  const handleMove = useCallback((evt: { viewState: MapViewState }) => {
    setViewState(evt.viewState);
  }, []);

  const onCameraFitComplete = useCallback(() => {
    cameraFitTargetRef.current = null;
    setCameraFitTarget(prev => {
      if (prev) pendingCameraFitTargetRef.current = prev;
      return null;
    });
  }, []);

  const syncViewStateFromMap = useCallback((state: CameraFitTarget) => {
    setViewState(state);
  }, []);

  return {
    viewState,
    handleMove,
    cameraFitTarget,
    onCameraFitComplete,
    syncViewStateFromMap,
    cameraFitTargetRefForSync,
  };
}
