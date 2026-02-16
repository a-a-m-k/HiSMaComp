import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/**
 * Threshold for detecting meaningful zoom level changes.
 * Prevents unnecessary viewState updates for minor zoom differences.
 */
const ZOOM_CHANGE_THRESHOLD = 0.1;
const TRANSIENT_RESIZE_HEIGHT_THRESHOLD = 80;
const TRANSIENT_RESIZE_WIDTH_THRESHOLD = 80;

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

  const prevValuesRef = useRef<PreviousValues>({
    isMobile,
    isTablet,
    isDesktop,
    zoom,
    screenWidth,
    screenHeight,
  });

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
    const transientResizeOnly =
      !deviceTypeChanged &&
      screenSizeChanged &&
      widthDelta <= TRANSIENT_RESIZE_WIDTH_THRESHOLD &&
      heightDelta <= TRANSIENT_RESIZE_HEIGHT_THRESHOLD;

    const zoomDifference = Math.abs(zoom - prevValuesRef.current.zoom);
    const zoomChangedSignificantly = zoomDifference > ZOOM_CHANGE_THRESHOLD;

    const isDeviceChange =
      deviceTypeChanged || screenSizeChanged || zoomChangedSignificantly;

    return {
      isDeviceChange,
      previousZoom: prevValuesRef.current.zoom,
      transientResizeOnly,
      zoomChangedSignificantly,
    };
  }, [isMobile, isTablet, isDesktop, screenWidth, screenHeight, zoom]);

  useEffect(() => {
    const {
      isDeviceChange,
      previousZoom,
      transientResizeOnly,
      zoomChangedSignificantly,
    } = deviceChangeInfo;

    if (isDeviceChange && hasUserInteracted && !transientResizeOnly) {
      setHasUserInteracted(false);
    }

    // Determine if viewState should be updated
    if (isDeviceChange) {
      if (
        hasUserInteracted &&
        transientResizeOnly &&
        !zoomChangedSignificantly
      ) {
        // Preserve user-controlled camera during minor viewport jitter.
      } else {
        // Device changed: always update to new position/zoom
        setViewState({
          longitude,
          latitude,
          zoom,
        });
      }
    } else if (!hasUserInteracted) {
      // No user interaction yet: follow prop changes
      setViewState({
        longitude,
        latitude,
        zoom,
      });
    } else {
      // User has interacted: only update on significant zoom changes
      const zoomDiff = Math.abs(zoom - previousZoom);
      if (zoomDiff > ZOOM_CHANGE_THRESHOLD) {
        setViewState({
          longitude,
          latitude,
          zoom,
        });
      } else {
        // Preserve user's zoom level, update position
        setViewState(prev => ({
          longitude,
          latitude,
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
    longitude,
    latitude,
    zoom,
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

  return {
    viewState,
    handleMove,
  };
}
