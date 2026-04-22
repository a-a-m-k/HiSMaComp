import React, { useMemo, useRef, useState } from "react";
import { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "@mui/material/styles";

import {
  getTerrainStyle,
  getMapDescription,
  getPopulationOverlayStyle,
} from "@/utils/map";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { getMapStyles } from "@/constants/ui";
import { useViewport, usePrefersReducedMotion } from "@/hooks/ui";
import type { Town } from "@/common/types";
import {
  useMapViewState,
  useAnimateCameraToFit,
  useMapKeyboardShortcuts,
  useMapKeyboardPanning,
  useNavigationControlAccessibility,
  useTownsGeoJSON,
  useMapContainerResize,
  useMapViewLibreEffects,
  useMapStyleSwitchLoader,
} from "@/hooks/map";
import type { MapViewState } from "@/hooks/map";
import { MapCanvasStack } from "./MapCanvasStack";
import { MapViewShell } from "./MapViewShell";
import { useMapStyleMode } from "@/context/MapStyleContext";
import { useMapCameraLifecycle } from "./useMapCameraLifecycle";
import { useMapViewConfig, useSharedViewProps } from "./useMapViewConfig";

type MapLibreMaxBounds = [[number, number], [number, number]];

interface MapViewComponentProps {
  towns: Town[];
  selectedYear: number;
  initialPosition: Pick<MapViewState, "longitude" | "latitude">;
  initialZoom: number;
  maxBounds?: MapLibreMaxBounds;
  fallbackMapSize?: { effectiveWidth: number; effectiveHeight: number };
  onFirstIdle?: () => void;
  showOverlayButtons?: boolean;
  isResizing?: boolean;
}

const MapView: React.FC<MapViewComponentProps> = ({
  towns,
  selectedYear,
  initialPosition: { longitude, latitude },
  initialZoom,
  maxBounds,
  fallbackMapSize: fallbackMapSizeProp,
  onFirstIdle,
  showOverlayButtons = true,
  isResizing = false,
}) => {
  const theme = useTheme();
  const { mode: mapStyleMode, toggleMode: toggleBasemapMode } =
    useMapStyleMode();
  const viewport = useViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isMobile, isDesktop, isTablet } = viewport;
  const mapRef = useRef<MapRef>(null);
  const basemapMapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const isSplitBasemap = mapStyleMode === "dark";
  const containerSize = useMapContainerResize(
    containerRef,
    mapRef,
    isSplitBasemap ? basemapMapRef : undefined
  );
  const enableZoomControls = !isMobile;
  const showZoomButtons = isDesktop;
  const { safeProps, effectiveMinZoom } = useMapViewConfig({
    longitude,
    latitude,
    initialZoom,
    maxBounds,
    containerSize,
    fallbackMapSize: fallbackMapSizeProp,
    screenWidth: viewport.screenWidth,
    screenHeight: viewport.screenHeight,
    theme,
  });

  const {
    viewState,
    handleMove,
    cameraFitTarget,
    onCameraFitComplete,
    syncViewStateFromMap,
    cameraFitTargetRefForSync,
    requestCameraFitTo,
  } = useMapViewState({
    longitude: safeProps.longitude,
    latitude: safeProps.latitude,
    zoom: safeProps.zoom,
  });

  useAnimateCameraToFit({
    mapRef,
    secondaryMapRef: isSplitBasemap ? basemapMapRef : undefined,
    cameraFitTarget,
    onCameraFitComplete,
    syncViewStateFromMap,
    cameraFitTargetRefForSync,
    prefersReducedMotion,
  });

  const townsGeojson = useTownsGeoJSON(towns, selectedYear);

  useMapKeyboardShortcuts(
    mapRef,
    enableZoomControls,
    prefersReducedMotion ? 0 : ZOOM_ANIMATION_DURATION_MS,
    toggleBasemapMode
  );
  useMapKeyboardPanning(mapRef, containerRef, enableZoomControls);
  useNavigationControlAccessibility(showZoomButtons, containerRef);

  useMapCameraLifecycle({
    safeProps,
    effectiveMinZoom,
    requestCameraFitTo,
    viewState,
    mapReady,
    isResizing,
    containerSize,
  });

  const { handleOverlayMapLoad, handleBasemapLoad } = useMapViewLibreEffects({
    mapRef,
    basemapMapRef,
    mapReady,
    isSplitBasemap,
    viewState,
    maxBounds,
  });

  const { isStyleSwitching, onOverlayIdle, onBasemapIdle } =
    useMapStyleSwitchLoader({
      mapStyleMode,
      onFirstIdle,
    });

  const handleMapIdle = React.useCallback(() => {
    setMapReady(true);
    onOverlayIdle();
  }, [onOverlayIdle]);

  const mapDescription = useMemo(
    () => getMapDescription({ isMobile, isDesktop, mapStyleMode }),
    [isMobile, isDesktop, mapStyleMode]
  );

  const overlayMapStyle = useMemo(
    () => (isSplitBasemap ? getPopulationOverlayStyle() : getTerrainStyle()),
    [isSplitBasemap]
  );
  const sharedViewProps = useSharedViewProps(
    viewState,
    maxBounds,
    effectiveMinZoom
  );

  const atMinZoom = viewState.zoom <= effectiveMinZoom;
  const mapStyles = useMemo(() => getMapStyles(theme), [theme]);

  return (
    <MapViewShell
      mapStyles={mapStyles}
      atMinZoom={atMinZoom}
      mapDescription={mapDescription}
      mapStyleMode={mapStyleMode}
      showOverlayButtons={showOverlayButtons}
      isStyleSwitching={isStyleSwitching}
      mapReady={mapReady}
      containerRef={containerRef}
    >
      <MapCanvasStack
        isSplitBasemap={isSplitBasemap}
        basemapMapRef={basemapMapRef}
        mapRef={mapRef}
        sharedViewProps={sharedViewProps}
        onBasemapLoad={handleBasemapLoad}
        onBasemapIdle={onBasemapIdle}
        // WebGL needs this at context creation time; toggling later may not
        // affect screenshot output in all browsers.
        preserveDrawingBuffer={true}
        effectiveMinZoom={effectiveMinZoom}
        handleMove={nextViewState => handleMove({ viewState: nextViewState })}
        onOverlayLoad={handleOverlayMapLoad}
        onOverlayIdle={handleMapIdle}
        overlayMapStyle={overlayMapStyle}
        enableZoomControls={enableZoomControls}
        townsGeojson={townsGeojson}
        mapStyleMode={mapStyleMode}
        mapReady={mapReady}
        towns={towns}
        selectedYear={selectedYear}
        showOverlayButtons={showOverlayButtons}
        showZoomButtons={showZoomButtons}
        isTablet={isTablet}
        isMobile={isMobile}
      />
    </MapViewShell>
  );
};

export default MapView;
