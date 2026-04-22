import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";

import { LoadingSpinner, ErrorOverlay } from "@/components/ui";
import { APP_MIN_WIDTH } from "@/constants";
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
import { LegendPanel } from "./LegendPanel";
import { MapStage } from "./MapStage";
import {
  MAP_ACTIVATION_MARK,
  MAP_ACTIVATION_TO_IDLE_MEASURE,
  MAP_FIRST_IDLE_MARK,
  markPerformance,
  measurePerformance,
  useMapActivationGate,
} from "./useMapActivationGate";

export interface MapLayoutProps {
  legendLayers: LayerItem[];
  marks: TimelineMark[];
  showDefaultMap?: boolean;
  townsLoading?: boolean;
}

/**
 * Map screen layout with legend, timeline, and map canvas.
 * Also manages responsive remount overlays and initial map positioning.
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
  const { isMapActivated, mapMountGateRef } = useMapActivationGate();

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
    markPerformance(MAP_FIRST_IDLE_MARK);
    measurePerformance(
      MAP_ACTIVATION_TO_IDLE_MEASURE,
      MAP_ACTIVATION_MARK,
      MAP_FIRST_IDLE_MARK
    );
    setIsMapIdle(true);
    setIsRemounting(false);
  }, []);

  /**
   * Use `lightTheme` for layout math only; spacing/breakpoints match `darkTheme`,
   * so toggling basemap mode does not trigger a refit.
   */
  const mapArea = React.useMemo(
    () =>
      calculateMapArea(viewport.screenWidth, viewport.screenHeight, lightTheme),
    [viewport.screenWidth, viewport.screenHeight]
  );
  const initialMapState = useInitialMapState(towns, mapArea);
  const shouldUseDefaultView =
    (showDefaultMap ?? false) ||
    (isLoading && filteredTowns.length === 0) ||
    !initialMapState.center;
  const { initialPosition, initialZoom } = getInitialMapProps(
    shouldUseDefaultView,
    initialMapState
  );
  const showHistoricalLoadingOverlay =
    townsLoading || (isLoading && filteredTowns.length === 0);

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
      <LegendPanel
        hasError={Boolean(error)}
        narrowLayout={narrowLayout}
        isResizing={isResizing}
        legendLayers={legendLayers}
        selectedYear={selectedYear}
        isMapIdle={isMapIdle}
        marks={marks}
      />
      {error && (
        <ErrorOverlay
          title={strings.errors.dataLoadingError}
          message={error}
          onRetry={retry}
        />
      )}
      <MapStage
        mapMountGateRef={mapMountGateRef}
        isMapActivated={isMapActivated}
        deviceKey={deviceKey}
        towns={towns}
        selectedYear={selectedYear}
        initialPosition={initialPosition}
        initialZoom={initialZoom}
        maxBounds={maxBounds}
        mapArea={mapArea}
        handleFirstIdle={handleFirstIdle}
        showOverlayButtons={showOverlayButtons}
        isResizing={isResizing}
        isMapIdle={isMapIdle}
        showResizeSpinner={showResizeSpinner}
        hasError={Boolean(error)}
      />
      {/* Show full-screen data loading only when no towns are currently renderable. */}
      {showHistoricalLoadingOverlay && (
        <LoadingSpinner message={strings.loading.loadingHistoricalData} />
      )}
    </Box>
  );
};
