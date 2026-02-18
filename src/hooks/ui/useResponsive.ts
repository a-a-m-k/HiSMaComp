import { useTheme } from "@mui/material/styles";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getDeviceType,
  DEFAULT_SCREEN_DIMENSIONS,
  MIN_APP_VIEWPORT,
} from "@/constants/breakpoints";
import { isValidPositiveNumber } from "@/utils/zoom/zoomHelpers";

/** Debounce delay (ms) for resize so zoom recalculates after user stops resizing. */
const RESIZE_DEBOUNCE_MS = 320;

/**
 * Single source of truth for viewport: dimensions + device type from window size.
 * Use this everywhere you need screen dimensions or isMobile/isTablet/isDesktop
 * so we don't maintain two parallel notions (MUI media queries vs getDeviceType).
 *
 * Dimensions are clamped to MIN_APP_VIEWPORT (300px) so below 300px the app
 * and zoom both use the same effective size.
 *
 * When the viewport crosses a breakpoint (mobile ↔ tablet ↔ desktop), MapContainer
 * remounts the map with a brief spinner so zoom/camera stay correct.
 */
export const useViewport = () => {
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

  return useMemo(
    () => ({
      screenWidth,
      screenHeight,
      isMobile: deviceType === "mobile",
      isTablet: deviceType === "tablet",
      isDesktop: deviceType === "desktop" || deviceType === "largeDesktop",
      isXLarge: deviceType === "largeDesktop",
    }),
    [screenWidth, screenHeight, deviceType]
  );
};

/**
 * @deprecated Prefer useViewport() for a single source of viewport + device.
 * Returns only dimensions for callers that don't need device flags.
 */
export const useScreenDimensions = () => {
  const viewport = useViewport();
  return {
    screenWidth: viewport.screenWidth,
    screenHeight: viewport.screenHeight,
  };
};

/**
 * Hook for UI: viewport (single source) + theme.
 * Device flags come from useViewport (getDeviceType) so we don't duplicate with MUI media queries.
 */
export const useResponsive = () => {
  const theme = useTheme();
  const viewport = useViewport();
  return { ...viewport, theme };
};
