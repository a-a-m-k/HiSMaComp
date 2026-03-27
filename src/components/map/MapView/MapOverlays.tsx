import React, { Suspense } from "react";
import Box from "@mui/material/Box";
import { NavigationControl } from "react-map-gl/maplibre";
import { MapResetViewButton } from "@/components/controls/MapResetViewButton/MapResetViewButton";
import { MapOverlayToolsStack } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";
import { TRANSITIONS } from "@/constants";

const ScreenshotButton = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);

interface MapOverlaysProps {
  showOverlayButtons: boolean;
  showZoomButtons: boolean;
  /** When true, snapshot + reset live in the legend header instead of a fixed overlay. */
  isTablet: boolean;
}

/**
 * Overlay UI on top of the map: screenshot button and zoom controls.
 * Pointer events and visibility follow showOverlayButtons.
 */
export const MapOverlays: React.FC<MapOverlaysProps> = ({
  showOverlayButtons,
  showZoomButtons,
  isTablet,
}) => (
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity: showOverlayButtons ? 1 : 0,
      visibility: showOverlayButtons ? "visible" : "hidden",
      transition: TRANSITIONS.OVERLAY_FADE,
    }}
  >
    {!isTablet && (
      <MapOverlayToolsStack
        sx={{ pointerEvents: showOverlayButtons ? "auto" : "none" }}
      >
        <Suspense fallback={null}>
          <ScreenshotButton />
        </Suspense>
        <MapResetViewButton />
      </MapOverlayToolsStack>
    )}
    {showZoomButtons && (
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          pointerEvents: showOverlayButtons ? "auto" : "none",
        }}
      >
        <NavigationControl
          position="bottom-right"
          showCompass={false}
          showZoom
        />
      </Box>
    )}
  </Box>
);
