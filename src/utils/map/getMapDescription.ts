import { strings } from "@/locales";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

export interface GetMapDescriptionOptions {
  isMobile: boolean;
  isDesktop: boolean;
  /** Basemap mode; affects spoken “grayscale” vs “full color” wording only. */
  mapStyleMode?: MapBaseStyleMode;
}

/**
 * Builds the screen-reader description string for the main map region (`aria-describedby`).
 * @param options - Layout flags and optional basemap mode.
 * @returns Full prose description including controls, pan/zoom hints, and save shortcut.
 */
export function getMapDescription(options: GetMapDescriptionOptions): string {
  const { isMobile, isDesktop, mapStyleMode = "light" } = options;
  const controls = [
    "Timeline",
    ...(isMobile ? ["Save button", "Reset view button"] : ["Save button"]),
    "Map style toggle",
    ...(isDesktop ? ["Zoom controls"] : []),
    "map area",
    "town markers",
  ].join(", ");

  let text = `Interactive map displaying European towns and their populations. Use Tab to navigate controls: ${controls}. The base map is ${mapStyleMode === "dark" ? "grayscale" : "full color"}. Click on the map or press Tab to focus the map area, then use arrow keys to pan. When a town marker is focused, use arrow keys to navigate between markers.`;
  text += " Press Ctrl+S or Cmd+S to save the map as an image.";
  if (isDesktop) {
    text += ` ${strings.map.descriptionShortcutZoomDesktop}`;
    text += ` ${strings.map.descriptionShortcutResetDesktop}`;
    text += ` ${strings.map.descriptionShortcutBasemapDesktop}`;
  } else {
    text += " On tablets, use pinch-to-zoom gestures to zoom.";
  }
  text += " Town markers are color-coded by population size.";
  return text;
}
