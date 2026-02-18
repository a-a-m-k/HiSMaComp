import React, { useMemo, useRef, Suspense, useState } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "@mui/material/styles";

import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import MapLayer from "./MapLayer/MapLayer";
import {
  getTerrainStyle,
  getMapDescription,
  handleMapFeatureClick,
} from "@/utils/map";
import { MAP_LAYER_ID } from "@/constants";
import { ScreenshotButtonContainer } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";
import { getMapStyles } from "@/constants/ui";
import { useApp } from "@/context/AppContext";
import { useResponsive, useScreenDimensions } from "@/hooks/ui";
import {
  useMapViewState,
  useProgrammaticMapFit,
  useMapKeyboardShortcuts,
  useMapKeyboardPanning,
  useNavigationControlAccessibility,
  useTownsGeoJSON,
} from "@/hooks/map";
import type { MapViewState } from "@/hooks/map";
import { isValidNumber } from "@/utils/zoom/zoomHelpers";
import { TownMarkers } from "./TownMarkers";

/**
 * Loaded lazily because it is not rendered on mobile and is non-critical for
 * first paint.
 */
const ScreenshotButton = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);

interface MapViewComponentProps {
  initialPosition: Pick<MapViewState, "longitude" | "latitude">;
  initialZoom: number;
  onFirstIdle?: () => void;
}

/**
 * Main interactive map surface: renders base map, layers, markers, and map
 * controls with accessibility and keyboard support.
 */
const MapView: React.FC<MapViewComponentProps> = ({
  initialPosition: { longitude, latitude },
  initialZoom,
  onFirstIdle,
}) => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const { filteredTowns } = useApp();
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const enableZoomControls = !isMobile;
  const showZoomButtons = isDesktop;

  const safeProps = useMemo(
    () => ({
      longitude: isValidNumber(longitude) ? longitude : 0,
      latitude: isValidNumber(latitude) ? latitude : 0,
      zoom: isValidNumber(initialZoom) && initialZoom >= 0 ? initialZoom : 4,
    }),
    [longitude, latitude, initialZoom]
  );

  const {
    viewState,
    handleMove,
    programmaticTarget,
    onProgrammaticAnimationEnd,
    syncViewStateFromMap,
    programmaticTargetRefForSync,
  } = useMapViewState({
    longitude: safeProps.longitude,
    latitude: safeProps.latitude,
    zoom: safeProps.zoom,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
  });

  const isProgrammaticAnimatingRef = useProgrammaticMapFit({
    mapRef,
    programmaticTarget,
    onProgrammaticAnimationEnd,
    syncViewStateFromMap,
    programmaticTargetRefForSync,
  });

  const townsGeojson = useTownsGeoJSON(filteredTowns);

  useMapKeyboardShortcuts(mapRef, enableZoomControls);
  useMapKeyboardPanning(mapRef, containerRef, enableZoomControls);
  useNavigationControlAccessibility(showZoomButtons, containerRef, mapRef);

  /**
   * Conservative tile-loading: reduce prefetch so viewport loads first.
   */
  const handleMapLoad = React.useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (!map) return;

    const mapWithPrefetchControl = map as typeof map & {
      setPrefetchZoomDelta?: (delta: number) => void;
    };
    mapWithPrefetchControl.setPrefetchZoomDelta?.(0);
  }, []);

  /**
   * Defer non-critical overlays until the map reaches its first idle state so
   * visible tiles can finish first.
   */
  const handleMapIdle = React.useCallback(() => {
    onFirstIdle?.();
    setMapReady(true);
  }, [onFirstIdle]);

  const mapDescription = useMemo(
    () => getMapDescription({ isMobile, isDesktop }),
    [isMobile, isDesktop]
  );

  return (
    <>
      <style>{getMapStyles(theme)}</style>
      <div id="map-description" className="sr-only">
        {mapDescription}
      </div>
      <div
        id="map-container-area"
        ref={containerRef}
        role="application"
        aria-label="Interactive historical map showing town populations. Click on the map or press Tab to focus, then use arrow keys to pan."
        aria-describedby="map-description"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          outline: "none",
        }}
        tabIndex={0}
      >
        <Map
          ref={mapRef}
          {...(programmaticTarget ?? viewState)}
          onMove={evt => {
            if (!isProgrammaticAnimatingRef.current) handleMove(evt);
          }}
          onLoad={handleMapLoad}
          onIdle={handleMapIdle}
          onClick={e => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              handleMapFeatureClick(feature.properties?.name);
            }
          }}
          interactiveLayerIds={[`${MAP_LAYER_ID}-circle`]}
          canvasContextAttributes={{ preserveDrawingBuffer: true }}
          minZoom={safeProps.zoom}
          maxZoom={DEFAULT_MAP_CONTAINER_PROPS.maxZoom}
          style={{ width: "100%", height: "100%" }}
          mapStyle={getTerrainStyle()}
          mapLib={MaplibreGL}
          attributionControl={false}
          cursor="pointer"
          keyboard={enableZoomControls}
          scrollZoom={enableZoomControls}
          touchZoomRotate={true}
          dragPan={true}
          cancelPendingTileRequestsWhileZooming={true}
        >
          {mapReady && (
            <>
              <MapLayer layerId={MAP_LAYER_ID} data={townsGeojson} />
              <TownMarkers towns={filteredTowns} />
            </>
          )}
          {!isMobile && (
            <ScreenshotButtonContainer>
              <Suspense fallback={null}>
                <ScreenshotButton />
              </Suspense>
            </ScreenshotButtonContainer>
          )}
          {showZoomButtons && <NavigationControl position="bottom-right" />}
        </Map>
      </div>
    </>
  );
};

export default MapView;
