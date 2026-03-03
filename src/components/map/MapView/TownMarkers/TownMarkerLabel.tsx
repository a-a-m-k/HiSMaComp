import React from "react";
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
 * Component that displays a label for a focused town marker.
 * Shows town name and population information.
 */
export const TownMarkerLabel: React.FC<TownMarkerLabelProps> = ({
  townName,
  population,
  markerSize,
}) => {
  return (
    <div style={getTownMarkerLabelContainerStyles(markerSize)}>
      <div style={getTownMarkerLabelContentStyles()}>
        <div>{townName}</div>
        <div style={getTownMarkerLabelPopulationStyles()}>
          {population > 0 ? population.toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
};
