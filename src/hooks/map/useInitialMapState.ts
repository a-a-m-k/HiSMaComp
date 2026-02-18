import { useMemo } from "react";
import { Town } from "@/common/types";
import {
  DEFAULT_SCREEN_DIMENSIONS,
  MIN_APP_VIEWPORT,
} from "@/constants/breakpoints";
import { DEFAULT_ZOOM } from "@/constants/map";
import { useViewport } from "@/hooks/ui";
import { useTheme } from "@mui/material/styles";
import { calculateBoundsCenter, calculateResponsiveZoom } from "@/utils/utils";
import { isValidPositiveNumber } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

/**
 * Computes initial map center and fit zoom from towns and current viewport.
 * Used in MapContainer so center/fitZoom are props to MapView, not in AppContext
 * (avoids context re-renders on resize and keeps "map camera" out of global state).
 */
export function useInitialMapState(towns: Town[]): {
  center: { latitude: number; longitude: number } | undefined;
  fitZoom: number;
} {
  const { screenWidth, screenHeight } = useViewport();
  const theme = useTheme();

  return useMemo(() => {
    if (!towns || towns.length === 0) {
      return { center: undefined, fitZoom: DEFAULT_ZOOM };
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
      const fitZoom = Math.round(zoom * 100) / 100;
      return { center, fitZoom };
    } catch (error) {
      logger.error("Error computing initial map state:", error);
      return { center: undefined, fitZoom: DEFAULT_ZOOM };
    }
  }, [towns, screenWidth, screenHeight, theme]);
}
