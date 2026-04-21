import React from "react";
import Map, { type MapProps, type MapRef } from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";

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
import { TownMarkers } from "./TownMarkers";
import { MapOverlays } from "./MapOverlays";

type MapCanvasStackProps = {
  isSplitBasemap: boolean;
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
}) => (
  <>
    {isSplitBasemap && (
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
      onMove={evt => {
        const z = evt.viewState.zoom;
        const ZOOM_SNAP_EPSILON = 1e-6;
        const atOrNearMin = z <= effectiveMinZoom + ZOOM_SNAP_EPSILON;
        const effectiveZoom = atOrNearMin ? effectiveMinZoom : z;
        handleMove({
          ...evt.viewState,
          zoom: effectiveZoom,
        });
      }}
      onLoad={onOverlayLoad}
      onIdle={onOverlayIdle}
      // Disable symbol/tile fade transitions so timeline `setData` updates do not
      // visually drop and re-fade labels on each year change.
      fadeDuration={0}
      onClick={e => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          handleMapFeatureClick(getMapFeatureName(feature.properties));
        }
      }}
      interactiveLayerIds={[`${MAP_LAYER_ID}-circle`]}
      canvasContextAttributes={
        isSplitBasemap
          ? { alpha: true, preserveDrawingBuffer }
          : { preserveDrawingBuffer }
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
      <MapLayer
        layerId={MAP_LAYER_ID}
        data={townsGeojson}
        mapStyleMode={mapStyleMode}
      />
      {mapReady && <TownMarkers towns={towns} selectedYear={selectedYear} />}
      <MapOverlays
        showOverlayButtons={showOverlayButtons}
        showZoomButtons={showZoomButtons}
        isTablet={isTablet}
        isMobile={isMobile}
      />
    </Map>
  </>
);
