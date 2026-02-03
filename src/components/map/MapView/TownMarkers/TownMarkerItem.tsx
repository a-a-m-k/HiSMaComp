import React, { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import { Town } from "@/common/types";
import { calculateMarkerDiameter, calculateMarkerColor } from "@/utils/markers";
import {
  generateTownMarkerAriaLabel,
  enableTownMarkerFocus,
} from "@/utils/markers";
import {
  getTownMarkerContainerStyles,
  getTownMarkerStyles,
} from "./TownMarker.styles";
import { TownMarkerLabel } from "./TownMarkerLabel";

export interface TownMarkerItemProps {
  town: Town;
  markerId: string;
  isFocused: boolean;
  isHovered: boolean;
  onFocus: (markerId: string) => void;
  onBlur: (e: React.FocusEvent) => void;
  onMouseEnter: (markerId: string) => void;
  onMouseLeave: () => void;
  onKeyDown: (e: React.KeyboardEvent, markerId: string) => void;
  selectedYear: number;
}

/**
 * Individual town marker component.
 * Memoized for performance optimization with large marker sets.
 */
export const TownMarkerItem = React.memo<TownMarkerItemProps>(
  ({
    town,
    markerId,
    isFocused,
    isHovered,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    selectedYear,
  }) => {
    const population = town.populationByYear?.[selectedYear] || 0;

    const markerProps = useMemo(
      () => ({
        size: calculateMarkerDiameter(population),
        color: calculateMarkerColor(population),
        ariaLabel: generateTownMarkerAriaLabel(town, selectedYear),
      }),
      [town, population, selectedYear]
    );

    const markerStyles = useMemo(
      () =>
        getTownMarkerStyles({
          markerSize: markerProps.size,
          markerColor: markerProps.color,
          isFocused,
          isHovered,
        }),
      [markerProps.size, markerProps.color, isFocused, isHovered]
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
            onMouseEnter={() => onMouseEnter(markerId)}
            onMouseLeave={onMouseLeave}
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
