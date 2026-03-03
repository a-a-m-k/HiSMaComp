import React, { Suspense } from "react";
import Box from "@mui/material/Box";
import { NavigationControl } from "react-map-gl/maplibre";
import { ScreenshotButtonContainer } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";
import { TRANSITIONS } from "@/constants";

const ScreenshotButton = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);

interface MapOverlaysProps {
  showOverlayButtons: boolean;
  showZoomButtons: boolean;
  isMobile: boolean;
}

/**
 * Overlay UI on top of the map: screenshot button and zoom controls.
 * Pointer events and visibility follow showOverlayButtons.
 */
export const MapOverlays: React.FC<MapOverlaysProps> = ({
  showOverlayButtons,
  showZoomButtons,
  isMobile,
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
    {!isMobile && (
      <ScreenshotButtonContainer
        sx={{ pointerEvents: showOverlayButtons ? "auto" : "none" }}
      >
        <Suspense fallback={null}>
          <ScreenshotButton />
        </Suspense>
      </ScreenshotButtonContainer>
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
        <NavigationControl position="bottom-right" />
      </Box>
    )}
  </Box>
);
