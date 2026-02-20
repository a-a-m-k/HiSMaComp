import { RESIZE_DEBOUNCE_MS } from "@/constants/breakpoints";
import { useResizeDebounced } from "./useResizeDebounced";

export type OverlayButtonsVisibleResult = {
  showOverlayButtons: boolean;
  isResizing: boolean;
};

/**
 * Returns whether overlay buttons (screenshot, zoom) should be visible,
 * and whether a resize is in progress (useful to disable layout transitions).
 * Hides buttons on resize start; shows again when resize has been idle for
 * RESIZE_DEBOUNCE_MS and the map has reported idle.
 */
export function useOverlayButtonsVisible(
  isMapIdle: boolean
): OverlayButtonsVisibleResult {
  const isResizing = useResizeDebounced(RESIZE_DEBOUNCE_MS);
  return {
    showOverlayButtons: isMapIdle && !isResizing,
    isResizing,
  };
}
