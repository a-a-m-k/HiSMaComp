/**
 * Barrel re-exports for backward compatibility.
 * Implementation lives in geoBounds, mapZoom, and geojson modules.
 */
export type { Bounds, Center } from "./geoBounds";
export {
  getBounds,
  calculateAverageCenter,
  calculateBoundsCenter,
} from "./geoBounds";

export type { MapArea } from "./mapZoom";
export {
  calculateOptimalPadding,
  calculateFitZoom,
  calculateMapArea,
  calculateResponsiveZoom,
  getGeographicalBoxFromViewport,
} from "./mapZoom";

export { townsToGeoJSON, filterTownsByYear } from "./geojson";
