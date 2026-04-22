import React, { type RefObject } from "react";
import Map, { type MapProps, type MapRef } from "react-map-gl/maplibre";

import { getTerrainDarkStyle } from "@/utils/map";

import { SPLIT_BASEMAP_TILE_OPTIONS } from "./constants";

const maplibreGl = import("maplibre-gl");

/** Camera + bounds props aligned with the interactive overlay (no `mapStyle`). */
export type MapViewSharedCameraProps = Pick<
  MapProps,
  "longitude" | "latitude" | "zoom" | "minZoom" | "maxZoom" | "maxBounds"
> & { maxBoundsViscosity?: number };

export interface MapViewDarkBasemapProps {
  basemapRef: RefObject<MapRef | null>;
  sharedViewProps: MapViewSharedCameraProps;
  onLoad: () => void;
  onIdle?: () => void;
  preserveDrawingBuffer?: boolean;
}

/**
 * Full-terrain underlay for dark mode (`terrain-dark.json`). Overlay map draws borders + population.
 */
export const MapViewDarkBasemap: React.FC<MapViewDarkBasemapProps> = ({
  basemapRef,
  sharedViewProps,
  onLoad,
  onIdle,
  preserveDrawingBuffer = false,
}) => (
  <div
    data-map-basemap=""
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 0,
      // Keep the wrapper simple so html2canvas reliably captures the underlay
      // canvas during dark-mode screenshot export.
      pointerEvents: "auto",
    }}
  >
    <Map
      ref={basemapRef as React.Ref<MapRef>}
      {...sharedViewProps}
      mapStyle={getTerrainDarkStyle()}
      mapLib={maplibreGl}
      attributionControl={false}
      style={{ width: "100%", height: "100%" }}
      interactive={false}
      fadeDuration={0}
      cancelPendingTileRequestsWhileZooming={true}
      maxTileCacheZoomLevels={SPLIT_BASEMAP_TILE_OPTIONS.maxTileCacheZoomLevels}
      maxTileCacheSize={SPLIT_BASEMAP_TILE_OPTIONS.maxTileCacheSize}
      onLoad={onLoad}
      onIdle={onIdle}
      canvasContextAttributes={{ preserveDrawingBuffer }}
    />
  </div>
);
