import { SaveAltRounded } from "@mui/icons-material";
import {
  useMediaQuery,
  useTheme,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import html2canvas from "html2canvas";
import React, { useState, useCallback } from "react";
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
  const [isCapturing, setIsCapturing] = useState(false);

  const handleScreenshot = useCallback(async () => {
    if (isCapturing) return;

    const mapContainer =
      document.querySelector<HTMLElement>(mapContainerSelector);
    if (!mapContainer) {
      window.alert("Map container not found!");
      return;
    }

    setIsCapturing(true);

    try {
      const { controls, prevDisplay } = hideMapControls(mapContainer);
      const attributionDiv = addAttributionOverlay(
        mapContainer,
        theme,
        isMobile
      );

      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        backgroundColor: theme.palette.background.paper,
        logging: false,
        scale: isMobile ? 1 : 2,
        allowTaint: false,
        foreignObjectRendering: false,
        removeContainer: false,
        imageTimeout: 5000,
        onclone: clonedDoc => {
          // Only check for performance monitor in development
          if (process.env.NODE_ENV === "development") {
            const perfMonitor = clonedDoc.querySelector(
              "[data-performance-monitor]"
            );
            if (perfMonitor) {
              perfMonitor.remove();
            }
          }
        },
      });

      const url = canvas.toDataURL("image/png", 0.9);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        attributionDiv.remove();
        restoreMapControls(controls, prevDisplay);
      }, 100);
    } catch (error) {
      console.error("Screenshot failed:", error);
      window.alert("Screenshot failed. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, mapContainerSelector, filename, theme, isMobile]);

  return (
    <Tooltip
      title={isCapturing ? "Capturing screenshot..." : "Save map as image"}
    >
      <FloatingButton
        id="map-screenshot-button"
        onClick={handleScreenshot}
        size="medium"
        color="secondary"
        aria-label="save map as image"
        disabled={isCapturing}
        sx={{
          opacity: isCapturing ? 0.7 : 1,
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {isCapturing ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <SaveAltRounded />
        )}
      </FloatingButton>
    </Tooltip>
  );
};

export default ScreenshotButton;
