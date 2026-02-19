import { useState, useEffect, useRef } from "react";
import { RESIZE_DEBOUNCE_MS } from "@/constants/breakpoints";

/**
 * Returns whether overlay buttons (screenshot, zoom) should be visible.
 * Hides on resize start, shows again when resize has been idle for RESIZE_DEBOUNCE_MS
 * and the map has reported idle (e.g. tiles loaded).
 */
export function useOverlayButtonsVisible(isMapIdle: boolean): boolean {
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsResizing(true);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        resizeTimeoutRef.current = null;
        setIsResizing(false);
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isMapIdle && !isResizing;
}
