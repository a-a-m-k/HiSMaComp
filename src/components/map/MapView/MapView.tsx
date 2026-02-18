import React, { useMemo, useRef, Suspense, useState, useEffect } from "react";
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
  useMapKeyboardShortcuts,
  useMapKeyboardPanning,
  useNavigationControlAccessibility,
  useTownsGeoJSON,
} from "@/hooks/map";
import { isValidNumber } from "@/utils/zoom/zoomHelpers";
import { TownMarkers } from "./TownMarkers";

/** Duration for programmatic fit-to-towns animation. */
const PROGRAMMATIC_FIT_DURATION_MS = 480;
/** Fallback to sync viewState if moveend never fires after easeTo. */
const PROGRAMMATIC_FIT_FALLBACK_MS = PROGRAMMATIC_FIT_DURATION_MS + 120;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Loaded lazily because it is not rendered on mobile and is non-critical for
 * first paint.
 */
const ScreenshotButton = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);

/**
 * Initial map camera values passed from container-level calculations.
 */
interface MapViewComponentProps {
  initialPosition: { longitude: number; latitude: number };
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
  /** True while programmatic step animation is running; we ignore onMove to avoid redraw conflict */
  const isProgrammaticAnimatingRef = useRef(false);
  const enableZoomControls = isDesktop;

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

  /**
   * Programmatic fit-to-towns: one smooth easeTo to target. Ignoring onMove
   * during the animation prevents React state updates and avoids flicker/jump.
   */
  useEffect(() => {
    if (!programmaticTarget) return;

    if (!mapRef.current) {
      const fallbackId = setTimeout(() => {
        onProgrammaticAnimationEnd();
      }, 80);
      return () => clearTimeout(fallbackId);
    }

    const map = mapRef.current.getMap();
    if (!map) return;

    let cancelled = false;
    let syncFallbackId: ReturnType<typeof setTimeout> | null = null;
    isProgrammaticAnimatingRef.current = true;

    const target = programmaticTarget;

    const onMoveEnd = () => {
      map.off("moveend", onMoveEnd);
      if (syncFallbackId !== null) {
        clearTimeout(syncFallbackId);
        syncFallbackId = null;
      }
      if (cancelled) return;
      isProgrammaticAnimatingRef.current = false;
      onProgrammaticAnimationEnd();
    };

    map.once("moveend", onMoveEnd);

    syncFallbackId = setTimeout(() => {
      syncFallbackId = null;
      if (cancelled) return;
      map.off("moveend", onMoveEnd);
      isProgrammaticAnimatingRef.current = false;
      onProgrammaticAnimationEnd();
    }, PROGRAMMATIC_FIT_FALLBACK_MS);

    const runEase = () => {
      if (cancelled) return;
      map.stop();
      const targetCenter: [number, number] = [
        target.longitude,
        target.latitude,
      ];
      map.jumpTo({
        center: targetCenter,
        zoom: map.getZoom(),
      });
      map.easeTo({
        center: targetCenter,
        zoom: target.zoom,
        duration: PROGRAMMATIC_FIT_DURATION_MS,
        easing: easeInOutCubic,
      });
    };

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        runEase();
      });
    });

    return () => {
      cancelled = true;
      isProgrammaticAnimatingRef.current = false;
      if (syncFallbackId !== null) {
        clearTimeout(syncFallbackId);
        syncFallbackId = null;
      }
      cancelAnimationFrame(rafId);
      map.off("moveend", onMoveEnd);
      map.stop();
      if (programmaticTargetRefForSync.current !== null) {
        syncViewStateFromMap(target);
      }
    };
  }, [
    programmaticTarget,
    onProgrammaticAnimationEnd,
    syncViewStateFromMap,
    programmaticTargetRefForSync,
  ]);

  const townsGeojson = useTownsGeoJSON(filteredTowns);

  useMapKeyboardShortcuts(mapRef, enableZoomControls);
  useMapKeyboardPanning(mapRef, containerRef, enableZoomControls);
  useNavigationControlAccessibility(!enableZoomControls, containerRef, mapRef);

  /**
   * Applies a conservative tile-loading strategy so current viewport requests
   * are prioritized and speculative prefetch is reduced.
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
          {enableZoomControls && <NavigationControl position="bottom-right" />}
        </Map>
      </div>
    </>
  );
};

export default MapView;
