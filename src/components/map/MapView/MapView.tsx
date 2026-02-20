import React, { useEffect, useMemo, useRef, Suspense, useState } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import MapLayer from "./MapLayer/MapLayer";
import {
  getTerrainStyle,
  getMapDescription,
  handleMapFeatureClick,
} from "@/utils/map";
import { MAP_LAYER_ID, TRANSITIONS } from "@/constants";
import { RESIZE_DEBOUNCE_MS } from "@/constants/breakpoints";
import { ScreenshotButtonContainer } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";
import { getMapStyles } from "@/constants/ui";
import { useViewport } from "@/hooks/ui";
import type { Town } from "@/common/types";
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

/** MapLibre maxBounds: [[minLng, minLat], [maxLng, maxLat]]. */
type MapLibreMaxBounds = [[number, number], [number, number]];

interface MapViewComponentProps {
  towns: Town[];
  selectedYear: number;
  initialPosition: Pick<MapViewState, "longitude" | "latitude">;
  initialZoom: number;
  /** Restrict panning to viewport bounds (from getGeographicalBoxFromViewport). */
  maxBounds?: MapLibreMaxBounds;
  onFirstIdle?: () => void;
  /** When false, overlay buttons (screenshot, zoom) are hidden (e.g. during resize) until map is idle. */
  showOverlayButtons?: boolean;
}

/**
 * Main interactive map surface: renders base map, layers, markers, and map
 * controls with accessibility and keyboard support.
 */
const MapView: React.FC<MapViewComponentProps> = ({
  towns,
  selectedYear,
  initialPosition: { longitude, latitude },
  initialZoom,
  maxBounds,
  onFirstIdle,
  showOverlayButtons = true,
}) => {
  const theme = useTheme();
  // Single source for viewport: dimensions + device flags (no duplicate useResponsive + useScreenDimensions).
  const viewport = useViewport();
  const { isMobile, isDesktop } = viewport;
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
    viewport,
  });

  const isProgrammaticAnimatingRef = useProgrammaticMapFit({
    mapRef,
    programmaticTarget,
    onProgrammaticAnimationEnd,
    syncViewStateFromMap,
    programmaticTargetRefForSync,
  });

  const townsGeojson = useTownsGeoJSON(towns);

  useMapKeyboardShortcuts(mapRef, enableZoomControls);
  useMapKeyboardPanning(mapRef, containerRef, enableZoomControls);
  useNavigationControlAccessibility(showZoomButtons, containerRef);

  /** Debounced map.resize() after window resize (separate from overlay visibility so map ref stays here). */
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const scheduleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        resizeTimeoutRef.current = null;
        mapRef.current?.getMap()?.resize();
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    return () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
    };
  }, []);

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

  const atMinZoom = viewState.zoom <= safeProps.zoom;

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
        aria-label="Interactive historical map showing town populations. Click on the map or press Tab to focus, then use arrow keys to pan."
        aria-describedby="map-description"
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
        <Map
          ref={mapRef}
          {...(programmaticTarget ?? viewState)}
          {...(maxBounds && {
            maxBounds,
            maxBoundsViscosity: 1,
          })}
          onMove={evt => {
            if (!isProgrammaticAnimatingRef.current) {
              const minZoomAllowed = safeProps.zoom;
              const z = evt.viewState.zoom;
              const viewState =
                z < minZoomAllowed
                  ? { ...evt.viewState, zoom: minZoomAllowed }
                  : evt.viewState;
              handleMove({ viewState });
            }
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
              <MapLayer
                layerId={MAP_LAYER_ID}
                data={townsGeojson}
                selectedYear={selectedYear}
              />
              <TownMarkers towns={towns} selectedYear={selectedYear} />
            </>
          )}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: showOverlayButtons ? 1 : 0,
              visibility: showOverlayButtons ? "visible" : "hidden",
              transition: TRANSITIONS.OVERLAY_FADE,
            }}
          >
            {!isMobile && (
              <ScreenshotButtonContainer
                sx={{ pointerEvents: showOverlayButtons ? "auto" : "none" }}
              >
                <Suspense fallback={null}>
                  <ScreenshotButton />
                </Suspense>
              </ScreenshotButtonContainer>
            )}
            {showZoomButtons && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  pointerEvents: showOverlayButtons ? "auto" : "none",
                }}
              >
                <NavigationControl position="bottom-right" />
              </Box>
            )}
          </Box>
        </Map>
      </div>
    </div>
  );
};

export default MapView;
