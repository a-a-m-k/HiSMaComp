import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { MapContainer } from "@/components/containers";
import { APP_MIN_WIDTH, APP_MIN_HEIGHT } from "@/constants";

/**
 * Root page layout: full-viewport main with map and overlays.
 *
 * Uses fixed positioning and min width/height (APP_MIN_* = 300px) so the app
 * does not shrink below 300px; when the viewport is smaller, horizontal (and
 * vertical) scroll appears. Dimensions and zoom logic use the same 300px floor
 * via useScreenDimensions clamp.
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
      minWidth: APP_MIN_WIDTH,
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
    <MapContainer />
  </Box>
);

export default MapPage;
