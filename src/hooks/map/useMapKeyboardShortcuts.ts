import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { logger } from "@/utils/logger";
import { isInputField } from "@/utils/keyboard";

/**
 * Custom hook for handling keyboard shortcuts for map zoom.
 * Supports Cmd/Ctrl + (zoom in) and Cmd/Ctrl - (zoom out) globally.
 * Also supports plain +/- when focus is inside the map container.
 * Prevents default browser behavior and triggers smooth zoom animations.
 * Only enabled on desktop devices for performance optimization.
 *
 * @param mapRef - Reference to the Map component
 * @param containerOrEnabled - Optional map container ref or enabled flag (legacy)
 * @param enabled - Whether keyboard shortcuts are enabled (typically desktop only)
 */
export const useMapKeyboardShortcuts = (
  mapRef: RefObject<MapRef>,
  containerOrEnabled?: RefObject<HTMLElement> | boolean,
  enabled: boolean = true
) => {
  const shortcutsEnabled =
    typeof containerOrEnabled === "boolean" ? containerOrEnabled : enabled;

  useEffect(() => {
    if (!shortcutsEnabled) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isZoomIn =
        e.key === "=" ||
        e.key === "+" ||
        e.code === "Equal" ||
        e.code === "NumpadAdd" ||
        (e.shiftKey && e.key === "=");

      const isZoomOut =
        e.key === "-" ||
        e.key === "_" ||
        e.code === "Minus" ||
        e.code === "NumpadSubtract";

      if (!isZoomIn && !isZoomOut) return;

      const target = e.target;
      if (target instanceof HTMLElement && isInputField(target)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance) {
        logger.warn("Map instance not available for zoom keyboard shortcut");
        return;
      }

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
    // This is different from other keyboard hooks (e.g., useMapKeyboardPanning) which
    // use default bubbling phase, because browser zoom handler runs in capture phase
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
  }, [mapRef, shortcutsEnabled]);
};
