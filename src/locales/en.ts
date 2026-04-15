/** Default locale strings; centralised so i18n can be added later without touching components. */
export const en = {
  common: {
    tryAgain: "Try Again",
    reloadPage: "Reload Page",
    opensInNewTab: "Opens in new tab",
  },
  errors: {
    somethingWentWrong: "Something went wrong",
    unexpectedError: "Reload the page to try again.",
    dataLoadingError: "Data Loading Error",
    tryAgainReset: "Try again to reset error and continue",
    reloadPageRecover: "Reload page to recover from error",
    noTownsData: "No towns data available",
  },
  loading: {
    default: "Processing data...",
    resizingMap: "Resizing map...",
    switchingMapStyle: "Switching map style...",
    loadingHistoricalData: "Loading historical data...",
  },
  map: {
    ariaLabel:
      "Interactive historical map showing town populations. Click on the map or press Tab to focus, then use arrow keys to pan.",
    descriptionIntro:
      "Interactive map displaying European towns and their populations. Use Tab to navigate controls:",
    descriptionControlsTimeline: "Timeline",
    descriptionControlsSave: "Save button",
    descriptionControlsZoom: "Zoom controls",
    descriptionControlsMapArea: "map area",
    descriptionControlsTownMarkers: "town markers",
    descriptionTabFocus:
      "Click on the map or press Tab to focus the map area, then use arrow keys to pan.",
    descriptionMarkerFocus:
      "When a town marker is focused, use arrow keys to navigate between markers.",
    descriptionShortcutSave:
      "Press Ctrl+S or Cmd+S to save the map as an image.",
    descriptionShortcutZoomDesktop:
      "Press Ctrl+Plus or Cmd+Plus to zoom in, and Ctrl+Minus or Cmd+Minus to zoom out.",
    descriptionShortcutResetDesktop:
      "Press Shift+R to reset the map to its initial center and zoom.",
    descriptionShortcutBasemapDesktop:
      "Press Ctrl+Shift+N or Cmd+Shift+N to switch between full-color map and night (grayscale) map.",
    descriptionShortcutZoomTablet:
      "On tablets, use pinch-to-zoom gestures to zoom.",
    descriptionMarkersColor: "Town markers are color-coded by population size.",
    resetViewAria:
      "Reset map to initial center and zoom. Keyboard shortcut: Shift+R.",
    /** Hover/focus tooltip (tablet legend + desktop overlay). */
    resetViewTooltip: "Reset map to initial center and zoom (Shift+R)",
    zoomInTooltip: "Zoom in (Ctrl+Plus or Cmd+Plus)",
    zoomOutTooltip: "Zoom out (Ctrl+Minus or Cmd+Minus)",
    mapStyleDarkAria:
      "Use grayscale night map (same terrain, muted colors). Keyboard shortcut: Control+Shift+N or Command+Shift+N.",
    mapStyleLightAria:
      "Use full-color map. Keyboard shortcut: Control+Shift+N or Command+Shift+N.",
    mapStyleDarkTooltip: "Grayscale night map (Ctrl+Shift+N or Cmd+Shift+N)",
    mapStyleLightTooltip: "Full-color map (Ctrl+Shift+N or Cmd+Shift+N)",
  },
  timeline: {
    selectYearAria: "Select historical year",
    yearSuffix: " AD",
    navigationAria: "Timeline navigation",
    centurySliderAria: "Century slider",
    currentPeriod: "Current Period",
  },
  legend: {
    attributionLinksAria: "Attribution links",
    opensInNewTab: "Opens in new tab",
    collapseLegend: "Collapse legend",
    expandLegend: "Expand legend",
    scaleDetailsAria: "Population scale details",
  },
  screenshot: {
    ariaLabel: "Save map as image file. Press Ctrl+S or Cmd+S to save.",
    tooltip: "Save map as image (Ctrl+S or Cmd+S)",
    tooltipCapturing: "Capturing screenshot...",
  },
  dev: {
    logDebugAria: "Log debug information to console",
    checkConsole: "Check the console for more details (F12 → Console)",
  },
} as const;

export type LocaleStrings = typeof en;
