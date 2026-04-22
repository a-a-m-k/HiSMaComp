import React, { Suspense, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";

import { ErrorBoundary } from "@/components/dev";
import { Legend, Timeline } from "@/components/controls";
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
import { lightTheme } from "@/theme/theme";
import { calculateMapArea } from "@/utils/mapZoom";
import { getInitialMapProps, useStableMapKey } from "./MapLayoutHelpers";

const LazyMapView = React.lazy(
  () => import("@/components/map/MapView/MapView")
);

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

  /** `lightTheme` only: spacing/breakpoints match `darkTheme`; avoids refitting when toggling basemap mode. */
  const mapArea = React.useMemo(
    () =>
      calculateMapArea(viewport.screenWidth, viewport.screenHeight, lightTheme),
    [viewport.screenWidth, viewport.screenHeight]
  );
  const initialMapState = useInitialMapState(towns, mapArea);
  const useDefaultView =
    (showDefaultMap ?? false) ||
    (isLoading && filteredTowns.length === 0) ||
    !initialMapState.center;
  const { initialPosition, initialZoom } = getInitialMapProps(
    useDefaultView,
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
          <Suspense
            fallback={<LoadingSpinner message={strings.loading.default} />}
          >
            <LazyMapView
              key={deviceKey}
              towns={towns}
              selectedYear={selectedYear}
              initialPosition={initialPosition}
              initialZoom={initialZoom}
              maxBounds={maxBounds}
              fallbackMapSize={mapArea}
              onFirstIdle={handleFirstIdle}
              showOverlayButtons={showOverlayButtons}
              isResizing={isResizing}
            />
          </Suspense>
        </ErrorBoundary>
        {!error && !isMapIdle && (
          <Box
            id="map-lcp-shell"
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(245,247,250,0.95) 0%, rgba(245,247,250,0.78) 55%, rgba(245,247,250,0.5) 100%)",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: 1,
                textAlign: "center",
              }}
            >
              <Box
                component="p"
                sx={{
                  m: 0,
                  fontSize: { xs: 20, sm: 24 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "text.primary",
                }}
              >
                European population
              </Box>
            </Box>
          </Box>
        )}
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
      {/* Only show full-screen "loading historical data" when we have no data yet (initial load or first year). */}
      {(townsLoading || (isLoading && filteredTowns.length === 0)) && (
        <LoadingSpinner message={strings.loading.loadingHistoricalData} />
      )}
    </Box>
  );
};
