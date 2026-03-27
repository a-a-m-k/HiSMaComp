import React, { useEffect } from "react";
import SaveAltRounded from "@mui/icons-material/SaveAltRounded";
import CircularProgress from "@mui/material/CircularProgress";

import { ScreenshotButton as StyledScreenshotButton } from "./ScreenshotButton.styles";
import { TRANSITIONS, OPACITY, SIZES } from "@/constants/ui";
import { strings } from "@/locales";
import { useScreenshot } from "@/hooks/ui";
import { isInputField } from "@/utils/keyboard";

export type ScreenshotButtonVariant = "floating" | "inline";

type ScreenshotButtonProps = {
  mapContainerSelector?: string;
  filename?: string;
  /** Legend header (tablet): match collapse control; default frosted circle for desktop overlay. */
  variant?: ScreenshotButtonVariant;
};

/**
 * Screenshot button component.
 * Rendered in `MapView` (including mobile) or in the legend header on tablet.
 * Keyboard shortcut (Ctrl+S/Cmd+S) is only active when component is mounted.
 */
const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({
  mapContainerSelector = "#map-container",
  filename = "map.png",
  variant = "floating",
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
      data-variant={variant === "inline" ? "inline" : undefined}
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
        ...(variant === "floating" && {
          "& .MuiSvgIcon-root": {
            fontSize: "1.25rem",
          },
        }),
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
