import { useMemo } from "react";
import { Town } from "@/common/types";
import { DEFAULT_SCREEN_DIMENSIONS } from "@/constants/breakpoints";
import { useScreenDimensions, useResponsive } from "@/hooks/ui/useResponsive";
import { calculateResponsiveZoom } from "@/utils/utils";
import { isValidPositiveNumber } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

/**
 * Hook that calculates responsive zoom level to fit all towns in the viewport.
 *
 * Uses current screen dimensions and MUI theme to calculate optimal zoom level
 * that ensures all provided towns are visible. The calculation accounts for
 * UI elements (legend, timeline) and device-specific padding.
 *
 * @param towns - Array of town objects to fit in the viewport
 * @returns Zoom level (typically 1-20) that fits all towns, or 4 as fallback
 *
 * @example
 * ```tsx
 * const zoom = useResponsiveZoom(filteredTowns);
 * // Returns zoom level that fits all filteredTowns in the current viewport
 * ```
 */
export const useResponsiveZoom = (towns: Town[]) => {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const { theme } = useResponsive();

  const fitZoom = useMemo(() => {
    if (!towns || towns.length === 0) return 4;

    const validScreenWidth = isValidPositiveNumber(screenWidth)
      ? screenWidth
      : DEFAULT_SCREEN_DIMENSIONS.width;
    const validScreenHeight = isValidPositiveNumber(screenHeight)
      ? screenHeight
      : DEFAULT_SCREEN_DIMENSIONS.height;

    try {
      const zoom = calculateResponsiveZoom(
        towns,
        validScreenWidth,
        validScreenHeight,
        theme
      );
      // Round to 2 decimals to avoid jitter from tiny dimension changes
      return Math.round(zoom * 100) / 100;
    } catch (error) {
      logger.error("Error calculating zoom level:", error);
      return 4;
    }
  }, [towns, screenWidth, screenHeight, theme]);

  return fitZoom;
};
