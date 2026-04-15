import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MapViewState } from "@/hooks/map";
import {
  dispatchMapCameraResetState,
  onMapResetCamera,
  onMapScreenshotCaptureState,
} from "@/utils/events/mapEvents";

import {
  createCameraResetTarget,
  isViewAtResetCamera,
  RESIZE_RECENTER_DELAY_MS,
} from "./cameraReset";

type SafeMapProps = {
  longitude: number;
  latitude: number;
  zoom: number;
};

type ContainerSize = {
  width: number;
  height: number;
};

type UseMapCameraLifecycleArgs = {
  safeProps: SafeMapProps;
  effectiveMinZoom: number;
  requestCameraFitTo: (target: SafeMapProps) => void;
  viewState: MapViewState;
  mapReady: boolean;
  isResizing: boolean;
  containerSize: ContainerSize | null;
};

export const useMapCameraLifecycle = ({
  safeProps,
  effectiveMinZoom,
  requestCameraFitTo,
  viewState,
  mapReady,
  isResizing,
  containerSize,
}: UseMapCameraLifecycleArgs) => {
  const previousContainerSizeRef = useRef<ContainerSize | null>(null);
  const resizeRecenterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hasRunInitialReadyFitRef = useRef(false);
  const previousIsResizingRef = useRef(isResizing);
  const [isScreenshotCapturing, setIsScreenshotCapturing] = useState(false);

  const resetCameraTarget = useMemo(
    () =>
      createCameraResetTarget(
        safeProps.longitude,
        safeProps.latitude,
        safeProps.zoom,
        effectiveMinZoom
      ),
    [safeProps.longitude, safeProps.latitude, safeProps.zoom, effectiveMinZoom]
  );

  const requestResetCamera = useCallback(() => {
    requestCameraFitTo(resetCameraTarget);
  }, [requestCameraFitTo, resetCameraTarget]);

  const scheduleResetCameraRefit = useCallback(() => {
    if (resizeRecenterTimeoutRef.current) {
      clearTimeout(resizeRecenterTimeoutRef.current);
    }
    resizeRecenterTimeoutRef.current = setTimeout(() => {
      resizeRecenterTimeoutRef.current = null;
      requestResetCamera();
    }, RESIZE_RECENTER_DELAY_MS);
  }, [requestResetCamera]);

  useEffect(() => {
    const cleanup = onMapResetCamera(requestResetCamera);
    return cleanup;
  }, [requestResetCamera]);

  useEffect(() => {
    const wasResizing = previousIsResizingRef.current;
    previousIsResizingRef.current = isResizing;
    if (!mapReady) return;
    // Fire when resize lifecycle finishes, even if observer size did not change.
    if (!wasResizing || isResizing) return;

    scheduleResetCameraRefit();
  }, [isResizing, mapReady, scheduleResetCameraRefit]);

  useEffect(() => {
    if (!containerSize || !mapReady) return;

    const previous = previousContainerSizeRef.current;
    previousContainerSizeRef.current = containerSize;

    // Skip first measurement: this is initial mount, not a user resize.
    if (!previous) return;

    const sizeChanged =
      previous.width !== containerSize.width ||
      previous.height !== containerSize.height;
    if (!sizeChanged) return;

    // Run the same camera-fit flow as the reset button after resize settles.
    scheduleResetCameraRefit();
  }, [containerSize, mapReady, scheduleResetCameraRefit]);

  useEffect(() => {
    if (!mapReady || !containerSize) return;
    if (hasRunInitialReadyFitRef.current) return;
    hasRunInitialReadyFitRef.current = true;

    // After first idle on this mount, run one fit with final measured size.
    scheduleResetCameraRefit();
  }, [mapReady, containerSize, scheduleResetCameraRefit]);

  useEffect(() => {
    return () => {
      if (resizeRecenterTimeoutRef.current) {
        clearTimeout(resizeRecenterTimeoutRef.current);
        resizeRecenterTimeoutRef.current = null;
      }
    };
  }, []);

  const isAtResetCamera = isViewAtResetCamera(viewState, resetCameraTarget);

  useEffect(() => {
    dispatchMapCameraResetState({ isAtResetCamera });
  }, [isAtResetCamera]);

  useEffect(() => {
    const cleanup = onMapScreenshotCaptureState(event => {
      setIsScreenshotCapturing(Boolean(event.detail?.isCapturing));
    });
    return cleanup;
  }, []);

  return { isAtResetCamera, isScreenshotCapturing };
};
