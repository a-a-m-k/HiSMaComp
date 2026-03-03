/** MapLayout helpers: initial map props, timeline labels, stable map key for remount. */
import { useRef } from "react";
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

export function formatCenturyLabel(year: number): string {
  const century = CENTURY_MAP[year as keyof typeof CENTURY_MAP];
  return century != null ? `${century}th ct.` : `${year}`;
}

export const TIMELINE_MARKS: TimelineMark[] = YEARS.map(year => ({
  value: year,
  label: formatCenturyLabel(year),
}));

/** Default when no data or invalid; otherwise use computed initial state. Caller passes useDefaultView (e.g. showDefaultMap || (isLoading && no towns)). */
export function getInitialMapProps(
  useDefaultView: boolean,
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

  if (useDefaultView || !initialMapState.center) {
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

export function getMapDeviceKey(viewport: {
  isMobile: boolean;
  isTablet: boolean;
}): string {
  if (viewport.isMobile) return "mobile";
  if (viewport.isTablet) return "tablet";
  return "desktop";
}

/** Keeps last key when below min viewport so we don’t remount the map on resize. */
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
