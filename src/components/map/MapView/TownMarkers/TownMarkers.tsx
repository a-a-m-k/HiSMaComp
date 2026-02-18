import React, { useMemo, useState, useCallback } from "react";
import { Town } from "@/common/types";
import { useMarkerKeyboardNavigation } from "@/hooks/map";
import { disableTownMarkerFocus } from "@/utils/markers";
import { TownMarkerItem } from "./TownMarkerItem";

interface TownMarkersProps {
  towns: Town[];
  selectedYear: number;
}

/**
 * Renders keyboard-navigable town markers using MapLibre Marker component.
 * Markers are focusable on click and navigable via arrow keys.
 * Uses geographic coordinates directly - MapLibre handles coordinate transformation automatically.
 */
export const TownMarkers: React.FC<TownMarkersProps> = ({
  towns,
  selectedYear,
}) => {
  const [focusedMarkerId, setFocusedMarkerId] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  const sortedTowns = useMemo(() => {
    return [...towns].sort((a, b) => {
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

  const handleMouseEnter = useCallback(
    (markerId: string) => {
      if (focusedMarkerId !== markerId) {
        setHoveredMarkerId(markerId);
      }
    },
    [focusedMarkerId]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredMarkerId(null);
  }, []);

  if (sortedTowns.length === 0) return null;

  return (
    <>
      {sortedTowns.map((town, index) => {
        const markerId = `marker-${town.name}-${index}`;
        const isFocused = focusedMarkerId === markerId;
        const isHovered = hoveredMarkerId === markerId && !isFocused;

        return (
          <React.Fragment key={markerId}>
            <TownMarkerItem
              town={town}
              markerId={markerId}
              isFocused={isFocused}
              isHovered={isHovered}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onKeyDown={handleMarkerKeyDown}
              selectedYear={selectedYear}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
