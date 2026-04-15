import React from "react";
import { useMapStyleMode } from "@/context/MapStyleContext";
import {
  getTownMarkerLabelContainerStyles,
  getTownMarkerLabelContentStyles,
  getTownMarkerLabelPopulationStyles,
} from "./TownMarker.styles";

export interface TownMarkerLabelProps {
  townName: string;
  population: number;
  markerSize: number;
}

/**
 * Component that displays a label for a focused/hovered town marker.
 * Shows town name and population information.
 */
export const TownMarkerLabel: React.FC<TownMarkerLabelProps> = ({
  townName,
  population,
  markerSize,
}) => {
  const { mode: mapStyleMode } = useMapStyleMode();

  return (
    <div style={getTownMarkerLabelContainerStyles(markerSize)}>
      <div style={getTownMarkerLabelContentStyles(mapStyleMode)}>
        <div>{townName}</div>
        <div style={getTownMarkerLabelPopulationStyles()}>
          {population > 0 ? population.toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
};
