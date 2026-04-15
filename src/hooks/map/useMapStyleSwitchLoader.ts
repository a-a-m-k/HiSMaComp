import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_STYLE_SWITCH_TIMEOUT_MS = 8000;

interface UseMapStyleSwitchLoaderParams {
  mapStyleMode: string;
  onFirstIdle?: () => void;
  styleSwitchTimeoutMs?: number;
}

interface UseMapStyleSwitchLoaderResult {
  isStyleSwitching: boolean;
  onOverlayIdle: () => void;
  onBasemapIdle: () => void;
}

/**
 * Tracks map-style switch readiness and exposes idle handlers for overlay/basemap maps.
 * The loader completes only when required map(s) are idle for the active switch token.
 */
export function useMapStyleSwitchLoader({
  mapStyleMode,
  onFirstIdle,
  styleSwitchTimeoutMs = DEFAULT_STYLE_SWITCH_TIMEOUT_MS,
}: UseMapStyleSwitchLoaderParams): UseMapStyleSwitchLoaderResult {
  const [isStyleSwitching, setIsStyleSwitching] = useState(false);
  const hasFiredFirstIdleRef = useRef(false);
  const previousMapStyleModeRef = useRef(mapStyleMode);
  const styleSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const switchNeedsBasemapIdleRef = useRef(false);
  const overlayIdleDoneRef = useRef(false);
  const basemapIdleDoneRef = useRef(false);
  const styleSwitchTokenRef = useRef(0);

  const tryCompleteStyleSwitch = useCallback(
    (token: number) => {
      if (token !== styleSwitchTokenRef.current) return;
      if (!isStyleSwitching) return;
      const overlayDone = overlayIdleDoneRef.current;
      const basemapDone = switchNeedsBasemapIdleRef.current
        ? basemapIdleDoneRef.current
        : true;
      if (overlayDone && basemapDone) {
        setIsStyleSwitching(false);
        if (styleSwitchTimeoutRef.current) {
          clearTimeout(styleSwitchTimeoutRef.current);
          styleSwitchTimeoutRef.current = null;
        }
      }
    },
    [isStyleSwitching]
  );

  const onOverlayIdle = useCallback(() => {
    if (!hasFiredFirstIdleRef.current) {
      hasFiredFirstIdleRef.current = true;
      onFirstIdle?.();
    }
    overlayIdleDoneRef.current = true;
    tryCompleteStyleSwitch(styleSwitchTokenRef.current);
  }, [onFirstIdle, tryCompleteStyleSwitch]);

  const onBasemapIdle = useCallback(() => {
    basemapIdleDoneRef.current = true;
    tryCompleteStyleSwitch(styleSwitchTokenRef.current);
  }, [tryCompleteStyleSwitch]);

  useEffect(() => {
    if (previousMapStyleModeRef.current !== mapStyleMode) {
      previousMapStyleModeRef.current = mapStyleMode;
      setIsStyleSwitching(true);
      const token = ++styleSwitchTokenRef.current;
      switchNeedsBasemapIdleRef.current = mapStyleMode === "dark";
      overlayIdleDoneRef.current = false;
      basemapIdleDoneRef.current = false;
      if (styleSwitchTimeoutRef.current)
        clearTimeout(styleSwitchTimeoutRef.current);
      // Fallback: avoid a stuck overlay if `idle` never fires (network/style edge cases).
      styleSwitchTimeoutRef.current = setTimeout(() => {
        if (token !== styleSwitchTokenRef.current) return;
        setIsStyleSwitching(false);
        styleSwitchTimeoutRef.current = null;
      }, styleSwitchTimeoutMs);
    }
  }, [mapStyleMode, styleSwitchTimeoutMs]);

  useEffect(() => {
    return () => {
      if (styleSwitchTimeoutRef.current) {
        clearTimeout(styleSwitchTimeoutRef.current);
        styleSwitchTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    isStyleSwitching,
    onOverlayIdle,
    onBasemapIdle,
  };
}
