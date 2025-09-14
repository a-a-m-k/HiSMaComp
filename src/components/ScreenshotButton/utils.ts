import { Theme } from "@mui/material";
import { ATTRIBUTION_TEXT } from "../../constants";
export function hideMapControls(mapContainer: HTMLElement) {
  const controls = mapContainer.querySelectorAll(
    ".maplibregl-control-container, .maplibregl-ctrl, #attribution, #map-screenshot-button, #info-button, #timeline"
  );
  const prevDisplay: string[] = [];
  controls.forEach((el, i) => {
    prevDisplay[i] = (el as HTMLElement).style.display;
    (el as HTMLElement).style.display = "none";
  });
  return { controls, prevDisplay };
}

export function restoreMapControls(
  controls: NodeListOf<Element>,
  prevDisplay: string[]
) {
  // Restore the styels of the controls after screenshot
  controls.forEach((el, i) => {
    (el as HTMLElement).style.display = prevDisplay[i] || "";
  });
}

export function addAttributionOverlay(
  mapContainer: HTMLElement,
  theme: Theme,
  isMobile: boolean = false
) {
  // Create attribution div on screenshot
  const attributionDiv = document.createElement("div");
  attributionDiv.innerText = ATTRIBUTION_TEXT;

  // Responsive styles for small screens

  Object.assign(attributionDiv.style, {
    position: "absolute",
    left: "auto",
    bottom: 0,
    right: 0,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: isMobile
      ? theme.typography.pxToRem(10)
      : theme.typography.pxToRem(14),
    padding: theme.spacing(0.25, 1),
    pointerEvents: "none",
    zIndex: "9999",
    opacity: "0.8",
    whiteSpace: "pre-line",
    overflow: "hidden",
    textOverflow: "ellipsis",
  });
  mapContainer.appendChild(attributionDiv);
  return attributionDiv;
}
