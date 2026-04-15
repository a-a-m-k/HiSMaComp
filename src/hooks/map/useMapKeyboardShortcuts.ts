import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { MAP_RESET_CAMERA_EVENT } from "@/constants/map";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { logger } from "@/utils/logger";
import { isInputField } from "@/utils/keyboard";

/**
 * Keyboard shortcuts for map zoom (Cmd/Ctrl +/- and +/-), Shift+R reset, Cmd/Ctrl+Shift+N basemap (night) toggle, and plain +/-.
 * Smooth zoom animation. Only active when enabled (e.g. desktop only).
 * Pass zoomDurationMs 0 when user prefers reduced motion.
 */
export const useMapKeyboardShortcuts = (
  mapRef: RefObject<MapRef>,
  enabled: boolean,
  zoomDurationMs: number = ZOOM_ANIMATION_DURATION_MS,
  onToggleBasemapMode?: () => void
) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && isInputField(target)) {
        return;
      }

      const isNightBasemapToggle =
        e.shiftKey &&
        (e.metaKey || e.ctrlKey) &&
        e.code === "KeyN" &&
        !e.altKey;

      if (isNightBasemapToggle) {
        if (!onToggleBasemapMode) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        onToggleBasemapMode();
        return;
      }

      const isResetView =
        e.shiftKey &&
        e.code === "KeyR" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey;

      if (isResetView) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        window.dispatchEvent(new Event(MAP_RESET_CAMERA_EVENT));
        return;
      }

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
  }, [mapRef, enabled, zoomDurationMs, onToggleBasemapMode]);
};
