import { useEffect, RefObject, useRef, useCallback } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { isInputField } from "@/utils/keyboard";

/**
 * Pan distance as percentage of viewport width/height per frame.
 * Higher value = faster panning. Adjusted for smooth ~60fps animation.
 */
const PAN_SPEED_PERCENT = 0.01;

/**
 * Custom hook for keyboard panning of the map.
 * Uses continuous panning via requestAnimationFrame for smooth, efficient updates.
 * Supports arrow keys (ArrowUp, ArrowDown, ArrowLeft, ArrowRight) for panning.
 * Only active when map container is focused and not typing in input fields.
 *
 * Note: MapLibre's built-in keyboard handler doesn't support:
 * - Continuous panning (only discrete keypresses)
 * - Marker focus detection (arrow keys must navigate markers when focused)
 * - Viewport-proportional panning (uses fixed 100px)
 *
 * Therefore, a custom implementation is necessary.
 *
 * @param mapRef - Reference to the Map component
 * @param containerRef - Reference to the map container element
 * @param enabled - Whether keyboard panning is enabled (typically desktop only)
 */
export const useMapKeyboardPanning = (
  mapRef: RefObject<MapRef>,
  containerRef: RefObject<HTMLElement>,
  enabled: boolean = true
) => {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Checks if map panning should be active.
   * Returns false if markers are focused, input fields are active, or map isn't focused.
   */
  const shouldPan = useCallback(
    (activeElement: HTMLElement | null): boolean => {
      if (!activeElement || isInputField(activeElement)) {
        return false;
      }

      const isMarkerFocused =
        activeElement.getAttribute("data-marker-id") ||
        activeElement.closest("[data-marker-id]") ||
        activeElement.closest(".maplibregl-marker");

      if (isMarkerFocused) {
        return false;
      }

      return activeElement === containerRef.current;
    },
    [containerRef]
  );

  /**
   * Continuous panning loop using requestAnimationFrame.
   * Calculates pan distance based on viewport size for consistent feel.
   * requestAnimationFrame already handles optimal frame timing, so no manual throttling needed.
   */
  const panLoop = useCallback(() => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) {
      animationFrameRef.current = null;
      return;
    }

    const activeElement = document.activeElement as HTMLElement;
    if (!shouldPan(activeElement)) {
      animationFrameRef.current = null;
      pressedKeysRef.current.clear();
      return;
    }

    const canvas = mapInstance.getCanvas();
    const panDistanceX = canvas.width * PAN_SPEED_PERCENT;
    const panDistanceY = canvas.height * PAN_SPEED_PERCENT;

    let offsetX = 0;
    let offsetY = 0;

    if (pressedKeysRef.current.has("ArrowUp")) offsetY -= panDistanceY;
    if (pressedKeysRef.current.has("ArrowDown")) offsetY += panDistanceY;
    if (pressedKeysRef.current.has("ArrowRight")) offsetX += panDistanceX;
    if (pressedKeysRef.current.has("ArrowLeft")) offsetX -= panDistanceX;

    if (offsetX !== 0 || offsetY !== 0) {
      mapInstance.panBy([offsetX, offsetY], { duration: 0 });
    }

    if (pressedKeysRef.current.size > 0) {
      animationFrameRef.current = requestAnimationFrame(panLoop);
    } else {
      animationFrameRef.current = null;
    }
  }, [mapRef, shouldPan]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement;
      if (!shouldPan(activeElement)) {
        return;
      }

      if (!pressedKeysRef.current.has(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        pressedKeysRef.current.add(e.key);

        if (animationFrameRef.current === null) {
          animationFrameRef.current = requestAnimationFrame(panLoop);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        pressedKeysRef.current.delete(e.key);

        if (
          pressedKeysRef.current.size === 0 &&
          animationFrameRef.current !== null
        ) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };

    const handleBlur = () => {
      pressedKeysRef.current.clear();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const container = containerRef.current;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    container?.addEventListener("blur", handleBlur);
    const currentPressedKeys = pressedKeysRef.current;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      container?.removeEventListener("blur", handleBlur);

      const currentAnimationFrame = animationFrameRef.current;

      currentPressedKeys.clear();
      if (currentAnimationFrame !== null) {
        cancelAnimationFrame(currentAnimationFrame);
      }
    };
  }, [containerRef, shouldPan, panLoop, enabled]);
};
