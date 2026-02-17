import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect, useCallback } from "react";
import {
  getDeviceType,
  DEFAULT_SCREEN_DIMENSIONS,
  MIN_APP_VIEWPORT,
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

/** Debounce delay (ms) for resize so zoom recalculates after user stops resizing. */
const RESIZE_DEBOUNCE_MS = 320;

/**
 * Hook for tracking viewport dimensions for map calculations.
 *
 * Monitors window size changes and provides current screen dimensions.
 * Resize is debounced to avoid flinching while the window is being resized;
 * zoom/center recalculate after the user pauses.
 *
 * For UI styling, use useResponsive() hook instead.
 *
 * Dimensions are clamped to MIN_APP_VIEWPORT (300px) so below 300px the app
 * and zoom both use the same effective size (layout doesn't shrink, zoom doesn't change).
 *
 * @returns Object containing current screen width, height, and device type flags
 */
export const useScreenDimensions = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (isValidPositiveNumber(width) && isValidPositiveNumber(height)) {
        return {
          width: Math.max(width, MIN_APP_VIEWPORT.width),
          height: Math.max(height, MIN_APP_VIEWPORT.height),
        };
      }
    }

    return {
      width: Math.max(DEFAULT_SCREEN_DIMENSIONS.width, MIN_APP_VIEWPORT.width),
      height: Math.max(
        DEFAULT_SCREEN_DIMENSIONS.height,
        MIN_APP_VIEWPORT.height
      ),
    };
  });

  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;

    const rawWidth = window.innerWidth;
    const rawHeight = window.innerHeight;

    if (!isValidPositiveNumber(rawWidth) || !isValidPositiveNumber(rawHeight))
      return;

    const width = Math.max(rawWidth, MIN_APP_VIEWPORT.width);
    const height = Math.max(rawHeight, MIN_APP_VIEWPORT.height);

    setScreenSize(prev => {
      if (prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updateDimensions();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        updateDimensions();
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [updateDimensions]);

  const screenWidth = isValidPositiveNumber(screenSize.width)
    ? screenSize.width
    : Math.max(DEFAULT_SCREEN_DIMENSIONS.width, MIN_APP_VIEWPORT.width);
  const screenHeight = isValidPositiveNumber(screenSize.height)
    ? screenSize.height
    : Math.max(DEFAULT_SCREEN_DIMENSIONS.height, MIN_APP_VIEWPORT.height);

  const deviceType = getDeviceType(screenWidth);

  return {
    screenWidth,
    screenHeight,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop" || deviceType === "largeDesktop",
  };
};
