import { MAP_BASEMAP_WATER_LABEL_LAYER_IDS } from "@/constants/map";

/** Minimal MapLibre map surface for imperative label collision helpers (unit-test friendly). */
export type MapLabelCollisionMap = {
  getLayer: (id: string) => unknown;
  setLayoutProperty: (layerId: string, name: string, value: unknown) => void;
};

/**
 * Hides basemap sea/ocean/lake name layers on the underlay map in split dark mode. Two stacked
 * maps do not share one collision grid, so this is a global hide (see `MAP_BASEMAP_WATER_LABEL_LAYER_IDS`).
 */
export function hideBasemapWaterLabelsForSplitOverlay(
  map: Pick<MapLabelCollisionMap, "getLayer" | "setLayoutProperty">
): void {
  for (const id of MAP_BASEMAP_WATER_LABEL_LAYER_IDS) {
    try {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", "none");
      }
    } catch {
      /* ignore missing layer / style race */
    }
  }
}
