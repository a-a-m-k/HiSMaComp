import { useEffect, useState } from "react";
import type { PerformanceMemory } from "@/common/types";

export interface PerformanceMetricsState {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  componentCount: number;
  townsCount: number;
  lastRenderTime: number;
}

const INITIAL_METRICS: PerformanceMetricsState = {
  renderTime: 0,
  fps: 60,
  componentCount: 0,
  townsCount: 0,
  lastRenderTime: 0,
};

/**
 * Tracks FPS, render time, memory, and DOM counts via requestAnimationFrame.
 * Only runs in DEV. Used by PerformanceMonitor.
 */
export function usePerformanceMetrics(): PerformanceMetricsState {
  const [metrics, setMetrics] =
    useState<PerformanceMetricsState>(INITIAL_METRICS);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const timeElapsed = currentTime - lastTime;
        const fps = Math.round((frameCount * 1000) / timeElapsed);
        const renderTime = frameCount > 0 ? timeElapsed / frameCount : 0;

        const mapContainer = document.querySelector("#map-container");
        const townsCount = mapContainer
          ? Array.from(mapContainer.querySelectorAll("[data-town]")).length
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          renderTime,
          memoryUsage: (
            performance as Performance & { memory?: PerformanceMemory }
          ).memory?.usedJSHeapSize,
          componentCount: document.querySelectorAll("[data-testid]").length,
          townsCount,
          lastRenderTime: currentTime,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return metrics;
}
