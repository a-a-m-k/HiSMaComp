import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  hideMapControls,
  restoreMapControls,
  LEGEND_SCREENSHOT_EXPAND_WAIT_MS,
  dispatchLegendScreenshotExpand,
  dispatchLegendScreenshotRestore,
} from "@/components/controls/ScreenshotButton/utils";
import { announce } from "@/utils/accessibility";
import { dispatchMapScreenshotCaptureState } from "@/utils/events/mapEvents";
import { getAppErrorMessage, reportAppError } from "@/utils/errorPolicy";
import { trackEvent, trackTiming } from "@/utils/observability";

/**
 * Options for the useScreenshot hook.
 */
interface UseScreenshotOptions {
  /** CSS selector for the map container element to capture. Defaults to "#map-container" */
  mapContainerSelector?: string;
  /** Filename for the downloaded screenshot. Defaults to "map.png" */
  filename?: string;
}

/**
 * Hook for capturing screenshots of the map container.
 *
 * Uses html2canvas to capture the map as a PNG image. Hides chrome (zoom,
 * reset view, timeline, collapse controls) during capture; on small screens the
 * save button can stay visible. Legend attribution stays in place in the export.
 *
 * @param options - Configuration options for screenshot capture
 * @returns Object with captureScreenshot function and isCapturing state
 *
 * @example
 * ```tsx
 * const { captureScreenshot, isCapturing } = useScreenshot({
 *   mapContainerSelector: "#map",
 *   filename: "my-map.png"
 * });
 *
 * <button onClick={captureScreenshot} disabled={isCapturing}>
 *   {isCapturing ? "Capturing..." : "Save Screenshot"}
 * </button>
 * ```
 */
export const useScreenshot = ({
  mapContainerSelector = "#map-container",
  filename = "map.png",
}: UseScreenshotOptions = {}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCapturing, setIsCapturing] = useState(false);
  const mountedRef = useRef(true);

  const captureScreenshot = useCallback(async () => {
    if (isCapturing) return;
    const start = performance.now();

    const mapContainer =
      document.querySelector<HTMLElement>(mapContainerSelector);
    if (!mapContainer) {
      const missingContainerError = new Error(
        `Map container not found: ${mapContainerSelector}`
      );
      reportAppError(missingContainerError, {
        category: "screenshot-capture",
        operation: "querySelector",
      });
      const errorMessage = getAppErrorMessage(missingContainerError, {
        category: "screenshot-capture",
        operation: "querySelector",
      });
      announce(errorMessage, "assertive");
      trackEvent({
        name: "screenshot_capture_failed",
        level: "warn",
        data: { reason: "container_missing" },
      });
      return;
    }

    setIsCapturing(true);
    dispatchMapScreenshotCaptureState({ isCapturing: true });
    // Let React propagate `isScreenshotCapturing` into Map components so MapLibre
    // canvases can flip `preserveDrawingBuffer=true` before html2canvas snapshots.
    // Microtask yielding keeps tests deterministic (no fake-timer/frame coupling).
    await Promise.resolve();
    await Promise.resolve();

    const legendToggle = document.querySelector<HTMLElement>(
      '#legend [aria-controls="legend-collapsible"]'
    );
    const legendAlreadyExpanded =
      !legendToggle || legendToggle.getAttribute("aria-expanded") !== "false";

    dispatchLegendScreenshotExpand();

    if (!legendAlreadyExpanded) {
      const expandWaitMs =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 50
          : LEGEND_SCREENSHOT_EXPAND_WAIT_MS;
      await new Promise<void>(resolve => setTimeout(resolve, expandWaitMs));
    }

    let controls: NodeListOf<Element> | null = null;
    let prevDisplay: string[] = [];
    let link: HTMLAnchorElement | null = null;

    try {
      const html2canvas = (await import("html2canvas")).default;

      const hiddenControls = hideMapControls(mapContainer, {
        keepScreenshotButtonVisibleDuringCapture: isMobile,
      });
      controls = hiddenControls.controls;
      prevDisplay = hiddenControls.prevDisplay;

      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        backgroundColor: theme.palette.background.paper,
        logging: false,
        scale: isMobile ? 1 : 2,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 5000,
        onclone: clonedDoc => {
          if (import.meta.env.DEV) {
            clonedDoc.querySelector("[data-performance-monitor]")?.remove();
          }
          const legendElements = clonedDoc.querySelectorAll(
            '[aria-label*="Color for"]'
          );
          legendElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.opacity = "1";
            element.style.visibility = "visible";
          });
        },
      });

      const url = canvas.toDataURL("image/png", isMobile ? 1.0 : 0.9);
      link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      trackTiming("screenshot_capture_ms", performance.now() - start, {
        result: "success",
      });

      setTimeout(() => {
        if (link && link.parentNode === document.body) {
          document.body.removeChild(link);
        }
      }, 100);
    } catch (error) {
      reportAppError(error, {
        category: "screenshot-capture",
        operation: "html2canvas",
      });
      const errorMessage = getAppErrorMessage(error, {
        category: "screenshot-capture",
        operation: "html2canvas",
      });
      announce(errorMessage, "assertive");
      trackTiming("screenshot_capture_ms", performance.now() - start, {
        result: "error",
      });
    } finally {
      dispatchLegendScreenshotRestore();
      dispatchMapScreenshotCaptureState({ isCapturing: false });
      if (controls) {
        restoreMapControls(controls, prevDisplay);
      }
      if (mountedRef.current) setIsCapturing(false);
    }
  }, [isCapturing, mapContainerSelector, filename, theme, isMobile]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { captureScreenshot, isCapturing };
};
