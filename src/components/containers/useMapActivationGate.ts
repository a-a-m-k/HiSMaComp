import React, { useEffect, useRef, useState } from "react";

const IS_TEST_ENV = import.meta.env.MODE === "test";
export const MAP_ACTIVATION_MARK = "map-activation-start";
const MAP_AUTO_ACTIVATE_DELAY_MS = 1_500;
const MAP_ACTIVATION_INTERACTION_EVENTS: Array<keyof WindowEventMap> = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
];

export const MAP_FIRST_IDLE_MARK = "map-first-idle";
export const MAP_ACTIVATION_TO_IDLE_MEASURE = "map-activation-to-first-idle";

export function markPerformance(name: string): void {
  if (typeof performance === "undefined") return;
  performance.mark(name);
}

export function measurePerformance(
  measureName: string,
  startMark: string,
  endMark: string
): void {
  if (typeof performance === "undefined") return;
  try {
    performance.measure(measureName, startMark, endMark);
  } catch {
    // Ignore missing/unsupported marks.
  }
}

export function useMapActivationGate(): {
  isMapActivated: boolean;
  mapMountGateRef: React.RefObject<HTMLDivElement | null>;
} {
  const [isMapActivated, setIsMapActivated] = useState(IS_TEST_ENV);
  const mapMountGateRef = useRef<HTMLDivElement>(null);

  const activateMap = React.useCallback(() => {
    markPerformance(MAP_ACTIVATION_MARK);
    setIsMapActivated(true);
  }, []);

  useEffect(() => {
    if (isMapActivated) return;

    for (const eventName of MAP_ACTIVATION_INTERACTION_EVENTS) {
      window.addEventListener(eventName, activateMap, { once: true });
    }

    return () => {
      for (const eventName of MAP_ACTIVATION_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, activateMap);
      }
    };
  }, [activateMap, isMapActivated]);

  useEffect(() => {
    if (isMapActivated) return;
    if (typeof IntersectionObserver === "undefined") {
      activateMap();
      return;
    }

    const target = mapMountGateRef.current;
    if (!target) return;

    let idleCallbackId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let activated = false;

    const activateWhenIdle = () => {
      if (activated) return;
      activated = true;
      activateMap();
    };

    const scheduleDeferredActivation = () => {
      if ("requestIdleCallback" in window) {
        idleCallbackId = window.requestIdleCallback(() => activateWhenIdle(), {
          timeout: MAP_AUTO_ACTIVATE_DELAY_MS,
        });
      } else {
        timeoutId = globalThis.setTimeout(
          () => activateWhenIdle(),
          MAP_AUTO_ACTIVATE_DELAY_MS
        );
      }
    };

    const observer = new IntersectionObserver(
      entries => {
        const isVisible = entries.some(
          entry => entry.isIntersecting || entry.intersectionRatio > 0
        );
        if (isVisible) {
          scheduleDeferredActivation();
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 }
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      if (idleCallbackId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [activateMap, isMapActivated]);

  return { isMapActivated, mapMountGateRef };
}
