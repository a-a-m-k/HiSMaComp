import { CSSProperties } from "react";
import { MARKER_STYLES } from "@/constants/keyboard";
import { Z_INDEX, BORDER_RADIUS } from "@/constants/ui";
import {
  MAP_FOCUS_LABEL_CHIP_BG_DARK,
  MAP_FOCUS_LABEL_TEXT_DARK,
  MAP_GEO_LABEL_TEXT_LIGHT,
} from "@/theme/mapTokens";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

/** Props for computing inline styles on the marker hit target. */
export interface TownMarkerStyleOptions {
  markerSize: number;
  markerColor: string;
  isFocused: boolean;
  isHovered: boolean;
  /** Focus ring color (from theme). */
  buttonOutlineColor: string;
}

export interface TownMarkerContainerStyleOptions {
  isFocused: boolean;
}

/** Styles for the absolutely positioned wrapper around a marker. */
export const getTownMarkerContainerStyles = (
  options: TownMarkerContainerStyleOptions
): CSSProperties => ({
  position: "relative",
  width: 0,
  height: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: options.isFocused ? Z_INDEX.FOCUSED_MARKER : 1,
});

/** Styles for the circular marker element (population dot). */
export const getTownMarkerStyles = (
  options: TownMarkerStyleOptions
): CSSProperties => {
  const { markerSize, markerColor, isFocused, isHovered, buttonOutlineColor } =
    options;

  const transform = isFocused
    ? `scale(${MARKER_STYLES.FOCUSED_SCALE})`
    : isHovered
      ? `scale(${MARKER_STYLES.HOVERED_SCALE})`
      : "none";

  const boxShadow = isFocused
    ? `0 0 0 ${MARKER_STYLES.BORDER_WIDTH}px ${markerColor}, 0 0 0 ${MARKER_STYLES.BORDER_WIDTH * 2}px ${markerColor}80`
    : "none";

  return {
    width: `${markerSize}px`,
    height: `${markerSize}px`,
    aspectRatio: "1",
    minWidth: `${MARKER_STYLES.MIN_SIZE}px`,
    minHeight: `${MARKER_STYLES.MIN_SIZE}px`,
    transform: transform !== "none" ? transform : undefined,
    transformOrigin: "center center",
    background: isFocused ? markerColor : "transparent",
    border: isFocused
      ? `${MARKER_STYLES.BORDER_WIDTH}px solid ${buttonOutlineColor}`
      : "none",
    borderRadius: "50%",
    cursor: "pointer",
    padding: 0,
    margin: 0,
    pointerEvents: "auto",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    fontSize: "inherit",
    display: "block",
    flexShrink: 0,
    WebkitTapHighlightColor: "transparent",
    boxShadow,
    position: "relative",
    zIndex: isFocused ? Z_INDEX.FOCUSED_MARKER : 1,
  };
};

/** Positions the focused marker’s name label below the dot. */
export const getTownMarkerLabelContainerStyles = (
  markerSize: number
): CSSProperties => ({
  position: "absolute",
  top: `${markerSize / 2 + MARKER_STYLES.LABEL_OFFSET}px`,
  left: "50%",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  zIndex: Z_INDEX.FOCUSED_MARKER_LABEL,
  textAlign: "center",
});

/**
 * Styles for the focused marker name / population chip.
 * @param mapStyleMode - Basemap mode; drives light vs dark chip colors from `mapTokens`.
 */
export const getTownMarkerLabelContentStyles = (
  mapStyleMode: MapBaseStyleMode = "light"
): CSSProperties => {
  const white90 = "rgba(255, 255, 255, 0.9)";
  const white80 = "rgba(255, 255, 255, 0.8)";

  const textShadow = mapStyleMode === "dark" ? "none" : `0 1px 2px ${white80}`;

  return {
    backgroundColor:
      mapStyleMode === "dark" ? MAP_FOCUS_LABEL_CHIP_BG_DARK : white90,
    padding: "2px 6px",
    borderRadius: `${BORDER_RADIUS.CONTROL}px`,
    fontSize: "10px",
    fontWeight: 500,
    color:
      mapStyleMode === "dark"
        ? MAP_FOCUS_LABEL_TEXT_DARK
        : MAP_GEO_LABEL_TEXT_LIGHT,
    textShadow,
    boxShadow:
      mapStyleMode === "dark"
        ? "0 1px 2px rgba(0, 0, 0, 0.35)"
        : "0 1px 3px rgba(0, 0, 0, 0.2)",
    lineHeight: 1.2,
    ...(mapStyleMode === "dark"
      ? {
          WebkitFontSmoothing: "subpixel-antialiased",
          textRendering: "geometricPrecision",
        }
      : {}),
  };
};

/** Smaller line for population under the town name on the focused chip. */
export const getTownMarkerLabelPopulationStyles = (): CSSProperties => ({
  fontSize: "8px",
  opacity: 0.8,
  marginTop: "1px",
});
