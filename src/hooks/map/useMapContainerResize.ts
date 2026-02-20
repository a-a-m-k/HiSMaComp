import { useEffect, useState, useRef, RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { RESIZE_DEBOUNCE_MS } from "@/constants/breakpoints";

/**
 * Tracks map container size via ResizeObserver and triggers map.resize() on window
 * resize (debounced). Returns container size for effective min zoom etc.
 */
export function useMapContainerResize(
  containerRef: RefObject<HTMLDivElement | null>,
  mapRef: RefObject<MapRef | null>
): { width: number; height: number } | null {
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry?.contentRect) {
        const { width, height } = entry.contentRect;
        setContainerSize(prev =>
          prev?.width === width && prev?.height === height
            ? prev
            : { width, height }
        );
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const scheduleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        resizeTimeoutRef.current = null;
        mapRef.current?.getMap()?.resize();
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    return () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
    };
  }, [mapRef]);

  return containerSize;
}
