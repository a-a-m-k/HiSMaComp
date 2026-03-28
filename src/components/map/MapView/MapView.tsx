import React, { useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "@mui/material/styles";

import {
  DEFAULT_MAP_CONTAINER_PROPS,
  SPLIT_OVERLAY_TILE_OPTIONS,
  TILE_LOADING_OPTIONS,
} from "./constants";
import MapLayer from "./MapLayer/MapLayer";
import { MapOverlays } from "./MapOverlays";
import {
  getMapBaseStyle,
  getMapDescription,
  getPopulationOverlayStyle,
  handleMapFeatureClick,
  POPULATION_OVERLAY_STYLE_REVISION,
} from "@/utils/map";
import { getZoomToFitBounds } from "@/utils/mapZoom";
import { calculateMapArea } from "@/utils/utils";
import { MAP_LAYER_ID, MAP_RESET_CAMERA_EVENT } from "@/constants";
import { ZOOM_ANIMATION_DURATION_MS } from "@/constants/keyboard";
import { getMapStyles } from "@/constants/ui";
import { strings } from "@/locales";
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
} from "@/hooks/map";
import type { MapViewState } from "@/hooks/map";
import { isValidNumber } from "@/utils/zoom/zoomHelpers";
import { MapViewDarkBasemap } from "./MapViewDarkBasemap";
import { TownMarkers } from "./TownMarkers";
import { useMapStyleMode } from "@/context/MapStyleContext";
import { lightTheme } from "@/theme/theme";

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
}) => {
  const theme = useTheme();
  const { mode: mapStyleMode } = useMapStyleMode();
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

  const townsGeojson = useTownsGeoJSON(towns);

  useMapKeyboardShortcuts(
    mapRef,
    enableZoomControls,
    prefersReducedMotion ? 0 : ZOOM_ANIMATION_DURATION_MS
  );
  useMapKeyboardPanning(mapRef, containerRef, enableZoomControls);
  useNavigationControlAccessibility(showZoomButtons, containerRef);

  /** Fallback map size when container not yet measured (prop from parent, or local). */
  const fallbackMapSizeLocal = useMemo(
    () =>
      calculateMapArea(viewport.screenWidth, viewport.screenHeight, lightTheme),
    [viewport.screenWidth, viewport.screenHeight]
  );
  const fallbackMapSize = fallbackMapSizeProp ?? fallbackMapSizeLocal;

  /** Effective min zoom: when maxBounds is set, zoom that fits bounds in container (or fallback map size). */
  const effectiveMinZoom = useMemo(() => {
    if (!maxBounds) return safeProps.zoom;
    const bounds = {
      minLat: maxBounds[0][1],
      maxLat: maxBounds[1][1],
      minLng: maxBounds[0][0],
      maxLng: maxBounds[1][0],
    };
    const w = containerSize?.width ?? fallbackMapSize.effectiveWidth;
    const h = containerSize?.height ?? fallbackMapSize.effectiveHeight;
    const zoomToFit = getZoomToFitBounds(bounds, w, h);
    return Math.max(safeProps.zoom, zoomToFit);
  }, [maxBounds, containerSize, safeProps.zoom, fallbackMapSize]);

  React.useEffect(() => {
    const onResetCamera = () => {
      requestCameraFitTo({
        longitude: safeProps.longitude,
        latitude: safeProps.latitude,
        zoom: Math.max(safeProps.zoom, effectiveMinZoom),
      });
    };
    window.addEventListener(MAP_RESET_CAMERA_EVENT, onResetCamera);
    return () =>
      window.removeEventListener(MAP_RESET_CAMERA_EVENT, onResetCamera);
  }, [
    safeProps.longitude,
    safeProps.latitude,
    safeProps.zoom,
    effectiveMinZoom,
    requestCameraFitTo,
  ]);

  const { handleOverlayMapLoad, handleBasemapLoad } = useMapViewLibreEffects({
    mapRef,
    basemapMapRef,
    mapReady,
    isSplitBasemap,
    mapStyleMode,
    viewState,
    maxBounds,
  });

  const handleMapIdle = React.useCallback(() => {
    onFirstIdle?.();
    setMapReady(true);
  }, [onFirstIdle]);

  const mapDescription = useMemo(
    () => getMapDescription({ isMobile, isDesktop, mapStyleMode }),
    [isMobile, isDesktop, mapStyleMode]
  );

  const overlayMapStyle = useMemo(
    () => (isSplitBasemap ? getPopulationOverlayStyle() : getMapBaseStyle()),
    [isSplitBasemap, mapStyleMode, POPULATION_OVERLAY_STYLE_REVISION]
  );

  /**
   * Always use `viewState` for controlled camera props — never spread `cameraFitTarget` here.
   * Spreading the target would re-render the Map at the final position every frame and cancel
   * imperative flyTo/easeTo animations (making motion look instant or “static”).
   */
  const sharedViewProps = useMemo(
    () => ({
      ...viewState,
      ...(maxBounds && {
        maxBounds,
        maxBoundsViscosity: 1,
      }),
      minZoom: effectiveMinZoom,
      maxZoom: DEFAULT_MAP_CONTAINER_PROPS.maxZoom,
    }),
    [viewState, maxBounds, effectiveMinZoom]
  );

  const atMinZoom = viewState.zoom <= effectiveMinZoom;

  const interactiveMapChildren = (
    <>
      {mapReady && (
        <>
          <MapLayer
            layerId={MAP_LAYER_ID}
            data={townsGeojson}
            selectedYear={selectedYear}
            mapStyleMode={mapStyleMode}
          />
          <TownMarkers towns={towns} selectedYear={selectedYear} />
        </>
      )}
      <MapOverlays
        showOverlayButtons={showOverlayButtons}
        showZoomButtons={showZoomButtons}
        isTablet={isTablet}
        isMobile={isMobile}
      />
    </>
  );

  return (
    <div
      data-zoom-at-min={atMinZoom ? "" : undefined}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <style>{getMapStyles(theme)}</style>
      <div id="map-description" className="sr-only">
        {mapDescription}
      </div>
      <div
        id="map-container-area"
        ref={containerRef}
        role="application"
        aria-label={strings.map.ariaLabel}
        aria-describedby="map-description"
        data-map-appearance={mapStyleMode}
        data-overlay-buttons-hidden={showOverlayButtons ? undefined : ""}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          outline: "none",
        }}
        tabIndex={0}
      >
        {isSplitBasemap && (
          <MapViewDarkBasemap
            basemapRef={basemapMapRef}
            sharedViewProps={sharedViewProps}
            onLoad={handleBasemapLoad}
          />
        )}
        <Map
          ref={mapRef}
          {...sharedViewProps}
          onMove={evt => {
            const z = evt.viewState.zoom;
            const ZOOM_SNAP_EPSILON = 1e-6;
            const atOrNearMin = z <= effectiveMinZoom + ZOOM_SNAP_EPSILON;
            const effectiveZoom = atOrNearMin ? effectiveMinZoom : z;
            handleMove({
              viewState: {
                ...evt.viewState,
                zoom: effectiveZoom,
              },
            });
          }}
          onLoad={handleOverlayMapLoad}
          onIdle={handleMapIdle}
          fadeDuration={isSplitBasemap ? 0 : undefined}
          onClick={e => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              handleMapFeatureClick(feature.properties?.name);
            }
          }}
          interactiveLayerIds={[`${MAP_LAYER_ID}-circle`]}
          canvasContextAttributes={
            isSplitBasemap
              ? { alpha: true, preserveDrawingBuffer: true }
              : { preserveDrawingBuffer: true }
          }
          style={
            isSplitBasemap
              ? {
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                }
              : { width: "100%", height: "100%" }
          }
          mapStyle={overlayMapStyle}
          mapLib={MaplibreGL}
          attributionControl={false}
          cursor="pointer"
          keyboard={enableZoomControls}
          scrollZoom={enableZoomControls}
          touchZoomRotate={true}
          dragPan={true}
          cancelPendingTileRequestsWhileZooming={true}
          maxTileCacheZoomLevels={
            isSplitBasemap
              ? SPLIT_OVERLAY_TILE_OPTIONS.maxTileCacheZoomLevels
              : TILE_LOADING_OPTIONS.maxTileCacheZoomLevels
          }
          maxTileCacheSize={
            isSplitBasemap
              ? SPLIT_OVERLAY_TILE_OPTIONS.maxTileCacheSize
              : TILE_LOADING_OPTIONS.maxTileCacheSize
          }
        >
          {interactiveMapChildren}
        </Map>
      </div>
    </div>
  );
};

export default MapView;
