import React, { useMemo, useState, useCallback } from "react";
import { Town } from "@/common/types";
import { useMarkerKeyboardNavigation } from "@/hooks/map";
import { disableTownMarkerFocus, getStableTownMarkerId } from "@/utils/markers";
import { TownMarkerItem } from "./TownMarkerItem";

interface TownMarkersProps {
  towns: Town[];
  selectedYear: number;
}

/**
 * Renders keyboard-navigable town markers using MapLibre Marker component.
 * Markers are focusable on click and navigable via arrow keys.
 * Uses geographic coordinates directly - MapLibre handles coordinate transformation automatically.
 *
 * Performance: Renders all markers (no virtualization). For very large town lists (e.g. hundreds+),
 * consider clustering or virtualizing; current history dataset size is acceptable.
 */
export const TownMarkers: React.FC<TownMarkersProps> = ({
  towns,
  selectedYear,
}) => {
  const [focusedMarkerId, setFocusedMarkerId] = useState<string | null>(null);

  const sortedTowns = useMemo(() => {
    return towns
      .filter(town => {
        const population = town.populationByYear?.[selectedYear];
        return (
          typeof population === "number" &&
          Number.isFinite(population) &&
          population > 0
        );
      })
      .sort((a, b) => {
        const aPop = a.populationByYear?.[selectedYear] || 0;
        const bPop = b.populationByYear?.[selectedYear] || 0;
        return bPop - aPop;
      });
  }, [towns, selectedYear]);

  const handleFocus = useCallback((markerId: string) => {
    setFocusedMarkerId(markerId);
  }, []);

  const handleMarkerKeyDown = useMarkerKeyboardNavigation(handleFocus);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    setFocusedMarkerId(null);
    const target = e.currentTarget as HTMLElement;
    if (target) {
      disableTownMarkerFocus(target);
    }
  }, []);

  if (sortedTowns.length === 0) return null;

  return (
    <>
      {sortedTowns.map(town => {
        const markerId = `marker-${getStableTownMarkerId(town)}`;
        const isFocused = focusedMarkerId === markerId;

        return (
          <React.Fragment key={markerId}>
            <TownMarkerItem
              town={town}
              markerId={markerId}
              isFocused={isFocused}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleMarkerKeyDown}
              selectedYear={selectedYear}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
