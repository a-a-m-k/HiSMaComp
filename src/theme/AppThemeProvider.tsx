import React from "react";
import { ThemeProvider } from "@mui/material/styles";

import { useMapStyleMode } from "@/context/MapStyleContext";
import { darkTheme, lightTheme } from "./theme";

/**
 * Provides the MUI theme that tracks `MapStyleContext` basemap mode (light / dark).
 */
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mode } = useMapStyleMode();
  const theme = mode === "dark" ? darkTheme : lightTheme;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
