import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { logger } from "@/utils/logger";
import {
  DOM_SETTLE_TIMEOUT_MS,
  ZOOM_ANIMATION_DURATION_MS,
} from "@/constants/keyboard";

/**
 * Custom hook that ensures NavigationControl buttons are accessible and in tab order,
 * and that zoom in/out use progressive (animated) zoom.
 *
 * @param isMobile - Whether the device is mobile (NavigationControl not shown on mobile)
 * @param containerRef - Optional ref to the map container element for better scoping
 * @param mapRef - Optional ref to the map; when provided, zoom buttons use animated zoom
 */
export const useNavigationControlAccessibility = (
  isMobile: boolean,
  containerRef?: RefObject<HTMLElement>,
  mapRef?: RefObject<MapRef | null>
) => {
  useEffect(() => {
    if (isMobile) return;

    const duration = ZOOM_ANIMATION_DURATION_MS;

    const ensureNavigationControlAccessible = () => {
      try {
        const container = containerRef?.current || null;
        const navControls = container
          ? container.querySelectorAll(".maplibregl-ctrl-group button")
          : document.querySelectorAll(".maplibregl-ctrl-group button");

        if (navControls.length > 0) {
          navControls.forEach(button => {
            const el = button as HTMLElement;

            if (el.tabIndex < 0) {
              el.tabIndex = 0;
            }

            el.removeAttribute("title");

            const className = el.className || "";
            if (className.includes("maplibregl-ctrl-zoom-in")) {
              el.setAttribute(
                "data-tooltip",
                "Zoom in (Ctrl+Plus or Cmd+Plus)"
              );
              if (!el.getAttribute("aria-label")) {
                el.setAttribute(
                  "aria-label",
                  "Zoom in. Press Ctrl+Plus or Cmd+Plus to zoom in."
                );
              }
              if (mapRef?.current && !el.dataset.progressiveZoomBound) {
                el.dataset.progressiveZoomBound = "1";
                el.addEventListener(
                  "click",
                  (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const map = mapRef.current?.getMap();
                    if (map) map.zoomIn({ duration });
                  },
                  true
                );
              }
            } else if (className.includes("maplibregl-ctrl-zoom-out")) {
              el.setAttribute(
                "data-tooltip",
                "Zoom out (Ctrl+Minus or Cmd+Minus)"
              );
              if (!el.getAttribute("aria-label")) {
                el.setAttribute(
                  "aria-label",
                  "Zoom out. Press Ctrl+Minus or Cmd+Minus to zoom out."
                );
              }
              if (mapRef?.current && !el.dataset.progressiveZoomBound) {
                el.dataset.progressiveZoomBound = "1";
                el.addEventListener(
                  "click",
                  (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const map = mapRef.current?.getMap();
                    if (map) map.zoomOut({ duration });
                  },
                  true
                );
              }
            }
          });
        }
      } catch (error) {
        logger.error("Error ensuring navigation control accessibility:", error);
      }
    };

    const timeoutId = setTimeout(
      ensureNavigationControlAccessible,
      DOM_SETTLE_TIMEOUT_MS
    );

    const observer = new MutationObserver(() => {
      ensureNavigationControlAccessible();
    });

    try {
      const mapContainer =
        containerRef?.current || document.querySelector('[role="application"]');
      if (mapContainer) {
        observer.observe(mapContainer, {
          childList: true,
          subtree: true,
        });
      }
    } catch (error) {
      logger.error("Error setting up MutationObserver:", error);
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [isMobile, containerRef]);
};
