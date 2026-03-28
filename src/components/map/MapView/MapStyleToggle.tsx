import React from "react";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";

import { MapResetViewControl } from "@/components/controls/MapResetViewButton/MapResetViewButton.styles";
import { useMapStyleMode } from "@/context/MapStyleContext";
import { strings } from "@/locales";

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

  const styleToggleLabel =
    mode === "dark"
      ? strings.map.mapStyleLightAria
      : strings.map.mapStyleDarkAria;

  return (
    <MapResetViewControl
      id="map-style-toggle"
      type="button"
      data-testid="map-style-toggle"
      data-variant={variant === "inline" ? "inline" : undefined}
      data-tooltip={styleToggleLabel}
      aria-label={styleToggleLabel}
      aria-pressed={mode === "dark"}
      disableRipple
      onClick={toggleMode}
    >
      {mode === "dark" ? <LightMode /> : <DarkMode />}
    </MapResetViewControl>
  );
};
