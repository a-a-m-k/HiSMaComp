import { useCallback, useRef } from "react";
import {
  KEYBOARD_NAVIGATION_KEYS,
  type KeyboardNavigationKey,
} from "@/constants/keyboard";
import { logger } from "@/utils/logger";
import { enableTownMarkerFocus } from "@/utils/markers";

/**
 * Custom hook for keyboard navigation between map markers.
 * Handles arrow key navigation, Home/End shortcuts, and maintains
 * a cache of marker elements for performance.
 *
 * @param onFocusChange - Callback when focus changes to a different marker
 * @returns Handler function for keyboard events
 */
export const useMarkerKeyboardNavigation = (
  onFocusChange: (markerId: string) => void
) => {
  const markerElementsRef = useRef<HTMLElement[]>([]);

  const updateCache = useCallback(() => {
    markerElementsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>("[data-marker-id]")
    );
  }, []);

  /**
   * Handles keyboard navigation between map markers using arrow keys.
   * Supports Home/End for jumping to first/last marker, and arrow keys
   * for sequential navigation. Finds marker position dynamically in DOM
   * order to handle sorting correctly.
   */
  const handleMarkerKeyDown = useCallback(
    (e: React.KeyboardEvent, currentMarkerId: string) => {
      if (!KEYBOARD_NAVIGATION_KEYS.includes(e.key as KeyboardNavigationKey)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      try {
        let allMarkerElements = markerElementsRef.current;

        if (allMarkerElements.length === 0) {
          updateCache();
          allMarkerElements = markerElementsRef.current;
        }

        if (allMarkerElements.length === 0) return;

        const currentIndex = allMarkerElements.findIndex(
          el => el.getAttribute("data-marker-id") === currentMarkerId
        );

        if (currentIndex === -1) return;

        let nextIndex: number;

        if (e.key === "Home") {
          nextIndex = 0;
        } else if (e.key === "End") {
          nextIndex = allMarkerElements.length - 1;
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % allMarkerElements.length;
        } else {
          nextIndex =
            currentIndex - 1 < 0
              ? allMarkerElements.length - 1
              : currentIndex - 1;
        }

        const nextMarker = allMarkerElements[nextIndex];
        if (nextMarker) {
          enableTownMarkerFocus(nextMarker);
          nextMarker.focus();
          const markerId = nextMarker.getAttribute("data-marker-id");
          if (markerId) {
            onFocusChange(markerId);
          }
        }
      } catch (error) {
        logger.error("Error navigating markers:", error);
      }
    },
    [onFocusChange, updateCache]
  );

  return handleMarkerKeyDown;
};
