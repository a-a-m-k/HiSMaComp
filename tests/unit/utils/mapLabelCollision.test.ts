import { describe, it, expect, vi } from "vitest";

import { hideBasemapWaterLabelsForSplitOverlay } from "@/utils/map/mapLabelCollision";

describe("mapLabelCollision", () => {
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
