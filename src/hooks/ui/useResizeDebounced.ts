import { useState, useEffect, useRef } from "react";

/**
 * Tracks whether the window is currently "resizing" (resize/orientationchange fired
 * and debounce period has not yet elapsed). Use for hiding overlays or disabling
 * layout transitions during resize.
 */
export function useResizeDebounced(debounceMs: number): boolean {
  const [isResizing, setIsResizing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsResizing(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setIsResizing(false);
      }, debounceMs);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [debounceMs]);

  return isResizing;
}
