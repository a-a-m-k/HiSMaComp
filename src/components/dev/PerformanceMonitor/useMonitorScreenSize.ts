import { useEffect, useState } from "react";

const LARGE_SCREEN_BREAKPOINT = 768;

/**
 * True when window width > 768. Throttled on resize. Used by PerformanceMonitor.
 */
export function useMonitorScreenSize(): boolean {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > LARGE_SCREEN_BREAKPOINT);
    };

    checkScreenSize();

    let timeoutId: ReturnType<typeof setTimeout>;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener("resize", throttledResize);
    return () => {
      window.removeEventListener("resize", throttledResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isLargeScreen;
}
