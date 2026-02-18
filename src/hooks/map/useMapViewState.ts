import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { RESIZE_BREAKPOINTS } from "@/constants/breakpoints";
import {
  ZOOM_CHANGE_THRESHOLD,
  TRANSIENT_RESIZE_HEIGHT_THRESHOLD,
  TRANSIENT_RESIZE_WIDTH_THRESHOLD,
  PROGRAMMATIC_TARGET_ZOOM_EPS,
  PROGRAMMATIC_TARGET_LATLNG_EPS,
} from "@/constants/map";

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

/** Target view for programmatic (e.g. resize) camera animation. Same shape as MapViewState. */
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
 * Previous values structure for change detection.
 */
interface PreviousValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  zoom: number;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Manages map viewState with responsive device/size handling.
 * - On device or screen change: either fit to target or preserve user view (see named booleans below).
 * - Single viewport object keeps API small and aligned with useViewport().
 */
export function useMapViewState({
  longitude,
  latitude,
  zoom,
  viewport,
}: UseMapViewStateProps): UseMapViewStateReturn {
  const { isMobile, isTablet, isDesktop, screenWidth, screenHeight } = viewport;

  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom,
  });

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [programmaticTarget, setProgrammaticTarget] =
    useState<ProgrammaticTarget | null>(null);
  const programmaticTargetRef = useRef<ProgrammaticTarget | null>(null);
  const programmaticTargetRefForSync = useRef<ProgrammaticTarget | null>(null);
  programmaticTargetRefForSync.current = programmaticTarget;

  const prevValuesRef = useRef<PreviousValues>({
    isMobile,
    isTablet,
    isDesktop,
    zoom,
    screenWidth,
    screenHeight,
  });

  const fitTargetFromProps = useMemo(
    () => ({ longitude, latitude, zoom }),
    [longitude, latitude, zoom]
  );

  // Named booleans for "when to fit vs preserve" so the effect is readable.
  const deviceChangeInfo = useMemo(() => {
    const widthDelta = Math.abs(
      prevValuesRef.current.screenWidth - screenWidth
    );
    const heightDelta = Math.abs(
      prevValuesRef.current.screenHeight - screenHeight
    );

    const deviceTypeChanged =
      prevValuesRef.current.isMobile !== isMobile ||
      prevValuesRef.current.isTablet !== isTablet ||
      prevValuesRef.current.isDesktop !== isDesktop;

    const screenSizeChanged = widthDelta > 0 || heightDelta > 0;
    const crossesBreakpoint = RESIZE_BREAKPOINTS.some(
      bp =>
        (prevValuesRef.current.screenWidth < bp && screenWidth >= bp) ||
        (prevValuesRef.current.screenWidth >= bp && screenWidth < bp)
    );
    // Small resize without crossing breakpoint: avoid refit to prevent flinch.
    const transientResizeOnly =
      !deviceTypeChanged &&
      screenSizeChanged &&
      !crossesBreakpoint &&
      widthDelta <= TRANSIENT_RESIZE_WIDTH_THRESHOLD &&
      heightDelta <= TRANSIENT_RESIZE_HEIGHT_THRESHOLD;

    const zoomDifference = Math.abs(zoom - prevValuesRef.current.zoom);
    const zoomChangedSignificantly = zoomDifference > ZOOM_CHANGE_THRESHOLD;

    const isDeviceChange = deviceTypeChanged || screenSizeChanged;

    return {
      isDeviceChange,
      deviceTypeChanged,
      transientResizeOnly,
      zoomChangedSignificantly,
    };
  }, [isMobile, isTablet, isDesktop, screenWidth, screenHeight, zoom]);

  useEffect(() => {
    const {
      isDeviceChange,
      deviceTypeChanged,
      transientResizeOnly,
      zoomChangedSignificantly,
    } = deviceChangeInfo;

    // Reset "user has panned/zoomed" when device actually changed (e.g. mobile → desktop).
    if (isDeviceChange && hasUserInteracted && !transientResizeOnly) {
      setHasUserInteracted(false);
    }

    if (isDeviceChange) {
      // Keep current view on small resizes if user had interacted and zoom didn't change much.
      const preserveUserView =
        !isMobile &&
        hasUserInteracted &&
        transientResizeOnly &&
        !zoomChangedSignificantly;
      if (!preserveUserView) {
        // Mobile → larger: jump to fit target (no animation).
        const fromMinimalToLessMinimal =
          prevValuesRef.current.isMobile && !isMobile;
        if (fromMinimalToLessMinimal) {
          programmaticTargetRef.current = null;
          setProgrammaticTarget(null);
          setViewState(fitTargetFromProps);
        } else {
          // Set programmatic target so useProgrammaticMapFit runs easeTo (or skip if same target).
          const next = fitTargetFromProps;
          const prev = programmaticTargetRef.current;
          const isShrinking =
            screenWidth < prevValuesRef.current.screenWidth ||
            screenHeight < prevValuesRef.current.screenHeight;
          const sameTarget =
            !isShrinking &&
            !deviceTypeChanged &&
            !isMobile &&
            prev &&
            Math.abs(prev.zoom - next.zoom) < PROGRAMMATIC_TARGET_ZOOM_EPS &&
            Math.abs(prev.longitude - next.longitude) <
              PROGRAMMATIC_TARGET_LATLNG_EPS &&
            Math.abs(prev.latitude - next.latitude) <
              PROGRAMMATIC_TARGET_LATLNG_EPS;
          if (!sameTarget) {
            programmaticTargetRef.current = next;
            setProgrammaticTarget(prevTarget =>
              prevTarget &&
              prevTarget.zoom === next.zoom &&
              prevTarget.longitude === next.longitude &&
              prevTarget.latitude === next.latitude
                ? prevTarget
                : next
            );
          }
        }
      }
    } else if (!hasUserInteracted) {
      setViewState(fitTargetFromProps);
    } else {
      if (zoomChangedSignificantly) {
        setViewState(fitTargetFromProps);
      } else {
        setViewState(prev => ({
          ...fitTargetFromProps,
          zoom: prev.zoom,
        }));
      }
    }

    prevValuesRef.current = {
      isMobile,
      isTablet,
      isDesktop,
      zoom,
      screenWidth,
      screenHeight,
    };
    // deviceChangeInfo and fitTargetFromProps already depend on viewport/zoom; listing primitives would duplicate effect runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitTargetFromProps, hasUserInteracted, deviceChangeInfo]);

  const handleMove = useCallback((evt: { viewState: MapViewState }) => {
    setViewState(evt.viewState);
    setHasUserInteracted(true);
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
