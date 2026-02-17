import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { MapContainer } from "@/components/containers";
import { APP_MIN_WIDTH, APP_MIN_HEIGHT } from "@/constants";

const MapPage: React.FC = () => (
  <Box
    component="main"
    id="main-content"
    sx={{
      minWidth: { xs: "100vw", sm: APP_MIN_WIDTH },
      minHeight: APP_MIN_HEIGHT,
      width: "100vw",
      height: "100vh",
      overflowX: "hidden",
      display: "flex",
      justifyContent: { xs: "stretch", sm: "center" },
      alignItems: { xs: "stretch", sm: "center" },
      position: "relative",
    }}
  >
    <Typography component="h1" className="sr-only">
      HiSMaComp - Historical Map Visualizer
    </Typography>
    <MapContainer />
  </Box>
);

export default MapPage;
