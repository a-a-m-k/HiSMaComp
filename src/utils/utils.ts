/**
 * Barrel re-exports for backward compatibility.
 * Implementation lives in geo, mapZoom, and geojson modules.
 */
export type { Bounds, Center } from "./geo";
export {
  getBounds,
  calculateAverageCenter,
  calculateBoundsCenter,
} from "./geo";

export type { MapArea } from "./mapZoom";
export {
  calculateOptimalPadding,
  calculateFitZoom,
  calculateMapArea,
  calculateResponsiveZoom,
} from "./mapZoom";

export { townsToGeoJSON, filterTownsByYear } from "./geojson";
