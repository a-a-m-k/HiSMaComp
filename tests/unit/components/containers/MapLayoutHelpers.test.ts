/**
 * Tests for MapLayoutHelpers: getInitialMapProps, getMapDeviceKey, useStableMapKey, formatCenturyLabel.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  getInitialMapProps,
  getMapDeviceKey,
  useStableMapKey,
  formatCenturyLabel,
  TIMELINE_MARKS,
} from "@/components/containers/MapLayoutHelpers";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAX_ZOOM_LEVEL } from "@/constants";

describe("formatCenturyLabel", () => {
  it("returns century label for known year", () => {
    expect(formatCenturyLabel(800)).toBe("9th ct.");
    expect(formatCenturyLabel(1000)).toBe("11th ct.");
    expect(formatCenturyLabel(1200)).toBe("13th ct.");
  });

  it("returns year string when century not in map", () => {
    const result = formatCenturyLabel(9999);
    expect(result).toBe("9999");
  });

  it("edge: negative year returns string", () => {
    expect(formatCenturyLabel(-500)).toBe("-500");
  });

  it("edge: zero year returns string", () => {
    expect(formatCenturyLabel(0)).toBe("0");
  });
});

describe("TIMELINE_MARKS", () => {
  it("has value and label for each mark", () => {
    expect(TIMELINE_MARKS.length).toBeGreaterThan(0);
    TIMELINE_MARKS.forEach(mark => {
      expect(typeof mark.value).toBe("number");
      expect(typeof mark.label).toBe("string");
    });
  });
});

describe("getInitialMapProps", () => {
  const validState = {
    center: { latitude: 50, longitude: 10 },
    fitZoom: 5,
  };

  it("returns default when showDefaultMap is true", () => {
    const result = getInitialMapProps(true, false, validState);
    expect(result.initialPosition).toEqual(DEFAULT_CENTER);
    expect(result.initialZoom).toBe(DEFAULT_ZOOM);
  });

  it("returns default when isLoading is true", () => {
    const result = getInitialMapProps(false, true, validState);
    expect(result.initialPosition).toEqual(DEFAULT_CENTER);
    expect(result.initialZoom).toBe(DEFAULT_ZOOM);
  });

  it("returns default when center is undefined", () => {
    const result = getInitialMapProps(false, false, {
      center: undefined,
      fitZoom: 5,
    });
    expect(result.initialPosition).toEqual(DEFAULT_CENTER);
    expect(result.initialZoom).toBe(DEFAULT_ZOOM);
  });

  it("returns initial state when valid center and zoom", () => {
    const result = getInitialMapProps(false, false, validState);
    expect(result.initialPosition).toEqual({ latitude: 50, longitude: 10 });
    expect(result.initialZoom).toBe(5);
  });

  it("returns default for invalid center (NaN)", () => {
    const result = getInitialMapProps(false, false, {
      center: { latitude: NaN, longitude: 10 },
      fitZoom: 5,
    });
    expect(result.initialPosition).toEqual(DEFAULT_CENTER);
    expect(result.initialZoom).toBe(DEFAULT_ZOOM);
  });

  it("returns default for invalid zoom (negative)", () => {
    const result = getInitialMapProps(false, false, {
      center: validState.center,
      fitZoom: -1,
    });
    expect(result.initialPosition).toEqual(DEFAULT_CENTER);
    expect(result.initialZoom).toBe(DEFAULT_ZOOM);
  });

  it("edge: zoom 0 is valid (boundary, fitZoom >= 0)", () => {
    const result = getInitialMapProps(false, false, {
      center: validState.center,
      fitZoom: 0,
    });
    expect(result.initialPosition).toEqual(validState.center);
    expect(result.initialZoom).toBe(0);
  });

  it("edge: zoom at MAX_ZOOM_LEVEL is valid", () => {
    const result = getInitialMapProps(false, false, {
      center: validState.center,
      fitZoom: MAX_ZOOM_LEVEL,
    });
    expect(result.initialZoom).toBe(MAX_ZOOM_LEVEL);
    expect(result.initialPosition).toEqual(validState.center);
  });

  it("edge: center at south pole (-90) is valid", () => {
    const result = getInitialMapProps(false, false, {
      center: { latitude: -90, longitude: 0 },
      fitZoom: 3,
    });
    expect(result.initialPosition).toEqual({ latitude: -90, longitude: 0 });
    expect(result.initialZoom).toBe(3);
  });

  it("edge: center at north pole (90) is valid", () => {
    const result = getInitialMapProps(false, false, {
      center: { latitude: 90, longitude: 0 },
      fitZoom: 3,
    });
    expect(result.initialPosition).toEqual({ latitude: 90, longitude: 0 });
  });
});

describe("getMapDeviceKey", () => {
  it("returns 'mobile' when isMobile", () => {
    expect(getMapDeviceKey({ isMobile: true, isTablet: false })).toBe("mobile");
  });

  it("returns 'tablet' when isTablet", () => {
    expect(getMapDeviceKey({ isMobile: false, isTablet: true })).toBe("tablet");
  });

  it("returns 'desktop' when neither mobile nor tablet", () => {
    expect(getMapDeviceKey({ isMobile: false, isTablet: false })).toBe(
      "desktop"
    );
  });

  it("edge: isMobile true takes precedence when both isMobile and isTablet true", () => {
    expect(getMapDeviceKey({ isMobile: true, isTablet: true })).toBe("mobile");
  });
});

describe("useStableMapKey", () => {
  it("returns device key when not below min viewport", () => {
    const { result } = renderHook(() =>
      useStableMapKey({
        isMobile: true,
        isTablet: false,
        isBelowMinViewport: false,
      })
    );
    expect(result.current).toBe("mobile");
  });

  it("returns last key when below min viewport", () => {
    const { result, rerender } = renderHook(
      (viewport: {
        isMobile: boolean;
        isTablet: boolean;
        isBelowMinViewport: boolean;
      }) => useStableMapKey(viewport),
      {
        initialProps: {
          isMobile: false,
          isTablet: false,
          isBelowMinViewport: false,
        },
      }
    );
    expect(result.current).toBe("desktop");

    rerender({
      isMobile: false,
      isTablet: false,
      isBelowMinViewport: true,
    });
    expect(result.current).toBe("desktop");
  });

  it("updates key when viewport goes back above min", () => {
    const { result, rerender } = renderHook(
      (viewport: {
        isMobile: boolean;
        isTablet: boolean;
        isBelowMinViewport: boolean;
      }) => useStableMapKey(viewport),
      {
        initialProps: {
          isMobile: false,
          isTablet: true,
          isBelowMinViewport: false,
        },
      }
    );
    expect(result.current).toBe("tablet");

    rerender({
      isMobile: true,
      isTablet: false,
      isBelowMinViewport: false,
    });
    expect(result.current).toBe("mobile");
  });

  it("edge: when initially below min viewport, key is still a valid device string", () => {
    const { result } = renderHook(() =>
      useStableMapKey({
        isMobile: false,
        isTablet: false,
        isBelowMinViewport: true,
      })
    );
    expect(["mobile", "tablet", "desktop"]).toContain(result.current);
  });
});
