import React, { Suspense, useState, useEffect } from "react";
import Box from "@mui/material/Box";

import { Timeline, Legend as MapLegend } from "@/components/controls";
import { ErrorBoundary } from "@/components/dev";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { CENTURY_MAP, YEARS, MAX_ZOOM_LEVEL } from "@/constants";
import { Z_INDEX } from "@/constants/ui";
import { LayerItem, TimelineMark, Town } from "@/common/types";
import { AppProvider, useApp } from "@/context/AppContext";
import { useLegendLayers } from "@/hooks";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";
// Lazy-load MapView so the LCP element (legend heading) can paint before MapLibre parses.
// MapLibre is large; deferring it reduces main-thread blocking and element render delay.
const MapView = React.lazy(() => import("@/components/map/MapView/MapView"));

const marks: TimelineMark[] = YEARS.map(year => ({
  value: year,
  label: CENTURY_MAP[year].toString() + "th ct.",
}));

/**
 * Loads towns data asynchronously to reduce initial bundle size.
 * This allows the app to start rendering while data loads in the background.
 * Uses dynamic import to create a separate chunk that loads on demand.
 */
const useTownsData = () => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTowns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use dynamic import to load JSON as a separate chunk
        // Vite will handle this and create a separate bundle for the JSON
        const townsModule = await import(
          /* webpackChunkName: "towns-data" */
          "@/assets/history-data/towns.json"
        );

        // Handle both default export and named export
        const townsData = townsModule.default || townsModule;
        setTowns(townsData);
        logger.info(`Loaded ${townsData.length} towns asynchronously`);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? `Failed to load towns data: ${err.message}`
            : "Failed to load towns data. Please refresh the page.";
        logger.error("Error loading towns data:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadTowns();
  }, []);

  return { towns, isLoading, error };
};

// Default map center (Europe) and zoom for initial render
// This allows map to show immediately while towns data loads
const DEFAULT_MAP_CENTER = { latitude: 50.0, longitude: 10.0 }; // Central Europe
const DEFAULT_MAP_ZOOM = 4;

const MapContainer = () => {
  const legendLayers = useLegendLayers();
  const { towns, isLoading: townsLoading, error: townsError } = useTownsData();

  // Show error state if towns data failed to load
  if (townsError) {
    return (
      <Box
        id="map-container"
        sx={{ width: "100%", height: "100%", position: "relative" }}
      >
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
              message={townsError}
              onRetry={() => window.location.reload()}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  // Render app immediately with default map view (even while towns are loading)
  // Pass empty array initially so AppProvider can render immediately
  // This allows MapLibre to load in parallel with towns data
  // Map will update when towns data is ready
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

  // Hide the static LCP placeholder once the real legend has mounted (avoids duplicate)
  React.useEffect(() => {
    const placeholder = document.getElementById("legend-heading-placeholder");
    if (placeholder) placeholder.style.setProperty("display", "none");
  }, []);

  return (
    <Box
      id="map-container"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        position: "relative",
      }}
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
        <Suspense
          fallback={
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "grey.100",
              }}
            />
          }
        >
          <MapViewWithCalculations showDefaultMap={showDefaultMap} />
        </Suspense>
      </ErrorBoundary>
      {(isLoading || townsLoading) && (
        <LoadingSpinner message="Loading historical data..." />
      )}
    </Box>
  );
};

const MapViewWithCalculations = ({
  showDefaultMap,
}: {
  showDefaultMap?: boolean;
}) => {
  const { center, fitZoom, isLoading } = useApp();

  // Show default map while data is loading or processing
  // This allows map to render immediately while towns data loads in parallel
  if (showDefaultMap || isLoading || !center) {
    return (
      <MapView
        initialPosition={DEFAULT_MAP_CENTER}
        initialZoom={DEFAULT_MAP_ZOOM}
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
    // Fallback to default map if invalid
    return (
      <MapView
        initialPosition={DEFAULT_MAP_CENTER}
        initialZoom={DEFAULT_MAP_ZOOM}
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
    />
  );
};

export default MapContainer;
