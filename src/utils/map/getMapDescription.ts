/**
 * Returns the screen-reader description for the map area.
 * Used by MapView for aria-describedby content so the text stays in one place.
 */
export function getMapDescription(options: {
  isMobile: boolean;
  isDesktop: boolean;
}): string {
  const { isMobile, isDesktop } = options;
  const controls = [
    "Timeline",
    ...(!isMobile ? ["Save button"] : []),
    ...(isDesktop ? ["Zoom controls"] : []),
    "map area",
    "town markers",
  ].join(", ");

  let text = `Interactive map displaying European towns and their populations. Use Tab to navigate controls: ${controls}. Click on the map or press Tab to focus the map area, then use arrow keys to pan. When a town marker is focused, use arrow keys to navigate between markers.`;
  if (!isMobile) {
    text += " Press Ctrl+S or Cmd+S to save the map as an image.";
  }
  if (isDesktop) {
    text +=
      " Press Ctrl+Plus or Cmd+Plus to zoom in, and Ctrl+Minus or Cmd+Minus to zoom out.";
  } else {
    text += " On tablets, use pinch-to-zoom gestures to zoom.";
  }
  text += " Town markers are color-coded by population size.";
  return text;
}
