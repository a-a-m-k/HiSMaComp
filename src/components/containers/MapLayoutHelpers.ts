import React, { useRef } from "react";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM_LEVEL,
  CENTURY_MAP,
  YEARS,
} from "@/constants";
import type { TimelineMark } from "@/common/types";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

/** Format a year as "Xth ct." for timeline labels. */
export function formatCenturyLabel(year: number): string {
  const century = CENTURY_MAP[year as keyof typeof CENTURY_MAP];
  return century != null ? `${century}th ct.` : `${year}`;
}

/** Timeline marks for the map layout (year → century label). */
export const TIMELINE_MARKS: TimelineMark[] = YEARS.map(year => ({
  value: year,
  label: formatCenturyLabel(year),
}));

/**
 * Returns initial map position and zoom for MapView.
 * Use default when loading, no towns, or invalid center/zoom; otherwise use computed initial state.
 */
export function getInitialMapProps(
  showDefaultMap: boolean,
  isLoading: boolean,
  initialMapState: {
    center: { latitude: number; longitude: number } | undefined;
    fitZoom: number;
  }
): {
  initialPosition: { latitude: number; longitude: number };
  initialZoom: number;
} {
  const defaultProps = {
    initialPosition: DEFAULT_CENTER,
    initialZoom: DEFAULT_ZOOM,
  };

  if (showDefaultMap || isLoading || !initialMapState.center) {
    return defaultProps;
  }

  const { center, fitZoom } = initialMapState;
  const isValidCenter =
    center && isValidCoordinate(center.latitude, center.longitude);
  const isValidZoom =
    fitZoom != null &&
    isValidNumber(fitZoom) &&
    fitZoom >= 0 &&
    fitZoom <= MAX_ZOOM_LEVEL;

  if (!isValidCenter || !isValidZoom) {
    logger.error("Invalid map parameters:", { center, fitZoom });
    return defaultProps;
  }

  return {
    initialPosition: { latitude: center.latitude, longitude: center.longitude },
    initialZoom: fitZoom,
  };
}

/** Stable key for map remount when viewport crosses mobile/tablet/desktop breakpoint. */
export function getMapDeviceKey(viewport: {
  isMobile: boolean;
  isTablet: boolean;
}): string {
  if (viewport.isMobile) return "mobile";
  if (viewport.isTablet) return "tablet";
  return "desktop";
}

/** When viewport is below app min size, keep last key so the map does not remount. */
export function useStableMapKey(viewport: {
  isMobile: boolean;
  isTablet: boolean;
  isBelowMinViewport: boolean;
}): string {
  const deviceKey = getMapDeviceKey(viewport);
  const lastKeyAboveMinRef = useRef(deviceKey);
  if (!viewport.isBelowMinViewport) {
    lastKeyAboveMinRef.current = deviceKey;
  }
  return viewport.isBelowMinViewport ? lastKeyAboveMinRef.current : deviceKey;
}
