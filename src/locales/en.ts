/**
 * English (default) locale strings.
 * Use these keys in the app so switching to i18n later only changes this file and the provider.
 */
export const en = {
  common: {
    tryAgain: "Try Again",
    reloadPage: "Reload Page",
    opensInNewTab: "Opens in new tab",
  },
  errors: {
    somethingWentWrong: "Oops! Something went wrong",
    unexpectedError:
      "An unexpected error occurred. Please try reloading the page.",
    dataLoadingError: "Data Loading Error",
    tryAgainReset: "Try again to reset error and continue",
    reloadPageRecover: "Reload page to recover from error",
    noTownsData: "No towns data available",
  },
  loading: {
    default: "Processing data...",
    resizingMap: "Resizing map...",
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
    descriptionShortcutZoomTablet:
      "On tablets, use pinch-to-zoom gestures to zoom.",
    descriptionMarkersColor: "Town markers are color-coded by population size.",
  },
  timeline: {
    selectYearAria: "Select historical year",
    yearSuffix: " AD",
  },
  legend: {
    attributionLinksAria: "Attribution links",
    opensInNewTab: "Opens in new tab",
  },
  screenshot: {
    ariaLabel: "Save map as image file. Press Ctrl+S or Cmd+S to save.",
  },
  dev: {
    logDebugAria: "Log debug information to console",
    checkConsole: "Check the console for more details (F12 → Console)",
  },
} as const;

export type LocaleStrings = typeof en;
