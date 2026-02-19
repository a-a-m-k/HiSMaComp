import { describe, it, expect } from "vitest";
import {
  MIN_APP_VIEWPORT,
  APP_MIN_WIDTH,
  APP_MIN_HEIGHT,
  NARROW_LAYOUT_ENTER_PX,
  NARROW_LAYOUT_LEAVE_PX,
  RESIZE_DEBOUNCE_MS,
  getDeviceType,
} from "@/constants/breakpoints";

describe("breakpoints", () => {
  describe("MIN_APP_VIEWPORT and derived", () => {
    it("MIN_APP_VIEWPORT is 300x300", () => {
      expect(MIN_APP_VIEWPORT.width).toBe(300);
      expect(MIN_APP_VIEWPORT.height).toBe(300);
    });

    it("APP_MIN_WIDTH and APP_MIN_HEIGHT match MIN_APP_VIEWPORT", () => {
      expect(APP_MIN_WIDTH).toBe(MIN_APP_VIEWPORT.width);
      expect(APP_MIN_HEIGHT).toBe(MIN_APP_VIEWPORT.height);
    });
  });

  describe("narrow layout hysteresis", () => {
    it("NARROW_LAYOUT_ENTER_PX is 280 (MIN - 20)", () => {
      expect(NARROW_LAYOUT_ENTER_PX).toBe(280);
      expect(NARROW_LAYOUT_ENTER_PX).toBe(MIN_APP_VIEWPORT.width - 20);
    });

    it("NARROW_LAYOUT_LEAVE_PX is 300 (MIN_APP_VIEWPORT.width)", () => {
      expect(NARROW_LAYOUT_LEAVE_PX).toBe(300);
      expect(NARROW_LAYOUT_LEAVE_PX).toBe(MIN_APP_VIEWPORT.width);
    });

    it("enter threshold is below leave threshold for hysteresis band", () => {
      expect(NARROW_LAYOUT_ENTER_PX).toBeLessThan(NARROW_LAYOUT_LEAVE_PX);
    });
  });

  describe("RESIZE_DEBOUNCE_MS", () => {
    it("is a positive number", () => {
      expect(RESIZE_DEBOUNCE_MS).toBe(320);
      expect(RESIZE_DEBOUNCE_MS).toBeGreaterThan(0);
    });
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
