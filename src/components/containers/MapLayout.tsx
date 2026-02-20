import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { ErrorBoundary } from "@/components/dev";
import { Legend, Timeline } from "@/components/controls";
import { MapView } from "@/components/map";
import { LoadingSpinner, ErrorOverlay } from "@/components/ui";
import {
  LEGEND_HEADING_LABEL,
  APP_MIN_WIDTH,
  Z_INDEX,
  TRANSITIONS,
} from "@/constants";
import { LayerItem, TimelineMark } from "@/common/types";
import { useApp } from "@/context/AppContext";
import { useInitialMapState } from "@/hooks/map";
import {
  useViewport,
  useNarrowLayout,
  useOverlayButtonsVisible,
} from "@/hooks/ui";
import { strings } from "@/locales";
import { calculateMapArea } from "@/utils/utils";
import {
  getInitialMapProps,
  getMapDeviceKey,
  useStableMapKey,
} from "./MapLayoutHelpers";

export interface MapLayoutProps {
  legendLayers: LayerItem[];
  marks: TimelineMark[];
  showDefaultMap?: boolean;
  townsLoading?: boolean;
}

/**
 * Map screen layout: legend, timeline, and map area.
 * Handles resize/remount overlays and initial map position from useInitialMapState.
 */
export const MapLayout: React.FC<MapLayoutProps> = ({
  legendLayers,
  marks,
  showDefaultMap,
  townsLoading,
}) => {
  const { towns, filteredTowns, selectedYear, isLoading, error, retry } =
    useApp();
  const viewport = useViewport();
  const theme = useTheme();
  const narrowLayout = useNarrowLayout(viewport.rawScreenWidth);
  const [isMapIdle, setIsMapIdle] = React.useState(false);
  const { showOverlayButtons, isResizing } =
    useOverlayButtonsVisible(isMapIdle);

  const deviceKey = useStableMapKey(viewport);
  const prevDeviceKeyRef = useRef(deviceKey);
  const [isRemounting, setIsRemounting] = useState(false);

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

  const mapArea = React.useMemo(
    () => calculateMapArea(viewport.screenWidth, viewport.screenHeight, theme),
    [viewport.screenWidth, viewport.screenHeight, theme]
  );
  const initialMapState = useInitialMapState(towns, mapArea);
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
          <Legend
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
          title={strings.errors.dataLoadingError}
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
            fallbackMapSize={mapArea}
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
            <LoadingSpinner message={strings.loading.resizingMap} />
          </Box>
        )}
      </Box>
      {(isLoading || townsLoading) && (
        <LoadingSpinner message={strings.loading.loadingHistoricalData} />
      )}
    </Box>
  );
};
