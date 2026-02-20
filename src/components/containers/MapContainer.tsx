import React, { useState, useEffect, useRef } from "react";
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
  Z_INDEX,
  TRANSITIONS,
} from "@/constants";
import { LayerItem, TimelineMark } from "@/common/types";
import { AppProvider, useApp } from "@/context/AppContext";
import { useInitialMapState } from "@/hooks/map";
import {
  useViewport,
  useNarrowLayout,
  useOverlayButtonsVisible,
} from "@/hooks/ui";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/constants/map";
import { useLegendLayers, useTownsData } from "@/hooks";
import { isValidNumber, isValidCoordinate } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

import MapView from "@/components/map/MapView/MapView";

const marks: TimelineMark[] = YEARS.map(year => ({
  value: year,
  label: CENTURY_MAP[year].toString() + "th ct.",
}));

/**
 * Returns initial map position and zoom for MapView.
 * Use default when loading, no towns, or invalid center/zoom; otherwise use computed initial state.
 */
function getInitialMapProps(
  showDefaultMap: boolean,
  isLoading: boolean,
  initialMapState: {
    center: { latitude: number; longitude: number } | undefined;
    fitZoom: number;
  }
): {
  initialPosition: { latitude: number; longitude: number };
  initialZoom: number;
} {
  const defaultProps = {
    initialPosition: DEFAULT_CENTER,
    initialZoom: DEFAULT_ZOOM,
  };

  if (showDefaultMap || isLoading || !initialMapState.center) {
    return defaultProps;
  }

  const { center, fitZoom } = initialMapState;
  const isValidCenter =
    center && isValidCoordinate(center.latitude, center.longitude);
  const isValidZoom =
    fitZoom != null &&
    isValidNumber(fitZoom) &&
    fitZoom >= 0 &&
    fitZoom <= MAX_ZOOM_LEVEL;

  if (!isValidCenter || !isValidZoom) {
    logger.error("Invalid map parameters:", { center, fitZoom });
    return defaultProps;
  }

  return {
    initialPosition: { latitude: center.latitude, longitude: center.longitude },
    initialZoom: fitZoom,
  };
}

/**
 * Top-level map shell: loads towns, wraps content in AppProvider, and renders
 * timeline, legend, and map view. Handles loading and error states.
 */
const MapContainer = () => {
  const legendLayers = useLegendLayers();
  const { towns, isLoading: townsLoading, error: townsError } = useTownsData();

  if (townsError) {
    // Only one of this error branch or MapContainerContent is ever mounted; same id is intentional.
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
 * Stable key for map remount when viewport crosses mobile/tablet/desktop breakpoint.
 */
function getMapDeviceKey(viewport: {
  isMobile: boolean;
  isTablet: boolean;
}): string {
  if (viewport.isMobile) return "mobile";
  if (viewport.isTablet) return "tablet";
  return "desktop";
}

/** When viewport is below app min size, keep last key so the map does not remount. */
function useStableMapKey(viewport: {
  isMobile: boolean;
  isTablet: boolean;
  isBelowMinViewport: boolean;
}): string {
  const deviceKey = getMapDeviceKey(viewport);
  const lastKeyAboveMinRef = React.useRef(deviceKey);
  if (!viewport.isBelowMinViewport) {
    lastKeyAboveMinRef.current = deviceKey;
  }
  return viewport.isBelowMinViewport ? lastKeyAboveMinRef.current : deviceKey;
}

/** Renders timeline, legend, and map; handles resize/remount overlays and initial map position from useInitialMapState. */
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
  const { towns, filteredTowns, selectedYear, isLoading, error, retry } =
    useApp();
  const viewport = useViewport();
  const narrowLayout = useNarrowLayout(viewport.rawScreenWidth);
  const [isMapIdle, setIsMapIdle] = React.useState(false);
  const { showOverlayButtons, isResizing } =
    useOverlayButtonsVisible(isMapIdle);

  const deviceKey = useStableMapKey(viewport);
  const prevDeviceKeyRef = useRef(deviceKey);
  const [isRemounting, setIsRemounting] = useState(false);

  /** Spinner when crossing breakpoint (remount) or during resize; hide once user is below min width. */
  const showResizeSpinner =
    !viewport.isBelowMinViewport &&
    (prevDeviceKeyRef.current !== deviceKey || isRemounting || isResizing);

  useEffect(() => {
    if (prevDeviceKeyRef.current !== deviceKey) {
      prevDeviceKeyRef.current = deviceKey;
      setIsRemounting(true);
    }
  }, [deviceKey]);

  const handleFirstIdle = React.useCallback(() => {
    setIsMapIdle(true);
    setIsRemounting(false);
  }, []);

  // Center/fitZoom and viewport bounds (for maxBounds) from useInitialMapState.
  const initialMapState = useInitialMapState(towns);
  const { initialPosition, initialZoom } = getInitialMapProps(
    showDefaultMap ?? false,
    isLoading,
    initialMapState
  );

  const maxBounds = React.useMemo(() => {
    const b = initialMapState.bounds;
    if (!b) return undefined;
    const valid =
      Number.isFinite(b.minLat) &&
      Number.isFinite(b.maxLat) &&
      Number.isFinite(b.minLng) &&
      Number.isFinite(b.maxLng);
    if (!valid) return undefined;
    return [
      [b.minLng, b.minLat],
      [b.maxLng, b.maxLat],
    ] as [[number, number], [number, number]];
  }, [initialMapState.bounds]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-app-ready", "true");
    document.documentElement.style.setProperty(
      "--app-min-width",
      `${APP_MIN_WIDTH}px`
    );
    return () => {
      document.documentElement.removeAttribute("data-app-ready");
      document.documentElement.style.removeProperty("--app-min-width");
    };
  }, []);

  return (
    <Box
      id="map-container"
      sx={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        minWidth: viewport.isBelowMinViewport ? APP_MIN_WIDTH : undefined,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflowX: "auto",
      }}
    >
      {!error && (
        <Box
          sx={{
            minWidth: APP_MIN_WIDTH,
            width: narrowLayout ? APP_MIN_WIDTH : "100%",
            flexShrink: 0,
            alignSelf: "stretch",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            transition: isResizing ? "none" : TRANSITIONS.LAYOUT_WIDTH,
            ...(narrowLayout && {
              minHeight: 0,
              flex: 1,
            }),
          }}
        >
          <MapLegend
            label={LEGEND_HEADING_LABEL}
            layers={legendLayers}
            isMapIdle={isMapIdle}
            selectedYear={selectedYear}
          />
          <Box sx={narrowLayout ? { marginTop: "auto" } : undefined}>
            <Timeline marks={marks} />
          </Box>
        </Box>
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
          zIndex: Z_INDEX.MAP,
          overflowX: "auto",
        }}
      >
        <ErrorBoundary>
          <MapView
            key={deviceKey}
            towns={filteredTowns}
            selectedYear={selectedYear}
            initialPosition={initialPosition}
            initialZoom={initialZoom}
            maxBounds={maxBounds}
            onFirstIdle={handleFirstIdle}
            showOverlayButtons={showOverlayButtons}
          />
        </ErrorBoundary>
        {showResizeSpinner && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
          >
            <LoadingSpinner message="Resizing map..." />
          </Box>
        )}
      </Box>
      {(isLoading || townsLoading) && (
        <LoadingSpinner message="Loading historical data..." />
      )}
    </Box>
  );
};

export default MapContainer;
