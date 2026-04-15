import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

export interface MapViewport {
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface UseMapViewStateProps {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

/** Target camera for fit-to-view animation (e.g. after resize); same shape as MapViewState. */
export type CameraFitTarget = MapViewState;

interface UseMapViewStateReturn {
  viewState: MapViewState;
  handleMove: (evt: { viewState: MapViewState }) => void;
  cameraFitTarget: CameraFitTarget | null;
  onCameraFitComplete: () => void;
  syncViewStateFromMap: (state: CameraFitTarget) => void;
  cameraFitTargetRefForSync: React.RefObject<CameraFitTarget | null>;
  /** Animate camera to target (same pipeline as resize refit). */
  requestCameraFitTo: (target: CameraFitTarget) => void;
}

/** MapLayout remounts on breakpoint change; here we only see same-device resize. We sync viewState to fit so we don't rely on the map's resize. */
export function useMapViewState({
  longitude,
  latitude,
  zoom,
}: UseMapViewStateProps): UseMapViewStateReturn {
  const fitTargetFromProps = useMemo(
    () => ({ longitude, latitude, zoom }),
    [longitude, latitude, zoom]
  );

  const [viewState, setViewState] = useState(fitTargetFromProps);
  const [cameraFitTarget, setCameraFitTarget] =
    useState<CameraFitTarget | null>(null);
  const cameraFitTargetRef = useRef<CameraFitTarget | null>(null);
  const cameraFitTargetRefForSync = useRef<CameraFitTarget | null>(null);
  cameraFitTargetRefForSync.current = cameraFitTarget;
  /** When fit animation ends, apply this target to viewState (avoids setState inside setState). */
  const pendingCameraFitTargetRef = useRef<CameraFitTarget | null>(null);

  useEffect(() => {
    setViewState(fitTargetFromProps);
  }, [fitTargetFromProps]);

  useEffect(() => {
    if (
      cameraFitTarget === null &&
      pendingCameraFitTargetRef.current !== null
    ) {
      const target = pendingCameraFitTargetRef.current;
      pendingCameraFitTargetRef.current = null;
      setViewState(target);
    }
  }, [cameraFitTarget]);

  const handleMove = useCallback((evt: { viewState: MapViewState }) => {
    setViewState(evt.viewState);
  }, []);

  const onCameraFitComplete = useCallback(() => {
    cameraFitTargetRef.current = null;
    setCameraFitTarget(prev => {
      if (prev) pendingCameraFitTargetRef.current = prev;
      return null;
    });
  }, []);

  const syncViewStateFromMap = useCallback((state: CameraFitTarget) => {
    setViewState(state);
  }, []);

  const requestCameraFitTo = useCallback((target: CameraFitTarget) => {
    setCameraFitTarget(target);
  }, []);

  return {
    viewState,
    handleMove,
    cameraFitTarget,
    onCameraFitComplete,
    syncViewStateFromMap,
    cameraFitTargetRefForSync,
    requestCameraFitTo,
  };
}
