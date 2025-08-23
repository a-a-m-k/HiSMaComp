import React from "react";
import MapContainer from "../containers/MapContainer";
import { Box } from "@mui/material";
import { APP_MIN_WIDTH } from "@/constants";

const MapPage: React.FC = () => (
  <Box
    sx={{
      minWidth: APP_MIN_WIDTH,
      width: "100vw",
      height: "100vh",
      overflowX: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <MapContainer />
  </Box>
);

export default MapPage;
