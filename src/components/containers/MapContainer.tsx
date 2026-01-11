import React from "react";
import { Box } from "@mui/material";

import towns from "@/assets/history-data/towns.json";
import { MapView } from "@/components/map";
import { Timeline, Legend as MapLegend } from "@/components/controls";
import { ErrorBoundary } from "@/components/dev";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { CENTURY_MAP, YEARS, MAX_ZOOM_LEVEL } from "@/constants";
import { LayerItem, TimelineMark } from "@/common/types";
import { AppProvider, useApp } from "@/context/AppContext";
import { useLegendLayers } from "@/hooks";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

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
      {/* Timeline first in DOM for proper tab order (position: fixed, so DOM order doesn't affect visuals) */}
      <Timeline marks={marks} />
      <MapLegend
        label="Town size according to population number"
        layers={legendLayers}
      />
      {error && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "90%",
            maxWidth: 600,
          }}
        >
          <ErrorAlert
            title="Data Loading Error"
            message={error}
            onRetry={retry}
          />
        </Box>
      )}
      <ErrorBoundary>
        <MapViewWithCalculations />
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
