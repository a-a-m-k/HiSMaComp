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

/** Target view for programmatic camera animation (e.g. future "fit bounds" action). Same shape as MapViewState. */
export type ProgrammaticTarget = MapViewState;

interface UseMapViewStateReturn {
  viewState: MapViewState;
  handleMove: (evt: { viewState: MapViewState }) => void;
  programmaticTarget: ProgrammaticTarget | null;
  onProgrammaticAnimationEnd: () => void;
  syncViewStateFromMap: (state: ProgrammaticTarget) => void;
  programmaticTargetRefForSync: React.RefObject<ProgrammaticTarget | null>;
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
  const [programmaticTarget, setProgrammaticTarget] =
    useState<ProgrammaticTarget | null>(null);
  const programmaticTargetRef = useRef<ProgrammaticTarget | null>(null);
  const programmaticTargetRefForSync = useRef<ProgrammaticTarget | null>(null);
  programmaticTargetRefForSync.current = programmaticTarget;

  // Sync view to fit whenever initial fit or viewport changes (same-device resize or props update).
  useEffect(() => {
    setViewState(fitTargetFromProps);
  }, [
    longitude,
    latitude,
    zoom,
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop,
  ]);

  const handleMove = useCallback((evt: { viewState: MapViewState }) => {
    setViewState(evt.viewState);
  }, []);

  const onProgrammaticAnimationEnd = useCallback(() => {
    programmaticTargetRef.current = null;
    setProgrammaticTarget(prev => {
      if (prev) setViewState(prev);
      return null;
    });
  }, []);

  const syncViewStateFromMap = useCallback((state: ProgrammaticTarget) => {
    setViewState(state);
  }, []);

  return {
    viewState,
    handleMove,
    programmaticTarget,
    onProgrammaticAnimationEnd,
    syncViewStateFromMap,
    programmaticTargetRefForSync,
  };
}
