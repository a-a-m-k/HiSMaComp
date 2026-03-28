import { describe, it, expect, vi } from "vitest";

import {
  bumpTownTextLayerToTop,
  hideBasemapWaterLabelsForSplitOverlay,
} from "@/utils/map/mapLabelCollision";

describe("mapLabelCollision", () => {
  describe("bumpTownTextLayerToTop", () => {
    it("calls moveLayer when the text layer exists", () => {
      const moveLayer = vi.fn();
      const map = {
        getLayer: vi.fn((id: string) => (id === "towns-text" ? {} : null)),
        moveLayer,
        setLayoutProperty: vi.fn(),
      };
      bumpTownTextLayerToTop(map, "towns");
      expect(moveLayer).toHaveBeenCalledWith("towns-text");
    });

    it("does not call moveLayer when the text layer is missing", () => {
      const moveLayer = vi.fn();
      const map = {
        getLayer: vi.fn(() => null),
        moveLayer,
        setLayoutProperty: vi.fn(),
      };
      bumpTownTextLayerToTop(map, "towns");
      expect(moveLayer).not.toHaveBeenCalled();
    });

    it("swallows errors from getLayer/moveLayer", () => {
      const map = {
        getLayer: vi.fn(() => {
          throw new Error("style not ready");
        }),
        moveLayer: vi.fn(),
        setLayoutProperty: vi.fn(),
      };
      expect(() => bumpTownTextLayerToTop(map, "towns")).not.toThrow();
    });
  });

  describe("hideBasemapWaterLabelsForSplitOverlay", () => {
    it("sets visibility none on each water label layer that exists", () => {
      const setLayoutProperty = vi.fn();
      const map = {
        getLayer: vi.fn((id: string) =>
          id === "water-line-label" || id === "water-point-label" ? {} : null
        ),
        setLayoutProperty,
      };
      hideBasemapWaterLabelsForSplitOverlay(map);
      expect(setLayoutProperty).toHaveBeenCalledWith(
        "water-line-label",
        "visibility",
        "none"
      );
      expect(setLayoutProperty).toHaveBeenCalledWith(
        "water-point-label",
        "visibility",
        "none"
      );
    });

    it("skips setLayoutProperty when getLayer returns falsy", () => {
      const setLayoutProperty = vi.fn();
      const map = {
        getLayer: vi.fn(() => null),
        setLayoutProperty,
      };
      hideBasemapWaterLabelsForSplitOverlay(map);
      expect(setLayoutProperty).not.toHaveBeenCalled();
    });

    it("swallows errors from setLayoutProperty", () => {
      const map = {
        getLayer: vi.fn(() => ({})),
        setLayoutProperty: vi.fn(() => {
          throw new Error("race");
        }),
      };
      expect(() => hideBasemapWaterLabelsForSplitOverlay(map)).not.toThrow();
    });
  });
});
