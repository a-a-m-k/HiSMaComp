import React from "react";
import Box from "@mui/material/Box";

import { ErrorOverlay } from "@/components/ui";
import { AppProvider } from "@/context/AppContext";
import { useLegendLayers, useTownsData } from "@/hooks";

import { strings } from "@/locales";
import { MapLayout } from "./MapLayout";
import { TIMELINE_MARKS } from "./MapLayoutHelpers";

/**
 * Map screen: data loading, error state, and app context.
 * Renders MapLayout (legend + timeline + map) when towns are available.
 */
const MapScreen: React.FC = () => {
  const legendLayers = useLegendLayers();
  const { towns, isLoading: townsLoading, error: townsError } = useTownsData();

  if (townsError) {
    return (
      <Box
        id="map-container"
        sx={{ width: "100%", height: "100%", position: "relative" }}
      >
        <ErrorOverlay
          title={strings.errors.dataLoadingError}
          message={townsError}
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <AppProvider towns={towns.length > 0 ? towns : []}>
      <MapLayout
        legendLayers={legendLayers}
        marks={TIMELINE_MARKS}
        showDefaultMap={townsLoading || towns.length === 0}
        townsLoading={townsLoading}
      />
    </AppProvider>
  );
};

export default MapScreen;
