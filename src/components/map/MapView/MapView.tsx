import React, { useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "@mui/material/styles";

import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import MapLayer from "./MapLayer/MapLayer";
import { MapOverlays } from "./MapOverlays";
import {
  getTerrainStyle,
  getMapDescription,
  handleMapFeatureClick,
} from "@/utils/map";
import { getZoomToFitBounds } from "@/utils/mapZoom";
import { calculateMapArea } from "@/utils/utils";
import { MAP_LAYER_ID } from "@/constants";
import { getMapStyles } from "@/constants/ui";
import { strings } from "@/locales";
import { useViewport } from "@/hooks/ui";
import type { Town } from "@/common/types";
import {
  useMapViewState,
  useProgrammaticMapFit,
  useMapKeyboardShortcuts,
  useMapKeyboardPanning,
  useNavigationControlAccessibility,
  useTownsGeoJSON,
  useMapContainerResize,
} from "@/hooks/map";
import type { MapViewState } from "@/hooks/map";
import { isValidNumber } from "@/utils/zoom/zoomHelpers";
import { TownMarkers } from "./TownMarkers";

/** MapLibre maxBounds: [[minLng, minLat], [maxLng, maxLat]]. */
type MapLibreMaxBounds = [[number, number], [number, number]];

interface MapViewComponentProps {
  towns: Town[];
  selectedYear: number;
  initialPosition: Pick<MapViewState, "longitude" | "latitude">;
  initialZoom: number;
  /** Restrict panning to viewport bounds (from getGeographicalBoxFromViewport at initial fitZoom). */
  maxBounds?: MapLibreMaxBounds;
  /** Map area from parent (e.g. MapLayout); fallback for effective min zoom before container is measured. */
  fallbackMapSize?: { effectiveWidth: number; effectiveHeight: number };
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
  fallbackMapSize: fallbackMapSizeProp,
  onFirstIdle,
  showOverlayButtons = true,
}) => {
  const theme = useTheme();
  const viewport = useViewport();
  const { isMobile, isDesktop } = viewport;
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const containerSize = useMapContainerResize(containerRef, mapRef);
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

  /** Fallback map size when container not yet measured (prop from parent, or local). */
  const fallbackMapSizeLocal = useMemo(
    () => calculateMapArea(viewport.screenWidth, viewport.screenHeight, theme),
    [viewport.screenWidth, viewport.screenHeight, theme]
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

  const atMinZoom = viewState.zoom <= effectiveMinZoom;

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
              const z = evt.viewState.zoom;
              const ZOOM_SNAP_EPSILON = 1e-6;
              const atOrNearMin = z <= effectiveMinZoom + ZOOM_SNAP_EPSILON;
              const effectiveZoom = atOrNearMin ? effectiveMinZoom : z;
              const viewState = {
                ...evt.viewState,
                zoom: effectiveZoom,
              };
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
          minZoom={effectiveMinZoom}
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
          <MapOverlays
            showOverlayButtons={showOverlayButtons}
            showZoomButtons={showZoomButtons}
            isMobile={isMobile}
          />
        </Map>
      </div>
    </div>
  );
};

export default MapView;
