import React, { useMemo, useRef, Suspense, useState } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl/maplibre";
// MapLibre GL: In production, loaded from CDN (externalized by Vite)
// In development, imported normally from node_modules
// When externalized, Vite replaces maplibre-gl imports with window.maplibregl
import type * as MaplibreGLType from "maplibre-gl";

declare global {
  interface Window {
    maplibregl?: typeof MaplibreGLType;
  }
}

// Import maplibre-gl - Vite will handle externalization in production
// In production: Vite replaces this with window.maplibregl (from CDN)
// In development: Normal import from node_modules
import MaplibreGLDefault from "maplibre-gl";

// Use CDN global if available (production), otherwise use imported module (development)
// When externalized, Vite replaces the import above with the global, so this fallback
// is only used in development
const MaplibreGL =
  typeof window !== "undefined" && window.maplibregl
    ? window.maplibregl
    : MaplibreGLDefault;
import { useTheme } from "@mui/material/styles";

import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import MapLayer from "./MapLayer/MapLayer";
import { getTerrainStyle } from "@/utils/map";
import { MAP_LAYER_ID } from "@/constants";
import { ScreenshotButtonContainer } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";

// Lazy load ScreenshotButton as it's non-critical and only shown on non-mobile devices
const ScreenshotButton = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);
import {
  getNavigationControlStyles,
  getMapContainerStyles,
} from "@/constants/ui";
import { useApp } from "@/context/AppContext";
import { useResponsive, useScreenDimensions } from "@/hooks/ui";
import {
  useMapViewState,
  useMapKeyboardShortcuts,
  useMapKeyboardPanning,
  useNavigationControlAccessibility,
  useTownsGeoJSON,
} from "@/hooks/map";
import { isValidNumber } from "@/utils/zoom/zoomHelpers";
import { TownMarkers } from "./TownMarkers";
import { handleMapFeatureClick } from "@/utils/map";
import { logger } from "@/utils/logger";

interface MapViewComponentProps {
  initialPosition: { longitude: number; latitude: number };
  initialZoom: number;
}

const MapView: React.FC<MapViewComponentProps> = ({
  initialPosition: { longitude, latitude },
  initialZoom,
}) => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const { filteredTowns } = useApp();
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  const safeProps = useMemo(
    () => ({
      longitude: isValidNumber(longitude) ? longitude : 0,
      latitude: isValidNumber(latitude) ? latitude : 0,
      zoom: isValidNumber(initialZoom) && initialZoom >= 0 ? initialZoom : 4,
    }),
    [longitude, latitude, initialZoom]
  );

  const { viewState, handleMove } = useMapViewState({
    longitude: safeProps.longitude,
    latitude: safeProps.latitude,
    zoom: safeProps.zoom,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
  });

  const townsGeojson = useTownsGeoJSON(filteredTowns);

  useMapKeyboardShortcuts(mapRef, isDesktop);
  useMapKeyboardPanning(mapRef, containerRef, isDesktop);
  useNavigationControlAccessibility(isMobile, containerRef);

  /**
   * Optimizes tile loading to prioritize visible tiles over off-screen tiles.
   * Uses device-aware settings: more aggressive optimizations for mobile devices
   * with limited memory and slower connections.
   *
   * MapLibre GL already prioritizes visible tiles by default, but we can further
   * optimize by reducing cache sizes and parallel requests to ensure visible tiles
   * get priority in the request queue.
   *
   * Note: This accesses internal MapLibre GL properties which are not part of the
   * public API. These optimizations may need adjustment if MapLibre GL internals change.
   *
   * @see https://maplibre.org/maplibre-gl-js-docs/api/
   */
  const handleMapLoad = React.useCallback(() => {
    if (!mapRef.current) return;

    try {
      const map = mapRef.current.getMap();
      if (!map) return;

      // Mark map as ready for LCP - this allows non-critical features to load
      setMapReady(true);

      // Determine device type once to avoid redundant checks
      const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

      // Device-aware optimization settings (defaults: cache=50, parallel=16, perTile=higher)
      // Mobile: Most aggressive (limited memory, slower connections)
      // Tablet: Moderate (balanced)
      // Desktop: Balanced (more resources available)
      const optimizationSettings = {
        mobile: { cache: 20, parallel: 4, perTile: 1 },
        tablet: { cache: 25, parallel: 5, perTile: 2 },
        desktop: { cache: 30, parallel: 6, perTile: 2 },
      } as const;

      const settings = optimizationSettings[deviceType];

      // Type assertion to access internal MapLibre GL properties for optimization
      // These are internal implementation details, but stable enough for optimization
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapInstance = map as any;

      // Reduce tile cache size to limit off-screen tiles (default: 50)
      if (
        "_maxTileCacheSize" in mapInstance &&
        typeof mapInstance._maxTileCacheSize === "number"
      ) {
        mapInstance._maxTileCacheSize = settings.cache;
      }

      // Reduce parallel image requests to prioritize visible tiles (default: 16)
      if (
        "_maxParallelImageRequests" in mapInstance &&
        typeof mapInstance._maxParallelImageRequests === "number"
      ) {
        mapInstance._maxParallelImageRequests = settings.parallel;
      }

      // Configure request manager to limit concurrent requests per tile
      const requestManager = mapInstance._requestManager;
      if (
        requestManager &&
        typeof requestManager === "object" &&
        "maxRequestsPerTile" in requestManager &&
        typeof requestManager.maxRequestsPerTile === "number"
      ) {
        requestManager.maxRequestsPerTile = settings.perTile;
      }
    } catch (error) {
      // Gracefully handle errors - tile loading optimization is non-critical
      // MapLibre GL will still work with default settings
      logger.warn("Failed to optimize tile loading configuration:", error);
    }
  }, [isMobile, isTablet, isDesktop]);

  return (
    <>
      <style>{getNavigationControlStyles(theme)}</style>
      <style>{getMapContainerStyles()}</style>
      <div id="map-description" className="sr-only">
        Interactive map displaying European towns and their populations. Use Tab
        to navigate controls: Timeline{!isMobile ? ", Save button" : ""}
        {isDesktop ? ", Zoom controls" : ""}, map area, and town markers. Click
        on the map or press Tab to focus the map area, then use arrow keys to
        pan. When a town marker is focused, use arrow keys to navigate between
        markers.
        {!isMobile ? " Press Ctrl+S or Cmd+S to save the map as an image." : ""}
        {isDesktop
          ? " Press Ctrl+Plus or Cmd+Plus to zoom in, and Ctrl+Minus or Cmd+Minus to zoom out."
          : " On tablets, use pinch-to-zoom gestures to zoom."}{" "}
        Town markers are color-coded by population size.
      </div>
      <div
        id="map-container-area"
        ref={containerRef}
        role="application"
        aria-label="Interactive historical map showing town populations. Click on the map or press Tab to focus, then use arrow keys to pan."
        aria-describedby="map-description"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          outline: "none",
        }}
        tabIndex={0}
      >
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMove}
          onLoad={handleMapLoad}
          onClick={e => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              handleMapFeatureClick(feature.properties?.name);
            }
          }}
          interactiveLayerIds={[`${MAP_LAYER_ID}-circle`]}
          canvasContextAttributes={{ preserveDrawingBuffer: true }}
          minZoom={1}
          maxZoom={DEFAULT_MAP_CONTAINER_PROPS.maxZoom}
          style={{ width: "100%", height: "100%" }}
          mapStyle={getTerrainStyle()}
          mapLib={MaplibreGL}
          attributionControl={false}
          cursor="pointer"
          keyboard={false}
          touchZoomRotate={true}
          dragPan={true}
        >
          {/* Defer non-critical features until map is ready for better LCP */}
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
          {isDesktop && <NavigationControl position="bottom-right" />}
        </Map>
      </div>
    </>
  );
};

export default MapView;
