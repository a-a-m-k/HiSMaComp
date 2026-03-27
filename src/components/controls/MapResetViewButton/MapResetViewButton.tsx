import React from "react";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrong";

import { MAP_RESET_CAMERA_EVENT } from "@/constants/map";
import { strings } from "@/locales";

import { MapResetViewControl } from "./MapResetViewButton.styles";

export type MapResetViewButtonVariant = "floating" | "inline";

type MapResetViewButtonProps = {
  variant?: MapResetViewButtonVariant;
};

export const MapResetViewButton: React.FC<MapResetViewButtonProps> = ({
  variant = "floating",
}) => (
  <MapResetViewControl
    id="map-reset-view-button"
    type="button"
    data-testid="map-reset-view-button"
    data-variant={variant === "inline" ? "inline" : undefined}
    aria-label={strings.map.resetViewAria}
    disableRipple
    onClick={() => window.dispatchEvent(new Event(MAP_RESET_CAMERA_EVENT))}
  >
    <CenterFocusStrong />
  </MapResetViewControl>
);
