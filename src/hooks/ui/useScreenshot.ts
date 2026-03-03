import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  hideMapControls,
  restoreMapControls,
  addAttributionOverlay,
} from "@/components/controls/ScreenshotButton/utils";
import { logger } from "@/utils/logger";

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
 * Uses html2canvas to capture the map as a PNG image. Automatically hides
 * map controls during capture and adds attribution overlay. Handles responsive
 * scaling for different device types.
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
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [isCapturing, setIsCapturing] = useState(false);
  const mountedRef = useRef(true);

  const captureScreenshot = useCallback(async () => {
    if (isCapturing) return;

    const mapContainer =
      document.querySelector<HTMLElement>(mapContainerSelector);
    if (!mapContainer) {
      logger.error(
        "Screenshot failed: Map container not found",
        mapContainerSelector
      );
      return;
    }

    setIsCapturing(true);

    let controls: NodeListOf<Element> | null = null;
    let prevDisplay: string[] = [];
    let attributionDiv: HTMLElement | null = null;
    let link: HTMLAnchorElement | null = null;

    try {
      const html2canvas = (await import("html2canvas")).default;

      const hiddenControls = hideMapControls(mapContainer);
      controls = hiddenControls.controls;
      prevDisplay = hiddenControls.prevDisplay;
      attributionDiv = addAttributionOverlay(
        mapContainer,
        theme,
        isMobile,
        isTablet
      );

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

      setTimeout(() => {
        if (link && link.parentNode === document.body) {
          document.body.removeChild(link);
        }
      }, 100);
    } catch (error) {
      logger.error("Screenshot capture failed:", error);
    } finally {
      if (attributionDiv) {
        attributionDiv.remove();
      }
      if (controls) {
        restoreMapControls(controls, prevDisplay);
      }
      if (mountedRef.current) setIsCapturing(false);
    }
  }, [isCapturing, mapContainerSelector, filename, theme, isMobile, isTablet]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { captureScreenshot, isCapturing };
};
