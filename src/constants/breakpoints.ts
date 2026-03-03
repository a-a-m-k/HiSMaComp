import { createTheme } from "@mui/material/styles";

const defaultTheme = createTheme();
const MUI_BREAKPOINTS = defaultTheme.breakpoints.values;

export const DEFAULT_SCREEN_DIMENSIONS = {
  width: 1024,
  height: 768,
} as const;

/** Below this we stop adjusting zoom on resize and use a fixed layout. */
export const MIN_APP_VIEWPORT = {
  width: 300,
  height: 300,
} as const;

export const APP_MIN_WIDTH = MIN_APP_VIEWPORT.width;
export const APP_MIN_HEIGHT = MIN_APP_VIEWPORT.height;
/** Debounce resize before we update viewport and re-show overlay buttons. */
export const RESIZE_DEBOUNCE_MS = 320;

/** Hysteresis: enter narrow below 280px, leave at 300px so we don’t flicker at the boundary. */
export const NARROW_LAYOUT_ENTER_PX = MIN_APP_VIEWPORT.width - 20;
export const NARROW_LAYOUT_LEAVE_PX = MIN_APP_VIEWPORT.width;

export type DeviceType = "mobile" | "tablet" | "desktop" | "largeDesktop";

export function getDeviceType(screenWidth: number): DeviceType {
  if (screenWidth < MUI_BREAKPOINTS.sm) return "mobile";
  if (screenWidth < MUI_BREAKPOINTS.md) return "tablet";
  if (screenWidth >= MUI_BREAKPOINTS.xl) return "largeDesktop";
  return "desktop";
}
