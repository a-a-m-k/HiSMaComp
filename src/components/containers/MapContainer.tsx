import React, { Suspense } from "react";
import { Box } from "@mui/material";

import towns from "@/assets/history-data/towns.json";
import { Timeline, Legend as MapLegend } from "@/components/controls";
import { ErrorBoundary } from "@/components/dev";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { CENTURY_MAP, YEARS, MAX_ZOOM_LEVEL } from "@/constants";
import { Z_INDEX } from "@/constants/ui";
import { LayerItem, TimelineMark } from "@/common/types";
import { AppProvider, useApp } from "@/context/AppContext";
import { useLegendLayers } from "@/hooks";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

// Lazy load MapView to improve First Contentful Paint (FCP)
const MapView = React.lazy(() => import("@/components/map/MapView/MapView"));

const marks: TimelineMark[] = YEARS.map(year => ({
  value: year,
  label: CENTURY_MAP[year].toString() + "th ct.",
}));

const MapContainer = () => {
  const legendLayers = useLegendLayers();

  return (
    <AppProvider towns={towns}>
      <MapContainerContent legendLayers={legendLayers} marks={marks} />
    </AppProvider>
  );
};

const MapContainerContent = ({
  legendLayers,
  marks,
}: {
  legendLayers: LayerItem[];
  marks: TimelineMark[];
}) => {
  const { isLoading, error, retry } = useApp();

  return (
    <Box
      id="map-container"
      sx={{ width: "100%", height: "100%", position: "relative" }}
    >
      {!error && (
        <>
          <Timeline marks={marks} />
          <MapLegend
            label="Town size according to population number"
            layers={legendLayers}
          />
        </>
      )}
      {error && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: Z_INDEX.ERROR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            padding: 2,
          }}
        >
          <Box
            sx={{
              width: "90%",
              maxWidth: 600,
              position: "relative",
            }}
          >
            <ErrorAlert
              title="Data Loading Error"
              message={error}
              onRetry={retry}
            />
          </Box>
        </Box>
      )}
      <ErrorBoundary>
        <Suspense fallback={<MapSkeleton />}>
          <MapViewWithCalculations />
        </Suspense>
      </ErrorBoundary>
      {isLoading && <LoadingSpinner message="Processing historical data..." />}
    </Box>
  );
};

const MapViewWithCalculations = () => {
  const { center, fitZoom, isLoading } = useApp();

  if (isLoading) {
    return <MapSkeleton />;
  }

  if (!center) {
    return null;
  }

  const isValidCenter =
    center && isValidCoordinate(center.latitude, center.longitude);

  const isValidZoom =
    fitZoom &&
    isValidNumber(fitZoom) &&
    fitZoom >= 0 &&
    fitZoom <= MAX_ZOOM_LEVEL;

  if (!isValidCenter || !isValidZoom) {
    logger.error("Invalid map parameters:", { center, fitZoom });
    return null;
  }

  return (
    <MapView
      initialPosition={{
        latitude: center.latitude,
        longitude: center.longitude,
      }}
      initialZoom={fitZoom}
    />
  );
};

export default MapContainer;
