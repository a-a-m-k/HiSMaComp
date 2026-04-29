import { useCallback, useEffect, useState } from "react";

const IS_TEST_ENV = import.meta.env.MODE === "test";
const OVERLAY_AUTO_ACTIVATE_DELAY_MS = 1_500;
const OVERLAY_ACTIVATION_EVENTS: Array<keyof WindowEventMap> = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
];

export function useDeferredOverlayActivation(mapReady: boolean): boolean {
  const [isOverlayActivated, setIsOverlayActivated] = useState(IS_TEST_ENV);

  const activateOverlays = useCallback(() => {
    setIsOverlayActivated(true);
  }, []);

  useEffect(() => {
    if (!mapReady || isOverlayActivated) return;
    if (typeof window === "undefined") {
      activateOverlays();
      return;
    }

    let idleCallbackId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(() => activateOverlays(), {
        timeout: OVERLAY_AUTO_ACTIVATE_DELAY_MS,
      });
    } else {
      timeoutId = globalThis.setTimeout(
        activateOverlays,
        OVERLAY_AUTO_ACTIVATE_DELAY_MS
      );
    }

    for (const eventName of OVERLAY_ACTIVATION_EVENTS) {
      window.addEventListener(eventName, activateOverlays, { once: true });
    }

    return () => {
      for (const eventName of OVERLAY_ACTIVATION_EVENTS) {
        window.removeEventListener(eventName, activateOverlays);
      }
      if (idleCallbackId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [activateOverlays, isOverlayActivated, mapReady]);

  return mapReady && isOverlayActivated;
}
