import { describe, expect, it, vi } from "vitest";

import {
  dispatchMapCameraResetState,
  dispatchMapResetCamera,
  dispatchMapScreenshotCaptureState,
  onMapCameraResetState,
  onMapResetCamera,
  onMapScreenshotCaptureState,
} from "@/utils/events/mapEvents";

describe("map event helpers", () => {
  it("subscribes and dispatches reset camera event", () => {
    const listener = vi.fn();
    const cleanup = onMapResetCamera(listener);

    dispatchMapResetCamera();
    expect(listener).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("subscribes and dispatches reset state detail", () => {
    const listener = vi.fn();
    const cleanup = onMapCameraResetState(listener);

    dispatchMapCameraResetState({ isAtResetCamera: true });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ isAtResetCamera: true });

    cleanup();
  });

  it("subscribes and dispatches screenshot capture detail", () => {
    const listener = vi.fn();
    const cleanup = onMapScreenshotCaptureState(listener);

    dispatchMapScreenshotCaptureState({ isCapturing: true });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ isCapturing: true });

    cleanup();
  });
});
