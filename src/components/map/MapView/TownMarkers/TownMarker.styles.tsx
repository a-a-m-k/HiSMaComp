import { CSSProperties } from "react";
import { MARKER_STYLES } from "@/constants/keyboard";
import { Z_INDEX, BORDER_RADIUS, COLORS } from "@/constants/ui";

/**
 * Type definitions for town marker style options
 */
export interface TownMarkerStyleOptions {
  markerSize: number;
  markerColor: string;
  isFocused: boolean;
  isHovered: boolean;
}

export interface TownMarkerContainerStyleOptions {
  isFocused: boolean;
}

/**
 * Generates styles for the town marker container div.
 */
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

/**
 * Generates styles for the town marker button element.
 */
export const getTownMarkerStyles = (
  options: TownMarkerStyleOptions
): CSSProperties => {
  const { markerSize, markerColor, isFocused, isHovered } = options;

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
      ? `${MARKER_STYLES.BORDER_WIDTH}px solid ${COLORS.BUTTON_BACKGROUND}`
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

/**
 * Generates styles for the town marker label container.
 */
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
 * Generates styles for the town marker label content box.
 * Uses rgba for opacity (better browser support than hex alpha).
 */
export const getTownMarkerLabelContentStyles = (): CSSProperties => {
  const white90 = "rgba(255, 255, 255, 0.9)";
  const white80 = "rgba(255, 255, 255, 0.8)";

  return {
    backgroundColor: white90,
    padding: "2px 6px",
    borderRadius: `${BORDER_RADIUS.CONTROL}px`,
    fontSize: "10px",
    fontWeight: 500,
    color: "#222222",
    textShadow: `0 1px 2px ${white80}`,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
    lineHeight: 1.2,
  };
};

/**
 * Generates styles for the town marker label population text.
 */
export const getTownMarkerLabelPopulationStyles = (): CSSProperties => ({
  fontSize: "8px",
  opacity: 0.8,
  marginTop: "1px",
});
