import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { Marker } from "react-map-gl/maplibre";
import { Town } from "@/common/types";
import {
  calculateMarkerDiameter,
  calculateMarkerColor,
  generateTownMarkerAriaLabel,
  enableTownMarkerFocus,
} from "@/utils/markers";
import { useMapStyleMode } from "@/context/MapStyleContext";
import {
  getTownMarkerContainerStyles,
  getTownMarkerStyles,
} from "./TownMarker.styles";
import { TownMarkerLabel } from "./TownMarkerLabel";

export interface TownMarkerItemProps {
  town: Town;
  markerId: string;
  isFocused: boolean;
  onFocus: (markerId: string) => void;
  onBlur: (e: React.FocusEvent) => void;
  onKeyDown: (e: React.KeyboardEvent, markerId: string) => void;
  selectedYear: number;
}

/**
 * Individual town marker component.
 * Memoized for performance optimization with large marker sets.
 */
export const TownMarkerItem = React.memo<TownMarkerItemProps>(
  ({ town, markerId, isFocused, onFocus, onBlur, onKeyDown, selectedYear }) => {
    const { mode: mapStyleMode } = useMapStyleMode();
    const theme = useTheme();
    const yearKey = String(selectedYear);
    const rawPopulation = town.populationByYear?.[yearKey];
    const population = rawPopulation ?? 0;

    const markerProps = useMemo(
      () => ({
        size: calculateMarkerDiameter(rawPopulation),
        color: calculateMarkerColor(rawPopulation, mapStyleMode),
        ariaLabel: generateTownMarkerAriaLabel(town, selectedYear),
      }),
      [town, rawPopulation, selectedYear, mapStyleMode]
    );

    const markerStyles = useMemo(
      () =>
        getTownMarkerStyles({
          markerSize: markerProps.size,
          markerColor: markerProps.color,
          isFocused,
          isHovered: false,
          buttonOutlineColor: theme.custom.colors.buttonBackground,
        }),
      [
        markerProps.size,
        markerProps.color,
        isFocused,
        theme.custom.colors.buttonBackground,
      ]
    );

    const containerStyles = useMemo(
      () => getTownMarkerContainerStyles({ isFocused }),
      [isFocused]
    );

    return (
      <Marker
        longitude={town.longitude}
        latitude={town.latitude}
        anchor="center"
      >
        <div style={containerStyles}>
          <div
            tabIndex={-1}
            role="button"
            data-marker-id={markerId}
            style={markerStyles}
            aria-label={markerProps.ariaLabel}
            onFocus={e => {
              onFocus(markerId);
              enableTownMarkerFocus(e.currentTarget as HTMLElement);
            }}
            onBlur={onBlur}
            onKeyDown={e => onKeyDown(e, markerId)}
            onClick={e => {
              e.preventDefault();
              const target = e.currentTarget as HTMLElement;
              enableTownMarkerFocus(target);
              target.focus();
            }}
          />
          {isFocused && (
            <TownMarkerLabel
              townName={town.name}
              population={population}
              markerSize={markerProps.size}
            />
          )}
        </div>
      </Marker>
    );
  }
);

TownMarkerItem.displayName = "TownMarkerItem";
