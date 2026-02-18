import { useEffect, RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { logger } from "@/utils/logger";
import { DOM_SETTLE_TIMEOUT_MS } from "@/constants/keyboard";

/**
 * Improves NavigationControl button accessibility (tab order, aria-labels).
 * Does not add or remove any click handlers – MapLibre handles zoom.
 */
export const useNavigationControlAccessibility = (
  enabled: boolean,
  containerRef?: RefObject<HTMLElement>,
  _mapRef?: RefObject<MapRef | null>
) => {
  useEffect(() => {
    if (!enabled) return;

    const applyAccessibility = () => {
      try {
        const container = containerRef?.current || null;
        const navControls = container
          ? container.querySelectorAll(".maplibregl-ctrl-group button")
          : document.querySelectorAll(".maplibregl-ctrl-group button");

        navControls.forEach(button => {
          const el = button as HTMLElement;
          if (el.tabIndex < 0) el.tabIndex = 0;
          el.removeAttribute("title");

          const className = el.className || "";
          if (className.includes("maplibregl-ctrl-zoom-in")) {
            el.setAttribute("data-tooltip", "Zoom in (Ctrl+Plus or Cmd+Plus)");
            if (!el.getAttribute("aria-label")) {
              el.setAttribute(
                "aria-label",
                "Zoom in. Press Ctrl+Plus or Cmd+Plus to zoom in."
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
          }
        });
      } catch (error) {
        logger.error("Error ensuring navigation control accessibility:", error);
      }
    };

    const timeoutId = setTimeout(applyAccessibility, DOM_SETTLE_TIMEOUT_MS);

    const observer = new MutationObserver(() => {
      requestAnimationFrame(applyAccessibility);
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
  }, [enabled, containerRef]);
};
