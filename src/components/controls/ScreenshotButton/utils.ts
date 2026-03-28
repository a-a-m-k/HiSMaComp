/** Fired before capture so the legend can expand if it was collapsed. */
export const LEGEND_SCREENSHOT_EXPAND_EVENT =
  "hismacomp:legend-screenshot-expand";
/** Fired after capture (finally) so the legend can restore its prior open state. */
export const LEGEND_SCREENSHOT_RESTORE_EVENT =
  "hismacomp:legend-screenshot-restore";
/** Allow MUI `Collapse` open animation to finish (`timeout` 300ms + buffer). */
export const LEGEND_SCREENSHOT_EXPAND_WAIT_MS = 320;

export type HideMapControlsOptions = {
  /**
   * When true, the save control stays visible during capture (e.g. narrow screens).
   * The reset/centering control is always hidden for a clean export.
   */
  keepScreenshotButtonVisibleDuringCapture?: boolean;
};

export function hideMapControls(
  mapContainer: HTMLElement,
  options?: HideMapControlsOptions
) {
  const parts = [
    ".maplibregl-control-container",
    ".maplibregl-ctrl",
    "#map-reset-view-button",
    "#map-style-toggle",
    "#legend-collapse-button",
    "#info-button",
    "#timeline",
  ];
  if (!options?.keepScreenshotButtonVisibleDuringCapture) {
    parts.push("#map-screenshot-button");
  }
  const controls = mapContainer.querySelectorAll(parts.join(", "));
  const prevDisplay: string[] = [];

  controls.forEach((el, i) => {
    const element = el as HTMLElement;
    prevDisplay[i] = element.style.display;
    element.style.display = "none";
  });

  return { controls, prevDisplay };
}

export function restoreMapControls(
  controls: NodeListOf<Element>,
  prevDisplay: string[]
) {
  controls.forEach((el, i) => {
    (el as HTMLElement).style.display = prevDisplay[i] || "";
  });
}
