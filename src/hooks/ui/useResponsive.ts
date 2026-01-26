import { useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import {
  getDeviceType,
  DEFAULT_SCREEN_DIMENSIONS,
} from "@/constants/breakpoints";
import { isValidPositiveNumber } from "@/utils/zoom/zoomHelpers";

/**
 * Hook for UI responsive breakpoint detection.
 *
 * Uses MUI breakpoints for UI styling decisions.
 * For map calculations, use getDeviceType() from @/constants/breakpoints.
 *
 * MUI breakpoints: sm=600, md=900, lg=1200, xl=1536
 * getDeviceType() uses the same MUI breakpoint values for consistency.
 *
 * @returns Object containing device type flags and theme
 */
export const useResponsive = () => {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down("sm")),
    isTablet: useMediaQuery(theme.breakpoints.between("sm", "md")),
    isDesktop: useMediaQuery(theme.breakpoints.up("md")),
    isXLarge: useMediaQuery(theme.breakpoints.up("xl")),
    theme,
  };
};

/**
 * Hook for tracking viewport dimensions for map calculations.
 *
 * Monitors window size changes and provides current screen dimensions.
 * Returns device type flags based on MUI breakpoint values.
 *
 * For UI styling, use useResponsive() hook instead.
 *
 * @returns Object containing current screen width, height, and device type flags
 */
export const useScreenDimensions = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (isValidPositiveNumber(width) && isValidPositiveNumber(height)) {
        return { width, height };
      }
    }

    return {
      width: DEFAULT_SCREEN_DIMENSIONS.width,
      height: DEFAULT_SCREEN_DIMENSIONS.height,
    };
  });

  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (isValidPositiveNumber(width) && isValidPositiveNumber(height)) {
      setScreenSize(prev => {
        if (prev.width !== width || prev.height !== height) {
          return { width, height };
        }
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [updateDimensions]);

  const safeWidth = isValidPositiveNumber(screenSize.width)
    ? screenSize.width
    : DEFAULT_SCREEN_DIMENSIONS.width;
  const safeHeight = isValidPositiveNumber(screenSize.height)
    ? screenSize.height
    : DEFAULT_SCREEN_DIMENSIONS.height;

  const deviceType = getDeviceType(safeWidth);

  return {
    screenWidth: safeWidth,
    screenHeight: safeHeight,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop" || deviceType === "largeDesktop",
  };
};
