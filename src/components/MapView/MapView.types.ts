import { Town, LatLngTuple } from "@/common/types";

export interface MapContainerProps {
  center?: LatLngTuple;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: [LatLngTuple, LatLngTuple];
  maxBoundsViscosity?: number;
}
export interface MapViewProps {
  initialPosition: { longitude: number; latitude: number };
  towns: Town[];
  selectedYear: number;
  mapContainerProps?: MapContainerProps;
  initialZoom: number;
}
