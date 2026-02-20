import { useMemo } from "react";
import { Town } from "@/common/types";
import {
  DEFAULT_SCREEN_DIMENSIONS,
  MIN_APP_VIEWPORT,
} from "@/constants/breakpoints";
import { DEFAULT_ZOOM, INITIAL_ZOOM_OUT_OFFSET } from "@/constants/map";
import { useViewport } from "@/hooks/ui";
import { useTheme } from "@mui/material/styles";
import {
  calculateBoundsCenter,
  calculateResponsiveZoom,
  calculateMapArea,
  getGeographicalBoxFromViewport,
} from "@/utils/utils";
import type { Bounds } from "@/utils/geo";
import type { MapArea } from "@/utils/mapZoom";
import { isValidPositiveNumber } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

/**
 * Computes initial map center, fit zoom, and viewport bounds (for maxBounds).
 * Bounds = geographical box visible at (center, fitZoom) — getGeographicalBoxFromViewport(center, fitZoom, mapArea).
 * Caller should pass mapArea from a single source (e.g. MapContainer) so the same dimensions are used for bounds and for MapView’s effective min zoom fallback.
 */
export function useInitialMapState(
  towns: Town[],
  mapArea: MapArea | undefined
): {
  center: { latitude: number; longitude: number } | undefined;
  fitZoom: number;
  bounds: Bounds | undefined;
} {
  const { screenWidth, screenHeight } = useViewport();
  const theme = useTheme();

  return useMemo(() => {
    if (!towns || towns.length === 0) {
      return { center: undefined, fitZoom: DEFAULT_ZOOM, bounds: undefined };
    }

    try {
      const center = calculateBoundsCenter(towns);
      const rawWidth = isValidPositiveNumber(screenWidth)
        ? screenWidth
        : DEFAULT_SCREEN_DIMENSIONS.width;
      const rawHeight = isValidPositiveNumber(screenHeight)
        ? screenHeight
        : DEFAULT_SCREEN_DIMENSIONS.height;
      const validScreenWidth = Math.max(rawWidth, MIN_APP_VIEWPORT.width);
      const validScreenHeight = Math.max(rawHeight, MIN_APP_VIEWPORT.height);
      const zoom = calculateResponsiveZoom(
        towns,
        validScreenWidth,
        validScreenHeight,
        theme
      );
      const fitZoom = Math.max(
        1,
        Math.round(zoom * 100) / 100 - INITIAL_ZOOM_OUT_OFFSET
      );

      const area =
        mapArea ?? calculateMapArea(validScreenWidth, validScreenHeight, theme);
      const bounds = getGeographicalBoxFromViewport(
        { longitude: center.longitude, latitude: center.latitude },
        fitZoom,
        area.effectiveWidth,
        area.effectiveHeight
      );

      return { center, fitZoom, bounds };
    } catch (error) {
      logger.error("Error computing initial map state:", error);
      return { center: undefined, fitZoom: DEFAULT_ZOOM, bounds: undefined };
    }
  }, [towns, mapArea, screenWidth, screenHeight, theme]);
}
