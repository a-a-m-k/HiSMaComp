import { MAP_BASEMAP_WATER_LABEL_LAYER_IDS } from "@/constants/map";

/** Minimal MapLibre map surface for imperative label collision helpers (unit-test friendly). */
export type MapLabelCollisionMap = {
  getLayer: (id: string) => unknown;
  moveLayer: (id: string, beforeId?: string) => void;
  setLayoutProperty: (layerId: string, name: string, value: unknown) => void;
};

/**
 * Moves the GeoJSON town symbol text layer to the end of the style stack so it places first
 * and wins cross-layer collision vs basemap water labels (light / single-map mode).
 */
export function bumpTownTextLayerToTop(
  map: MapLabelCollisionMap,
  layerId: string
): void {
  const textLayerId = `${layerId}-text`;
  try {
    if (map.getLayer(textLayerId)) map.moveLayer(textLayerId);
  } catch {
    /* ignore missing layer / style race */
  }
}

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
