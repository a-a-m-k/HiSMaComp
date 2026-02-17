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
 * Minimum viewport size for responsive zoom. Below this, zoom no longer adjusts on resize.
 * Matches APP_MIN_WIDTH / APP_MIN_HEIGHT so layout and zoom stop at the same size.
 */
export const MIN_APP_VIEWPORT = {
  width: 300,
  height: 300,
} as const;

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
