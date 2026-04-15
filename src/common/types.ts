export interface LatLngTuple {
  latitude: number;
  longitude: number;
}
interface TownPopulation {
  [year: string]: number | null;
}

export interface PerformanceMemory {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

export interface LayerItem {
  layer: string;
  color: string;
  /** Legend: render in a separate band below population bands (divider above). */
  variant?: "noData";
}

export interface TimelineMark {
  value: number;
  label: string;
}

export interface Town {
  name: string;
  nameVariants?: string[];
  latitude: number;
  longitude: number;
  populationByYear: TownPopulation;
}
