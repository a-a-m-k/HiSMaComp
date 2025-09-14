export interface LatLngTuple {
  latitude: number;
  longitude: number;
}
/**
 * How we store population data for towns
 * Keys are years (800, 1000, etc.) with population numbers
 *
 * Example:
 * {
 *   "800": 25000,   // Population in year 800
 *   "1000": 20000,  // Population in year 1000
 *   "1200": 110000  // Population in year 1200
 * }
 */
interface TownPopulation {
  [year: string]: number | null;
}

export interface SpacingValue {
  value: number;
  unit: string;
}

export interface PopulationStats {
  total: number;
  min: number;
  max: number;
  average: number;
  median: number;
}

export interface PerformanceMemory {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

export interface Town {
  name: string;
  nameVariants?: string[];
  latitude: number;
  longitude: number;
  populationByYear: TownPopulation;
}

export type TownCollection = Town[];
