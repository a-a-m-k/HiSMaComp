export interface LatLngTuple {
  latitude: number;
  longitude: number;
}
interface TownPopulation {
  [century: string]: number | null;
}

export interface Town {
  name: string;
  nameVariants?: string[];
  latitude: number;
  longitude: number;
  populationByCentury: TownPopulation;
}

export type TownCollection = Town[];
