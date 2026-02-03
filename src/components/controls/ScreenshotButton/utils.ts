import { Theme } from "@mui/material";
import { ATTRIBUTION_TEXT } from "@/constants";
export function hideMapControls(mapContainer: HTMLElement) {
  const controls = mapContainer.querySelectorAll(
    ".maplibregl-control-container, .maplibregl-ctrl, #attribution, #map-screenshot-button, #info-button, #timeline"
  );
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

export function addAttributionOverlay(
  mapContainer: HTMLElement,
  theme: Theme,
  isMobile: boolean = false,
  isTablet: boolean = false
) {
  const attributionDiv = document.createElement("div");
  attributionDiv.innerText = ATTRIBUTION_TEXT;

  let fontSize: number;
  if (isMobile) {
    fontSize = 8;
  } else if (isTablet) {
    fontSize = 10;
  } else {
    fontSize = 12;
  }

  Object.assign(attributionDiv.style, {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(fontSize),
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
