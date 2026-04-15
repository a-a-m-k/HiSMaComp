import {
  MAP_CAMERA_RESET_STATE_EVENT,
  MAP_RESET_CAMERA_EVENT,
  MAP_SCREENSHOT_CAPTURE_STATE_EVENT,
} from "@/constants/map";

export type MapCameraResetStateDetail = {
  isAtResetCamera: boolean;
};

export type MapScreenshotCaptureStateDetail = {
  isCapturing: boolean;
};

type CustomEventListener<TDetail> = (event: CustomEvent<TDetail>) => void;

const toEventListener = <TDetail>(
  listener: CustomEventListener<TDetail>
): EventListener => listener as EventListener;

export const dispatchMapResetCamera = () => {
  window.dispatchEvent(new Event(MAP_RESET_CAMERA_EVENT));
};

export const onMapResetCamera = (
  listener: EventListener,
  options?: AddEventListenerOptions
) => {
  window.addEventListener(MAP_RESET_CAMERA_EVENT, listener, options);
  return () =>
    window.removeEventListener(MAP_RESET_CAMERA_EVENT, listener, options);
};

export const dispatchMapCameraResetState = (
  detail: MapCameraResetStateDetail
) => {
  window.dispatchEvent(
    new CustomEvent<MapCameraResetStateDetail>(MAP_CAMERA_RESET_STATE_EVENT, {
      detail,
    })
  );
};

export const onMapCameraResetState = (
  listener: CustomEventListener<MapCameraResetStateDetail>,
  options?: AddEventListenerOptions
) => {
  const typedListener = toEventListener(listener);
  window.addEventListener(MAP_CAMERA_RESET_STATE_EVENT, typedListener, options);
  return () =>
    window.removeEventListener(
      MAP_CAMERA_RESET_STATE_EVENT,
      typedListener,
      options
    );
};

export const dispatchMapScreenshotCaptureState = (
  detail: MapScreenshotCaptureStateDetail
) => {
  window.dispatchEvent(
    new CustomEvent<MapScreenshotCaptureStateDetail>(
      MAP_SCREENSHOT_CAPTURE_STATE_EVENT,
      {
        detail,
      }
    )
  );
};

export const onMapScreenshotCaptureState = (
  listener: CustomEventListener<MapScreenshotCaptureStateDetail>,
  options?: AddEventListenerOptions
) => {
  const typedListener = toEventListener(listener);
  window.addEventListener(
    MAP_SCREENSHOT_CAPTURE_STATE_EVENT,
    typedListener,
    options
  );
  return () =>
    window.removeEventListener(
      MAP_SCREENSHOT_CAPTURE_STATE_EVENT,
      typedListener,
      options
    );
};
