import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { logger } from "@/utils/logger";
import { isInputField } from "@/utils/keyboard";

/**
 * Keyboard shortcuts for map zoom (Cmd/Ctrl +/- and +/-). Smooth zoom animation.
 * Only active when enabled (e.g. desktop only).
 * Uses capture phase so the handler runs before the browser's default zoom behavior.
 * Pass zoomDurationMs 0 when user prefers reduced motion.
 */
export const useMapKeyboardShortcuts = (
  mapRef: RefObject<MapRef>,
  enabled: boolean,
  zoomDurationMs: number = ZOOM_ANIMATION_DURATION_MS
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
          mapInstance.zoomIn({ duration: zoomDurationMs });
        } else if (isZoomOut) {
          mapInstance.zoomOut({ duration: zoomDurationMs });
        }
      } catch (error) {
        logger.error("Error handling zoom keyboard shortcut:", error);
      }
    };

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
  }, [mapRef, enabled, zoomDurationMs]);
};
