import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { MapScreen } from "@/components/containers";
import { APP_MIN_HEIGHT } from "@/constants";

const hasStadiaApiKey = (): boolean =>
  !!(
    typeof import.meta.env !== "undefined" &&
    import.meta.env.VITE_STADIA_API_KEY
  );

/**
 * Shown when VITE_STADIA_API_KEY is missing so the map never throws from getTerrainStyle.
 */
const MissingApiKeyMessage: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      p: 3,
      textAlign: "center",
    }}
  >
    <Typography variant="h6" component="h2" gutterBottom>
      Map configuration required
    </Typography>
    <Typography variant="body2" color="text.secondary">
      VITE_STADIA_API_KEY is not set. Create a <code>.env</code> file in the
      project root (see <code>.env.example</code> or README) and add your Stadia
      Maps API key, then restart the dev server or rebuild.
    </Typography>
  </Box>
);

/**
 * Root page layout: full-viewport main with map and overlays.
 * Min width (300px) is applied only to timeline and legend in MapScreen.
 */
const MapPage: React.FC = () => (
  <Box
    component="main"
    id="main-content"
    sx={{
      position: "fixed",
      inset: 0,
      boxSizing: "border-box",
      width: "100vw",
      height: "var(--viewport-height, 100vh)",
      minHeight: APP_MIN_HEIGHT,
      maxHeight: "var(--viewport-height, 100vh)",
      overflowX: "auto",
      overflowY: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: { xs: "stretch", sm: "center" },
      alignItems: { xs: "stretch", sm: "center" },
    }}
  >
    <Typography component="h1" className="sr-only">
      HiSMaComp - Historical Map Visualizer
    </Typography>
    {hasStadiaApiKey() ? <MapScreen /> : <MissingApiKeyMessage />}
  </Box>
);

export default MapPage;
