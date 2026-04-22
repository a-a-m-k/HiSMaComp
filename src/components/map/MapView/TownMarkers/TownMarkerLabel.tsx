import React from "react";
import { useMapStyleMode } from "@/context/MapStyleContext";
import { MARKER_STYLES } from "@/constants/keyboard";

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
  const labelCssVars = {
    "--town-marker-label-top": `${markerSize / 2 + MARKER_STYLES.LABEL_OFFSET}px`,
  } as React.CSSProperties;

  return (
    <div className="town-marker-label-container" style={labelCssVars}>
      <div
        className={
          mapStyleMode === "dark"
            ? "town-marker-label-content town-marker-label-content--dark"
            : "town-marker-label-content"
        }
      >
        <div>{townName}</div>
        <div className="town-marker-label-population">
          {population > 0 ? population.toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
};
