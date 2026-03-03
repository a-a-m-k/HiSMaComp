import { describe, it, expect } from "vitest";
import {
  MIN_APP_VIEWPORT,
  NARROW_LAYOUT_ENTER_PX,
  NARROW_LAYOUT_LEAVE_PX,
  getDeviceType,
} from "@/constants/breakpoints";

describe("breakpoints", () => {
  it("narrow layout hysteresis: enter < leave so we don’t flicker at boundary", () => {
    expect(NARROW_LAYOUT_ENTER_PX).toBe(MIN_APP_VIEWPORT.width - 20);
    expect(NARROW_LAYOUT_LEAVE_PX).toBe(MIN_APP_VIEWPORT.width);
    expect(NARROW_LAYOUT_ENTER_PX).toBeLessThan(NARROW_LAYOUT_LEAVE_PX);
  });

  describe("getDeviceType", () => {
    it("returns mobile for width < 600", () => {
      expect(getDeviceType(400)).toBe("mobile");
      expect(getDeviceType(599)).toBe("mobile");
    });

    it("returns tablet for 600 <= width < 900", () => {
      expect(getDeviceType(600)).toBe("tablet");
      expect(getDeviceType(800)).toBe("tablet");
      expect(getDeviceType(899)).toBe("tablet");
    });

    it("returns desktop for 900 <= width < 1536", () => {
      expect(getDeviceType(900)).toBe("desktop");
      expect(getDeviceType(1200)).toBe("desktop");
      expect(getDeviceType(1535)).toBe("desktop");
    });

    it("returns largeDesktop for width >= 1536", () => {
      expect(getDeviceType(1536)).toBe("largeDesktop");
      expect(getDeviceType(1920)).toBe("largeDesktop");
    });
  });
});
