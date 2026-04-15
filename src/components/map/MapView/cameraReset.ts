export const RESET_CENTER_EPSILON = 1e-4;
export const RESET_ZOOM_EPSILON = 1e-3;
export const RESIZE_RECENTER_DELAY_MS = 120;

export type CameraResetTarget = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export const createCameraResetTarget = (
  longitude: number,
  latitude: number,
  zoom: number,
  effectiveMinZoom: number
): CameraResetTarget => ({
  longitude,
  latitude,
  zoom: Math.max(zoom, effectiveMinZoom),
});

export const isViewAtResetCamera = (
  viewState: CameraResetTarget,
  resetTarget: CameraResetTarget
) =>
  Math.abs(viewState.longitude - resetTarget.longitude) <=
    RESET_CENTER_EPSILON &&
  Math.abs(viewState.latitude - resetTarget.latitude) <= RESET_CENTER_EPSILON &&
  Math.abs(viewState.zoom - resetTarget.zoom) <= RESET_ZOOM_EPSILON;
