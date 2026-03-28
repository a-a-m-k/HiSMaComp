import { useEffect, RefObject } from "react";
import { logger } from "@/utils/logger";
import { DOM_SETTLE_TIMEOUT_MS } from "@/constants/keyboard";
import { strings } from "@/locales";

/**
 * Improves NavigationControl button accessibility (tab order, aria-labels, tooltips).
 * MapLibre still handles zoom; primary mouse clicks skip focus to avoid sticky hover/focus.
 */
export const useNavigationControlAccessibility = (
  enabled: boolean,
  containerRef?: RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (!enabled) return;

    const mapContainer =
      containerRef?.current || document.querySelector('[role="application"]');

    const preventMouseFocusOnZoomButtons = (e: Event) => {
      if (!(e instanceof MouseEvent) || e.button !== 0) return;
      const t = e.target;
      if (t instanceof Element && t.closest(".maplibregl-ctrl-group button")) {
        e.preventDefault();
      }
    };

    if (mapContainer) {
      mapContainer.addEventListener(
        "mousedown",
        preventMouseFocusOnZoomButtons,
        true
      );
    }

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
            el.setAttribute("data-tooltip", strings.map.zoomInTooltip);
            el.setAttribute("aria-label", strings.map.zoomInTooltip);
            el.setAttribute("aria-keyshortcuts", "Control+Equal Meta+Equal");
          } else if (className.includes("maplibregl-ctrl-zoom-out")) {
            el.setAttribute("data-tooltip", strings.map.zoomOutTooltip);
            el.setAttribute("aria-label", strings.map.zoomOutTooltip);
            el.setAttribute("aria-keyshortcuts", "Control+Minus Meta+Minus");
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
      mapContainer?.removeEventListener(
        "mousedown",
        preventMouseFocusOnZoomButtons,
        true
      );
    };
  }, [enabled, containerRef]);
};
