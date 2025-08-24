export interface LatLngTuple {
  latitude: number;
  longitude: number;
}
interface TownPopulation {
  [century: string]: number | null;
}

export interface SpacingValue {
  value: number;
  unit: string;
}

export interface Town {
  name: string;
  nameVariants?: string[];
  latitude: number;
  longitude: number;
  populationByCentury: TownPopulation;
}

export type TownCollection = Town[];
