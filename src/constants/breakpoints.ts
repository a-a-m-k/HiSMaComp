import { createTheme } from "@mui/material/styles";

const defaultTheme = createTheme();
const MUI_BREAKPOINTS = defaultTheme.breakpoints.values;

/** Width breakpoints (px); crossing one triggers full map refit. Matches MUI sm/md/lg/xl. */
export const RESIZE_BREAKPOINTS = [
  MUI_BREAKPOINTS.sm,
  MUI_BREAKPOINTS.md,
  MUI_BREAKPOINTS.lg,
  MUI_BREAKPOINTS.xl,
] as const;

export const DEFAULT_SCREEN_DIMENSIONS = {
  width: 1024,
  height: 768,
} as const;

/**
 * Minimum viewport size for responsive zoom and layout. Below this, zoom no longer adjusts on resize
 * and the app uses a fixed-width layout. Single source for the 300px value.
 */
export const MIN_APP_VIEWPORT = {
  width: 300,
  height: 300,
} as const;

/** Below this width/height the app is fixed and no longer responsive (derived from MIN_APP_VIEWPORT). */
export const APP_MIN_WIDTH = MIN_APP_VIEWPORT.width;
export const APP_MIN_HEIGHT = MIN_APP_VIEWPORT.height;

/** Delay (ms) after last resize event before considering resize "ended" (viewport updates, overlay buttons re-show). */
export const RESIZE_DEBOUNCE_MS = 320;

/**
 * Hysteresis for narrow layout (legend/timeline in flow).
 * - Enter narrow when we go well below the app min width (300px) so the layout is already narrow by 300px.
 * - Leave narrow as soon as we reach the app min width so legend goes back to its overlay position quickly.
 */
export const NARROW_LAYOUT_ENTER_PX = MIN_APP_VIEWPORT.width - 20; // 280px
export const NARROW_LAYOUT_LEAVE_PX = MIN_APP_VIEWPORT.width; // 300px

export type DeviceType = "mobile" | "tablet" | "desktop" | "largeDesktop";

/**
 * Determines device type based on screen width using MUI default breakpoint values
 * Uses MUI's default breakpoints: sm=600, md=900, xl=1536
 * @param screenWidth - Screen width in pixels
 * @returns Device type string
 */
export function getDeviceType(screenWidth: number): DeviceType {
  if (screenWidth < MUI_BREAKPOINTS.sm) return "mobile";
  if (screenWidth < MUI_BREAKPOINTS.md) return "tablet";
  if (screenWidth >= MUI_BREAKPOINTS.xl) return "largeDesktop";
  return "desktop";
}
