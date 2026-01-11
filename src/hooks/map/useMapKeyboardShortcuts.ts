import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { logger } from "@/utils/logger";
import { isInputField } from "@/utils/keyboard";

/**
 * Custom hook for handling keyboard shortcuts for map zoom.
 * Supports Cmd/Ctrl + (zoom in) and Cmd/Ctrl - (zoom out).
 * Prevents default browser behavior and triggers smooth zoom animations.
 * Only enabled on desktop devices for performance optimization.
 *
 * @param mapRef - Reference to the Map component
 * @param enabled - Whether keyboard shortcuts are enabled (typically desktop only)
 */
export const useMapKeyboardShortcuts = (
  mapRef: RefObject<MapRef>,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl modifier key
      if (!(e.ctrlKey || e.metaKey)) return;

      // Handle zoom in: =, +, Equal (code), or + on numeric keypad
      const isZoomIn =
        e.key === "=" ||
        e.key === "+" ||
        e.code === "Equal" ||
        e.code === "NumpadAdd" ||
        (e.shiftKey && e.key === "=");

      // Handle zoom out: -, _, Minus (code), or _ (when Shift is held with -)
      const isZoomOut =
        e.key === "-" ||
        e.key === "_" ||
        e.code === "Minus" ||
        e.code === "NumpadSubtract" ||
        (e.shiftKey && e.key === "-");

      // If not a zoom key, ignore
      if (!isZoomIn && !isZoomOut) return;

      // Don't trigger if user is typing in an input field - allow browser zoom
      if (isInputField(e.target as HTMLElement)) {
        return;
      }

      // Check if map instance is available
      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance) {
        return;
      }

      // Always handle zoom shortcuts when map is available and not in input field
      // The input field check above already handles that case

      // Prevent browser zoom and handle map zoom
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      try {
        if (isZoomIn) {
          mapInstance.zoomIn({ duration: ZOOM_ANIMATION_DURATION_MS });
        } else if (isZoomOut) {
          mapInstance.zoomOut({ duration: ZOOM_ANIMATION_DURATION_MS });
        }
      } catch (error) {
        logger.error("Error handling zoom keyboard shortcut:", error);
      }
    };

    // Use capture phase with high priority to intercept before browser default behavior
    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
      passive: false,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
        passive: false,
      } as EventListenerOptions);
    };
  }, [mapRef, enabled]);
};
