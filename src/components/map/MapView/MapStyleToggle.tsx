import React from "react";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";

import { MapResetViewControl } from "@/components/controls/MapResetViewButton/MapResetViewButton.styles";
import { useMapStyleMode } from "@/context/MapStyleContext";
import { strings } from "@/locales";
import { preventFocusOnMouseDown } from "@/utils/keyboard";

export type MapStyleToggleVariant = "floating" | "inline";

type MapStyleToggleProps = {
  variant?: MapStyleToggleVariant;
};

/**
 * Toggles full-color vs grayscale presentation of the same terrain basemap.
 */
export const MapStyleToggle: React.FC<MapStyleToggleProps> = ({
  variant = "floating",
}) => {
  const { mode, toggleMode } = useMapStyleMode();

  const styleToggleAria =
    mode === "dark"
      ? strings.map.mapStyleLightAria
      : strings.map.mapStyleDarkAria;
  const styleToggleTooltip =
    mode === "dark"
      ? strings.map.mapStyleLightTooltip
      : strings.map.mapStyleDarkTooltip;

  return (
    <MapResetViewControl
      id="map-style-toggle"
      type="button"
      data-testid="map-style-toggle"
      data-variant={variant === "inline" ? "inline" : undefined}
      data-tooltip={styleToggleTooltip}
      aria-label={styleToggleAria}
      aria-keyshortcuts="Control+Shift+N Meta+Shift+N"
      aria-pressed={mode === "dark"}
      disableRipple
      onMouseDown={preventFocusOnMouseDown}
      onClick={toggleMode}
    >
      {mode === "dark" ? <LightMode /> : <DarkMode />}
    </MapResetViewControl>
  );
};
