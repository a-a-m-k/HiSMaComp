import { createTheme } from "@mui/material/styles";

const defaultTheme = createTheme();
const MUI_BREAKPOINTS = defaultTheme.breakpoints.values;

export const DEFAULT_SCREEN_DIMENSIONS = {
  width: 1024,
  height: 768,
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
