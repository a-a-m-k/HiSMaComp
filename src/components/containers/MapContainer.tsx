import React from "react";
import Box from "@mui/material/Box";

import Timeline from "@/components/controls/Timeline/Timeline";
import MapLegend from "@/components/controls/Legend/Legend";
import { ErrorBoundary } from "@/components/dev";
import { LoadingSpinner, ErrorOverlay } from "@/components/ui";
import {
  CENTURY_MAP,
  YEARS,
  MAX_ZOOM_LEVEL,
  LEGEND_HEADING_LABEL,
  APP_MIN_WIDTH,
  APP_MIN_HEIGHT,
} from "@/constants";
import { LayerItem, TimelineMark } from "@/common/types";
import { AppProvider, useApp } from "@/context/AppContext";
import { useLegendLayers, useTownsData } from "@/hooks";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

import MapView from "@/components/map/MapView/MapView";

const marks: TimelineMark[] = YEARS.map(year => ({
  value: year,
  label: CENTURY_MAP[year].toString() + "th ct.",
}));

const DEFAULT_MAP_CENTER = { latitude: 50.0, longitude: 10.0 };
const DEFAULT_MAP_ZOOM = 4;

/**
 * Top-level map shell: loads towns, wraps content in AppProvider, and renders
 * timeline, legend, and map view. Handles loading and error states.
 */
const MapContainer = () => {
  const legendLayers = useLegendLayers();
  const { towns, isLoading: townsLoading, error: townsError } = useTownsData();

  if (townsError) {
    return (
      <Box
        id="map-container"
        sx={{ width: "100%", height: "100%", position: "relative" }}
      >
        <ErrorOverlay
          title="Data Loading Error"
          message={townsError}
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <AppProvider towns={towns.length > 0 ? towns : []}>
      <MapContainerContent
        legendLayers={legendLayers}
        marks={marks}
        showDefaultMap={townsLoading || towns.length === 0}
        townsLoading={townsLoading}
      />
    </AppProvider>
  );
};

/**
 * Inner map layout: timeline and legend as overlays, map view in an
 * absolutely positioned full-size wrapper so the map fills the container
 * regardless of overlay layout.
 */
const MapContainerContent = ({
  legendLayers,
  marks,
  showDefaultMap,
  townsLoading,
}: {
  legendLayers: LayerItem[];
  marks: TimelineMark[];
  showDefaultMap?: boolean;
  townsLoading?: boolean;
}) => {
  const { isLoading, error, retry } = useApp();
  const [isMapIdle, setIsMapIdle] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-app-ready", "true");
    return () => {
      document.documentElement.removeAttribute("data-app-ready");
    };
  }, []);

  return (
    <Box
      id="map-container"
      sx={{
        width: "100%",
        flex: 1,
        minWidth: APP_MIN_WIDTH,
        minHeight: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!error && (
        <>
          <Timeline marks={marks} />
          <MapLegend
            label={LEGEND_HEADING_LABEL}
            layers={legendLayers}
            isMapIdle={isMapIdle}
          />
        </>
      )}
      {error && (
        <ErrorOverlay
          title="Data Loading Error"
          message={error}
          onRetry={retry}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          minHeight: 0,
        }}
      >
        <ErrorBoundary>
          <MapViewWithCalculations
            showDefaultMap={showDefaultMap}
            onFirstIdle={() => setIsMapIdle(true)}
          />
        </ErrorBoundary>
      </Box>
      {(isLoading || townsLoading) && (
        <LoadingSpinner message="Loading historical data..." />
      )}
    </Box>
  );
};

/**
 * Chooses MapView props from AppContext (center, fitZoom) or defaults when
 * loading, no towns, or invalid values.
 */
const MapViewWithCalculations = ({
  showDefaultMap,
  onFirstIdle,
}: {
  showDefaultMap?: boolean;
  onFirstIdle: () => void;
}) => {
  const { center, fitZoom, isLoading } = useApp();

  if (showDefaultMap || isLoading || !center) {
    return (
      <MapView
        initialPosition={DEFAULT_MAP_CENTER}
        initialZoom={DEFAULT_MAP_ZOOM}
        onFirstIdle={onFirstIdle}
      />
    );
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
    return (
      <MapView
        initialPosition={DEFAULT_MAP_CENTER}
        initialZoom={DEFAULT_MAP_ZOOM}
        onFirstIdle={onFirstIdle}
      />
    );
  }

  return (
    <MapView
      initialPosition={{
        latitude: center.latitude,
        longitude: center.longitude,
      }}
      initialZoom={fitZoom}
      onFirstIdle={onFirstIdle}
    />
  );
};

export default MapContainer;
