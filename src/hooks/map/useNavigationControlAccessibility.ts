import { useEffect, RefObject } from "react";
import { logger } from "@/utils/logger";
import { DOM_SETTLE_TIMEOUT_MS } from "@/constants/keyboard";

/**
 * Custom hook that ensures NavigationControl buttons are accessible and in tab order.
 * Observes the map container for dynamically rendered controls and ensures
 * they have proper tabIndex values. Scoped to map container for better performance.
 *
 * @param isMobile - Whether the device is mobile (NavigationControl not shown on mobile)
 * @param containerRef - Optional ref to the map container element for better scoping
 */
export const useNavigationControlAccessibility = (
  isMobile: boolean,
  containerRef?: RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (isMobile) return;

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
