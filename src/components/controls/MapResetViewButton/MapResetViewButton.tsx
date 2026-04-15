import React from "react";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrong";

import {
  MAP_CAMERA_RESET_STATE_EVENT,
  MAP_RESET_CAMERA_EVENT,
} from "@/constants/map";
import { strings } from "@/locales";
import { preventFocusOnMouseDown } from "@/utils/keyboard";

import { MapResetViewControl } from "./MapResetViewButton.styles";

export type MapResetViewButtonVariant = "floating" | "inline";

type MapResetViewButtonProps = {
  variant?: MapResetViewButtonVariant;
};

export const MapResetViewButton: React.FC<MapResetViewButtonProps> = ({
  variant = "floating",
}) => {
  const [isResetDisabled, setIsResetDisabled] = React.useState(false);

  React.useEffect(() => {
    const onCameraResetState = (
      event: Event & { detail?: { isAtResetCamera?: boolean } }
    ) => {
      setIsResetDisabled(Boolean(event.detail?.isAtResetCamera));
    };
    window.addEventListener(MAP_CAMERA_RESET_STATE_EVENT, onCameraResetState);
    return () => {
      window.removeEventListener(
        MAP_CAMERA_RESET_STATE_EVENT,
        onCameraResetState
      );
    };
  }, []);

  return (
    <MapResetViewControl
      id="map-reset-view-button"
      type="button"
      data-testid="map-reset-view-button"
      data-variant={variant === "inline" ? "inline" : undefined}
      data-tooltip={strings.map.resetViewTooltip}
      aria-label={strings.map.resetViewAria}
      aria-keyshortcuts="Shift+R"
      disabled={isResetDisabled}
      disableRipple
      onMouseDown={preventFocusOnMouseDown}
      onClick={() => window.dispatchEvent(new Event(MAP_RESET_CAMERA_EVENT))}
    >
      <CenterFocusStrong />
    </MapResetViewControl>
  );
};
