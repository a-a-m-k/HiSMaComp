import { describe, expect, it } from "vitest";

import {
  createCameraResetTarget,
  isViewAtResetCamera,
} from "@/components/map/MapView/cameraReset";

describe("cameraReset helpers", () => {
  it("clamps reset zoom to effective min zoom", () => {
    expect(createCameraResetTarget(10, 20, 3, 5)).toEqual({
      longitude: 10,
      latitude: 20,
      zoom: 5,
    });
  });

  it("returns true when view is within reset tolerance", () => {
    const reset = createCameraResetTarget(10, 20, 5, 4);
    expect(
      isViewAtResetCamera(
        {
          longitude: 10.00005,
          latitude: 19.99995,
          zoom: 5.0005,
        },
        reset
      )
    ).toBe(true);
  });

  it("returns false when view is outside reset tolerance", () => {
    const reset = createCameraResetTarget(10, 20, 5, 4);
    expect(
      isViewAtResetCamera(
        {
          longitude: 10.001,
          latitude: 20,
          zoom: 5,
        },
        reset
      )
    ).toBe(false);
  });
});
