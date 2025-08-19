import { SaveAltRounded } from "@mui/icons-material";
import { useMediaQuery, useTheme } from "@mui/material";
import html2canvas from "html2canvas";
import React from "react";
import {
  hideMapControls,
  restoreMapControls,
  addAttributionOverlay,
} from "./utils";
import { FloatingButton } from "@/common/styles";

type ScreenshotButtonProps = {
  mapContainerSelector?: string;
  filename?: string;
};

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({
  mapContainerSelector = "#map-container",
  filename = "map.png",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleScreenshot = async () => {
    const mapContainer =
      document.querySelector<HTMLElement>(mapContainerSelector);
    if (!mapContainer) {
      window.alert("Map container not found!");
      return;
    }

    const { controls, prevDisplay } = hideMapControls(mapContainer);
    const attributionDiv = addAttributionOverlay(mapContainer, theme, isMobile);

    try {
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        backgroundColor: theme.palette.background.paper,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      attributionDiv.remove();
      restoreMapControls(controls, prevDisplay);
    }
  };

  return (
    <FloatingButton
      id="map-screenshot-button"
      onClick={handleScreenshot}
      size="medium"
      color="secondary"
      aria-label="save map as image"
    >
      <SaveAltRounded />
    </FloatingButton>
  );
};

export default ScreenshotButton;
