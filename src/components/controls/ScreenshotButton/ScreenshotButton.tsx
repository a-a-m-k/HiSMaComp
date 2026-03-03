import React, { useEffect } from "react";
import SaveAltRounded from "@mui/icons-material/SaveAltRounded";
import CircularProgress from "@mui/material/CircularProgress";

import { ScreenshotButton as StyledScreenshotButton } from "./ScreenshotButton.styles";
import { TRANSITIONS, OPACITY, SIZES } from "@/constants/ui";
import { SIZING_CONSTANTS } from "@/constants/sizing";
import { strings } from "@/locales";
import { useScreenshot } from "@/hooks/ui";
import { isInputField } from "@/utils/keyboard";

type ScreenshotButtonProps = {
  mapContainerSelector?: string;
  filename?: string;
};

/**
 * Screenshot button component.
 * Note: This component is conditionally rendered in MapView and is not shown on mobile devices (< 600px).
 * Keyboard shortcut (Ctrl+S/Cmd+S) is only active when component is mounted.
 */
const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({
  mapContainerSelector = "#map-container",
  filename = "map.png",
}) => {
  const { captureScreenshot, isCapturing } = useScreenshot({
    mapContainerSelector,
    filename,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (isInputField(e.target as HTMLElement)) {
          return;
        }

        e.preventDefault();
        if (!isCapturing) {
          captureScreenshot();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [captureScreenshot, isCapturing]);

  return (
    <StyledScreenshotButton
      id="map-screenshot-button"
      data-testid="screenshot-button"
      data-tooltip={
        isCapturing
          ? "Capturing screenshot..."
          : "Save map as image (Ctrl+S or Cmd+S)"
      }
      onClick={captureScreenshot}
      size="medium"
      color="secondary"
      aria-label={strings.screenshot.ariaLabel}
      disabled={isCapturing}
      tabIndex={0}
      disableRipple
      sx={{
        opacity: isCapturing ? OPACITY.DISABLED : OPACITY.ACTIVE,
        transition: TRANSITIONS.OPACITY,
        "& .MuiSvgIcon-root": {
          fontSize: {
            xs: SIZING_CONSTANTS.FONT_SIZES.ICON_DEFAULT,
            xl: SIZING_CONSTANTS.FONT_SIZES.ICON_XL,
          },
        },
      }}
    >
      {isCapturing ? (
        <CircularProgress size={SIZES.ICON_MEDIUM} color="inherit" />
      ) : (
        <SaveAltRounded />
      )}
    </StyledScreenshotButton>
  );
};

export default ScreenshotButton;
