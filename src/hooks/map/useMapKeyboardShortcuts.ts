import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { logger } from "@/utils/logger";
import { isInputField } from "@/utils/keyboard";

/**
 * Keyboard shortcuts for map zoom (Cmd/Ctrl +/- and +/-). Smooth zoom animation.
 * Only active when enabled (e.g. desktop only).
 */
export const useMapKeyboardShortcuts = (
  mapRef: RefObject<MapRef>,
  enabled: boolean
) => {
  useEffect(() => {
    if (!enabled) {
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
  }, [mapRef, enabled]);
};
