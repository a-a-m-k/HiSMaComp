import React, { Suspense, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { Timeline, Legend as MapLegend } from "@/components/controls";
import { ErrorBoundary } from "@/components/dev";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { CENTURY_MAP, YEARS, MAX_ZOOM_LEVEL } from "@/constants";
import { Z_INDEX } from "@/constants/ui";
import { LayerItem, TimelineMark, Town } from "@/common/types";
import { AppProvider, useApp } from "@/context/AppContext";
import { useLegendLayers } from "@/hooks";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

// Preload MapView component immediately for progressive rendering
// This starts downloading the bundle while placeholder is shown
const MapView = React.lazy(() => import("@/components/map/MapView/MapView"));

/**
 * Map placeholder component for progressive rendering.
 * Shows immediately while MapLibre GL loads in the background.
 * This improves perceived LCP by showing content right away.
 */
const MapPlaceholder: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="map-container-area"
      role="application"
      aria-label="Loading map..."
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        backgroundImage: `linear-gradient(
          135deg,
          ${theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200]} 0%,
          ${theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[100]} 50%,
          ${theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200]} 100%
        )`,
        backgroundSize: "200% 200%",
        animation: "shimmer 2s ease-in-out infinite",
        "@keyframes shimmer": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, 
            ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"} 0%, 
            transparent 70%)`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: theme.palette.text.secondary,
          zIndex: 1,
        }}
      >
        <Box
          component="div"
          sx={{
            width: 48,
            height: 48,
            margin: "0 auto 16px",
            border: `3px solid ${theme.palette.divider}`,
            borderTopColor: theme.palette.primary.main,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>
    </Box>
  );
};

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

const MapContainer = () => {
  const legendLayers = useLegendLayers();
  const { towns, isLoading: townsLoading, error: townsError } = useTownsData();

  // Show loading state while towns data is being fetched
  if (townsLoading) {
    return (
      <Box
        id="map-container"
        sx={{ width: "100%", height: "100%", position: "relative" }}
      >
        <LoadingSpinner message="Loading historical data..." />
      </Box>
    );
  }

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

  // Once towns are loaded, render the app
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
  const [mapReady, setMapReady] = useState(false);

  // Start preloading MapView immediately for progressive rendering
  useEffect(() => {
    // Preload the MapView component chunk
    import("@/components/map/MapView/MapView").catch(err => {
      logger.warn("Failed to preload MapView:", err);
    });
  }, []);

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
      {/* Progressive rendering: Show placeholder immediately, swap when map ready */}
      <ErrorBoundary>
        {!mapReady && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <MapPlaceholder />
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: mapReady ? 1 : 0,
            transition: "opacity 0.3s ease-in",
            zIndex: 2,
          }}
        >
          <Suspense fallback={null}>
            <MapViewWithCalculations onMapReady={() => setMapReady(true)} />
          </Suspense>
        </Box>
      </ErrorBoundary>
      {isLoading && <LoadingSpinner message="Processing historical data..." />}
    </Box>
  );
};

const MapViewWithCalculations = ({
  onMapReady,
}: {
  onMapReady?: () => void;
}) => {
  const { center, fitZoom, isLoading } = useApp();

  // Don't render map until data is ready
  if (isLoading || !center) {
    return null; // Placeholder is already shown
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
      onMapReady={onMapReady}
    />
  );
};

export default MapContainer;
