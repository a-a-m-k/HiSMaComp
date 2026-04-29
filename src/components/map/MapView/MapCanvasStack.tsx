import React, { Suspense, useCallback, useMemo } from "react";
import Map, { type MapProps, type MapRef } from "react-map-gl/maplibre";

import { MAP_LAYER_ID } from "@/constants";
import type { Town } from "@/common/types";
import type { MapViewState } from "@/hooks/map";
import { getMapFeatureName, handleMapFeatureClick } from "@/utils/map";

import { SPLIT_OVERLAY_TILE_OPTIONS, TILE_LOADING_OPTIONS } from "./constants";
import {
  MapViewDarkBasemap,
  type MapViewSharedCameraProps,
} from "./MapViewDarkBasemap";
import MapLayer from "./MapLayer/MapLayer";
import { maplibreGl } from "./maplibreRuntime";
import { useDeferredOverlayActivation } from "./useDeferredOverlayActivation";

const TownMarkers = React.lazy(() =>
  import("./TownMarkers").then(module => ({ default: module.TownMarkers }))
);
const MapOverlays = React.lazy(() =>
  import("./MapOverlays").then(module => ({ default: module.MapOverlays }))
);
const ZOOM_SNAP_EPSILON = 1e-6;

type MapCanvasStackProps = {
  isSplitBasemap: boolean;
  mapLoaded: boolean;
  basemapMapRef: React.RefObject<MapRef | null>;
  mapRef: React.MutableRefObject<MapRef | null>;
  sharedViewProps: MapViewSharedCameraProps;
  onBasemapLoad: () => void;
  onBasemapIdle?: () => void;
  preserveDrawingBuffer: boolean;
  effectiveMinZoom: number;
  handleMove: (nextViewState: MapViewState) => void;
  onOverlayLoad: () => void;
  onOverlayIdle: () => void;
  overlayMapStyle: NonNullable<MapProps["mapStyle"]>;
  enableZoomControls: boolean;
  townsGeojson: GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    GeoJSON.GeoJsonProperties
  >;
  mapStyleMode: "light" | "dark";
  mapReady: boolean;
  towns: Town[];
  selectedYear: number;
  showOverlayButtons: boolean;
  showZoomButtons: boolean;
  isTablet: boolean;
  isMobile: boolean;
};

export const MapCanvasStack: React.FC<MapCanvasStackProps> = ({
  isSplitBasemap,
  mapLoaded,
  basemapMapRef,
  mapRef,
  sharedViewProps,
  onBasemapLoad,
  onBasemapIdle,
  preserveDrawingBuffer,
  effectiveMinZoom,
  handleMove,
  onOverlayLoad,
  onOverlayIdle,
  overlayMapStyle,
  enableZoomControls,
  townsGeojson,
  mapStyleMode,
  mapReady,
  towns,
  selectedYear,
  showOverlayButtons,
  showZoomButtons,
  isTablet,
  isMobile,
}) => {
  // Delay dark underlay mount until overlay map has loaded.
  // This keeps marker-bearing overlay initialization as the first priority path.
  const shouldRenderDarkBasemap = isSplitBasemap && mapLoaded;
  const shouldRenderOverlays = useDeferredOverlayActivation(mapReady);

  const handleOverlayMapMove = useCallback(
    (evt: { viewState: MapViewState }) => {
      const z = evt.viewState.zoom;
      const atOrNearMin = z <= effectiveMinZoom + ZOOM_SNAP_EPSILON;
      const effectiveZoom = atOrNearMin ? effectiveMinZoom : z;
      handleMove({
        ...evt.viewState,
        zoom: effectiveZoom,
      });
    },
    [effectiveMinZoom, handleMove]
  );

  const handleOverlayMapClick = useCallback(
    (e: { features?: Array<{ properties?: GeoJSON.GeoJsonProperties }> }) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      handleMapFeatureClick(getMapFeatureName(feature.properties));
    },
    []
  );

  const mapCanvasContextAttributes = useMemo(
    () =>
      isSplitBasemap
        ? { alpha: true, preserveDrawingBuffer }
        : { preserveDrawingBuffer },
    [isSplitBasemap, preserveDrawingBuffer]
  );

  const mapCanvasStyle = useMemo(
    () =>
      isSplitBasemap
        ? {
            position: "absolute" as const,
            inset: 0,
            zIndex: 1,
            width: "100%",
            height: "100%",
          }
        : { width: "100%", height: "100%" },
    [isSplitBasemap]
  );

  const mapTileCacheOptions = useMemo(
    () => (isSplitBasemap ? SPLIT_OVERLAY_TILE_OPTIONS : TILE_LOADING_OPTIONS),
    [isSplitBasemap]
  );

  const interactiveLayerIds = useMemo(() => [`${MAP_LAYER_ID}-circle`], []);

  const mapInteractionProps = useMemo(() => {
    return {
      keyboard: enableZoomControls,
      scrollZoom: enableZoomControls,
      touchZoomRotate: true,
      dragPan: true,
    };
  }, [enableZoomControls]);

  const mapPerformanceProps = useMemo(() => {
    return {
      cancelPendingTileRequestsWhileZooming: true,
      maxTileCacheZoomLevels: mapTileCacheOptions.maxTileCacheZoomLevels,
      maxTileCacheSize: mapTileCacheOptions.maxTileCacheSize,
    };
  }, []);
  const { keyboard, scrollZoom, touchZoomRotate, dragPan } =
    mapInteractionProps;
  const {
    cancelPendingTileRequestsWhileZooming,
    maxTileCacheZoomLevels,
    maxTileCacheSize,
  } = mapPerformanceProps;

  return (
    <>
      {shouldRenderDarkBasemap && (
        <MapViewDarkBasemap
          basemapRef={basemapMapRef}
          sharedViewProps={sharedViewProps}
          onLoad={onBasemapLoad}
          onIdle={onBasemapIdle}
          preserveDrawingBuffer={preserveDrawingBuffer}
        />
      )}
      <Map
        ref={mapRef}
        {...sharedViewProps}
        // Keep town-label collision within the GeoJSON source so basemap symbols
        // cannot suppress all custom town labels.
        crossSourceCollisions={false}
        onMove={handleOverlayMapMove}
        onLoad={onOverlayLoad}
        onIdle={onOverlayIdle}
        // Disable symbol/tile fade transitions so timeline `setData` updates do not
        // visually drop and re-fade labels on each year change.
        fadeDuration={0}
        onClick={handleOverlayMapClick}
        interactiveLayerIds={interactiveLayerIds}
        canvasContextAttributes={mapCanvasContextAttributes}
        style={mapCanvasStyle}
        mapStyle={overlayMapStyle}
        mapLib={maplibreGl}
        attributionControl={false}
        cursor="pointer"
        keyboard={keyboard}
        scrollZoom={scrollZoom}
        touchZoomRotate={touchZoomRotate}
        dragPan={dragPan}
        cancelPendingTileRequestsWhileZooming={
          cancelPendingTileRequestsWhileZooming
        }
        maxTileCacheZoomLevels={maxTileCacheZoomLevels}
        maxTileCacheSize={maxTileCacheSize}
      >
        <MapLayer
          layerId={MAP_LAYER_ID}
          data={townsGeojson}
          mapStyleMode={mapStyleMode}
        />
        {mapReady && (
          <Suspense fallback={null}>
            <TownMarkers towns={towns} selectedYear={selectedYear} />
          </Suspense>
        )}
        {shouldRenderOverlays && (
          <Suspense fallback={null}>
            <MapOverlays
              showOverlayButtons={showOverlayButtons}
              showZoomButtons={showZoomButtons}
              isTablet={isTablet}
              isMobile={isMobile}
            />
          </Suspense>
        )}
      </Map>
    </>
  );
};
