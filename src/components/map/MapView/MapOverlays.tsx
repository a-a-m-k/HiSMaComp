import React, { Suspense, useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { NavigationControl } from "react-map-gl/maplibre";
import { MapResetViewButton } from "@/components/controls/MapResetViewButton/MapResetViewButton";
import { MapOverlayToolsStack } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";
import { MapStyleToggle } from "./MapStyleToggle";
import { TRANSITIONS } from "@/constants";

const ScreenshotButton = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);

interface MapOverlaysProps {
  showOverlayButtons: boolean;
  showZoomButtons: boolean;
  /** When true, snapshot + reset live in the legend header instead of a fixed overlay. */
  isTablet: boolean;
  /** Floating snapshot is hidden on phone; tablet uses legend header, desktop uses overlay. */
  isMobile: boolean;
}

/**
 * Overlay UI on top of the map: screenshot (non-mobile), reset, style toggle, and zoom controls.
 * Pointer events and visibility follow showOverlayButtons.
 * When hidden (e.g. during resize), blur any focused control so focus rings do not persist on mobile.
 * After touch taps on overlay controls, blur on pointer-up so focus/hover visuals do not stick (iOS).
 */
export const MapOverlays: React.FC<MapOverlaysProps> = ({
  showOverlayButtons,
  showZoomButtons,
  isTablet,
  isMobile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const blurFocusInsideOverlay = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && root.contains(active)) {
      active.blur();
    }
  }, []);

  useEffect(() => {
    if (showOverlayButtons) return;
    blurFocusInsideOverlay();
  }, [showOverlayButtons, blurFocusInsideOverlay]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!showOverlayButtons || e.pointerType !== "touch") return;
      requestAnimationFrame(() => {
        blurFocusInsideOverlay();
      });
    },
    [showOverlayButtons, blurFocusInsideOverlay]
  );

  return (
    <Box
      ref={containerRef}
      aria-hidden={!showOverlayButtons}
      onPointerUp={handlePointerUp}
      onFocusCapture={e => {
        if (!showOverlayButtons) {
          (e.target as HTMLElement).blur();
        }
      }}
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
          data-map-overlay-tool-group="true"
          sx={{ pointerEvents: showOverlayButtons ? "auto" : "none" }}
        >
          {!isMobile && (
            <Suspense fallback={null}>
              <ScreenshotButton />
            </Suspense>
          )}
          <MapResetViewButton />
          <MapStyleToggle />
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
};
