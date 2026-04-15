import React from "react";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrong";

import {
  dispatchMapResetCamera,
  onMapCameraResetState,
} from "@/utils/events/mapEvents";
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
    const cleanup = onMapCameraResetState(event => {
      setIsResetDisabled(Boolean(event.detail?.isAtResetCamera));
    });
    return cleanup;
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
      onClick={dispatchMapResetCamera}
    >
      <CenterFocusStrong />
    </MapResetViewControl>
  );
};
