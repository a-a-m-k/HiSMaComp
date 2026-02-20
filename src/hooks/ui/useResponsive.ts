import { useTheme } from "@mui/material/styles";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getDeviceType,
  DEFAULT_SCREEN_DIMENSIONS,
  MIN_APP_VIEWPORT,
  RESIZE_DEBOUNCE_MS,
} from "@/constants";
import { isValidPositiveNumber } from "@/utils/zoom/zoomHelpers";

type ViewportState = {
  width: number;
  height: number;
  isBelowMinViewport: boolean;
  rawWidth: number;
  rawHeight: number;
};

/**
 * Single source of truth for viewport: dimensions + device type from window size.
 * Use this everywhere you need screen dimensions or isMobile/isTablet/isDesktop
 * so we don't maintain two parallel notions (MUI media queries vs getDeviceType).
 *
 * - **Raw dimensions** (rawScreenWidth, rawScreenHeight) and **isBelowMinViewport**
 *   update on every resize so layout (e.g. narrow layout, min width) can react immediately.
 * - **Clamped dimensions** (screenWidth, screenHeight) and **deviceType** update after
 *   a short debounce so zoom/map recalculate only when resize settles.
 *
 * Dimensions are clamped to MIN_APP_VIEWPORT (300px) so below 300px the app
 * and zoom both use the same effective size.
 *
 * When the viewport crosses a breakpoint (mobile ↔ tablet ↔ desktop), MapLayout
 * remounts the map with a brief spinner so zoom/camera stay correct.
 */
export const useViewport = () => {
  const [screenSize, setScreenSize] = useState<ViewportState>(() => {
    if (typeof window !== "undefined") {
      const rawWidth = window.innerWidth;
      const rawHeight = window.innerHeight;

      if (isValidPositiveNumber(rawWidth) && isValidPositiveNumber(rawHeight)) {
        const width = Math.max(rawWidth, MIN_APP_VIEWPORT.width);
        const height = Math.max(rawHeight, MIN_APP_VIEWPORT.height);
        const isBelowMinViewport =
          rawWidth < MIN_APP_VIEWPORT.width ||
          rawHeight < MIN_APP_VIEWPORT.height;
        return { width, height, isBelowMinViewport, rawWidth, rawHeight };
      }
    }

    return {
      width: Math.max(DEFAULT_SCREEN_DIMENSIONS.width, MIN_APP_VIEWPORT.width),
      height: Math.max(
        DEFAULT_SCREEN_DIMENSIONS.height,
        MIN_APP_VIEWPORT.height
      ),
      isBelowMinViewport: false,
      rawWidth: DEFAULT_SCREEN_DIMENSIONS.width,
      rawHeight: DEFAULT_SCREEN_DIMENSIONS.height,
    };
  });

  const updateDimensions = useCallback((options?: { immediate?: boolean }) => {
    if (typeof window === "undefined") return;

    const rawWidth = window.innerWidth;
    const rawHeight = window.innerHeight;

    if (!isValidPositiveNumber(rawWidth) || !isValidPositiveNumber(rawHeight))
      return;

    const width = Math.max(rawWidth, MIN_APP_VIEWPORT.width);
    const height = Math.max(rawHeight, MIN_APP_VIEWPORT.height);
    const isBelowMinViewport =
      rawWidth < MIN_APP_VIEWPORT.width || rawHeight < MIN_APP_VIEWPORT.height;

    setScreenSize(prev => {
      const same =
        prev.width === width &&
        prev.height === height &&
        prev.isBelowMinViewport === isBelowMinViewport &&
        prev.rawWidth === rawWidth &&
        prev.rawHeight === rawHeight;
      if (same) return prev;
      if (options?.immediate) {
        return { ...prev, rawWidth, rawHeight, isBelowMinViewport };
      }
      return { width, height, isBelowMinViewport, rawWidth, rawHeight };
    });
  }, []);

  const rafIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updateDimensions();

    const handleResize = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          updateDimensions({ immediate: true });
        });
      }
      if (timeoutIdRef.current !== null) clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        timeoutIdRef.current = null;
        updateDimensions();
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (timeoutIdRef.current !== null) clearTimeout(timeoutIdRef.current);
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
  const rawScreenWidth = isValidPositiveNumber(screenSize.rawWidth)
    ? screenSize.rawWidth
    : screenWidth;
  const rawScreenHeight = isValidPositiveNumber(screenSize.rawHeight)
    ? screenSize.rawHeight
    : screenHeight;

  const deviceType = getDeviceType(screenWidth);
  const layoutDeviceType = getDeviceType(rawScreenWidth);
  const isBelowMinViewport = Boolean(screenSize.isBelowMinViewport);

  return useMemo(
    () => ({
      screenWidth,
      screenHeight,
      rawScreenWidth,
      rawScreenHeight,
      isMobile: deviceType === "mobile",
      isTablet: deviceType === "tablet",
      isDesktop: deviceType === "desktop" || deviceType === "largeDesktop",
      isXLarge: deviceType === "largeDesktop",
      isMobileLayout: layoutDeviceType === "mobile",
      isTabletLayout: layoutDeviceType === "tablet",
      isDesktopLayout:
        layoutDeviceType === "desktop" || layoutDeviceType === "largeDesktop",
      isXLargeLayout: layoutDeviceType === "largeDesktop",
      isBelowMinViewport,
    }),
    [
      screenWidth,
      screenHeight,
      rawScreenWidth,
      rawScreenHeight,
      deviceType,
      layoutDeviceType,
      isBelowMinViewport,
    ]
  );
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
