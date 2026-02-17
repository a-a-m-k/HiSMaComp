import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { RESIZE_BREAKPOINTS } from "@/constants/breakpoints";

/**
 * Threshold for detecting meaningful zoom level changes.
 * Prevents unnecessary viewState updates for minor zoom differences.
 */
const ZOOM_CHANGE_THRESHOLD = 0.1;
/** Skip zoom update only for minor jitter; crossing a breakpoint always updates */
const TRANSIENT_RESIZE_HEIGHT_THRESHOLD = 50;
const TRANSIENT_RESIZE_WIDTH_THRESHOLD = 40;
/** Min change to set a new programmatic target (avoids restarting for same target) */
const PROGRAMMATIC_TARGET_ZOOM_EPS = 0.05;
const PROGRAMMATIC_TARGET_LATLNG_EPS = 0.0002;

/**
 * Props for useMapViewState hook.
 */
interface UseMapViewStateProps {
  /** Initial longitude value */
  longitude: number;
  /** Initial latitude value */
  latitude: number;
  /** Initial zoom level */
  zoom: number;
  /** Current mobile device flag */
  isMobile: boolean;
  /** Current tablet device flag */
  isTablet: boolean;
  /** Current desktop device flag */
  isDesktop: boolean;
  /** Current screen width in pixels */
  screenWidth: number;
  /** Current screen height in pixels */
  screenHeight: number;
}

/** Target view for programmatic (e.g. resize) camera animation */
export interface ProgrammaticTarget {
  longitude: number;
  latitude: number;
  zoom: number;
}

/**
 * Return type for useMapViewState hook.
 */
interface UseMapViewStateReturn {
  /** Current map viewState (longitude, latitude, zoom) */
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  /** Handler for map move/pan events */
  handleMove: (evt: { viewState: UseMapViewStateReturn["viewState"] }) => void;
  /** When set, map should flyTo this target; clear via onProgrammaticAnimationEnd */
  programmaticTarget: ProgrammaticTarget | null;
  /** Call after flyTo(programmaticTarget) completes to sync viewState */
  onProgrammaticAnimationEnd: () => void;
  /** Call when animation is cancelled to sync viewState to map's current position (avoids jump). Does not clear programmaticTarget. */
  syncViewStateFromMap: (state: ProgrammaticTarget) => void;
  /** Ref mirroring programmaticTarget; when null in MapView cleanup, skip sync (e.g. cleared for minimal→less minimal). */
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
 * Custom hook for managing map viewState with responsive device change detection.
 *
 * Handles automatic viewState updates when device type or screen size changes,
 * while preserving user interactions (pan/zoom). Resets user interaction state
 * on significant device changes to allow automatic repositioning.
 *
 * @param props - Configuration props for the hook
 * @returns Object with viewState and handleMove handler
 *
 * @example
 * ```tsx
 * const { viewState, handleMove } = useMapViewState({
 *   longitude: 10.0,
 *   latitude: 50.0,
 *   zoom: 5,
 *   isMobile: false,
 *   isTablet: false,
 *   isDesktop: true,
 *   screenWidth: 1920,
 *   screenHeight: 1080,
 * });
 * ```
 */
export function useMapViewState({
  longitude,
  latitude,
  zoom,
  isMobile,
  isTablet,
  isDesktop,
  screenWidth,
  screenHeight,
}: UseMapViewStateProps): UseMapViewStateReturn {
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom,
  });

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [programmaticTarget, setProgrammaticTarget] =
    useState<ProgrammaticTarget | null>(null);
  /** Updated in effect; used for sameTarget check to avoid duplicate programmatic targets. */
  const programmaticTargetRef = useRef<ProgrammaticTarget | null>(null);
  /** Mirror of programmaticTarget (updated in render); MapView cleanup uses this to decide whether to sync. When null (e.g. cleared for minimal→less minimal), cleanup skips sync. */
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

  /** Stable fit target from props; same reference when longitude/latitude/zoom unchanged so we avoid re-running MapView's programmatic effect. */
  const fitTargetFromProps = useMemo(
    () => ({ longitude, latitude, zoom }),
    [longitude, latitude, zoom]
  );

  /** Compares current props to prevValuesRef (updated in effect) to detect device/size/zoom changes. */
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
      previousZoom: prevValuesRef.current.zoom,
      transientResizeOnly,
      zoomChangedSignificantly,
    };
  }, [isMobile, isTablet, isDesktop, screenWidth, screenHeight, zoom]);

  useEffect(() => {
    const {
      isDeviceChange,
      deviceTypeChanged,
      previousZoom,
      transientResizeOnly,
      zoomChangedSignificantly,
    } = deviceChangeInfo;

    if (isDeviceChange && hasUserInteracted && !transientResizeOnly) {
      setHasUserInteracted(false);
    }

    // Flow: 1) device change → set programmatic target or instant viewState; 2) no user interaction → follow props; 3) user interacted → follow props or preserve zoom.
    if (isDeviceChange) {
      if (
        !isMobile &&
        hasUserInteracted &&
        transientResizeOnly &&
        !zoomChangedSignificantly
      ) {
        // Preserve user-controlled camera during minor viewport jitter (desktop/tablet only).
      } else {
        const fromMinimalToLessMinimal =
          prevValuesRef.current.isMobile && !isMobile;
        if (fromMinimalToLessMinimal) {
          programmaticTargetRef.current = null;
          setProgrammaticTarget(null);
          setViewState(fitTargetFromProps);
        } else {
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
      const zoomDiff = Math.abs(zoom - previousZoom);
      if (zoomDiff > ZOOM_CHANGE_THRESHOLD) {
        setViewState(fitTargetFromProps);
      } else {
        setViewState(prev => ({
          ...fitTargetFromProps,
          zoom: prev.zoom,
        }));
      }
    }

    // Update previous values for next comparison
    prevValuesRef.current = {
      isMobile,
      isTablet,
      isDesktop,
      zoom,
      screenWidth,
      screenHeight,
    };
  }, [
    fitTargetFromProps,
    hasUserInteracted,
    deviceChangeInfo,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
  ]);

  // Handle map move/pan events from user interaction
  const handleMove = useCallback(
    (evt: { viewState: UseMapViewStateReturn["viewState"] }) => {
      setViewState(evt.viewState);
      setHasUserInteracted(true);
    },
    []
  );

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
