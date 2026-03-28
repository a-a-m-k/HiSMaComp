import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import type { MapRef } from "react-map-gl/maplibre";

import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";
import type { MapViewState } from "./useMapViewState";

type MapInstance = NonNullable<ReturnType<MapRef["getMap"]>>;

type MapLibreMaxBounds = [[number, number], [number, number]];

interface UseMapViewLibreEffectsParams {
  mapRef: RefObject<MapRef | null>;
  basemapMapRef: RefObject<MapRef | null>;
  mapReady: boolean;
  isSplitBasemap: boolean;
  mapStyleMode: MapBaseStyleMode;
  viewState: MapViewState;
  maxBounds: MapLibreMaxBounds | undefined;
}

/**
 * MapLibre imperative setup for `MapView`: max bounds, prefetch off, and camera sync when the
 * overlay style reloads (light/dark) so `setStyle` does not leave the camera out of sync with React.
 */
export function useMapViewLibreEffects({
  mapRef,
  basemapMapRef,
  mapReady,
  isSplitBasemap,
  mapStyleMode,
  viewState,
  maxBounds,
}: UseMapViewLibreEffectsParams) {
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  const cameraSyncedForMapStyleModeRef = useRef(mapStyleMode);
  const maxBoundsRef = useRef(maxBounds);
  maxBoundsRef.current = maxBounds;

  const applyMapLoad = useCallback((map: MapInstance) => {
    const mapWithPrefetchControl = map as MapInstance & {
      setPrefetchZoomDelta?: (delta: number) => void;
    };
    mapWithPrefetchControl.setPrefetchZoomDelta?.(0);
    if (maxBoundsRef.current) map.setMaxBounds(maxBoundsRef.current);
  }, []);

  const syncMapsToViewStateRef = useCallback(() => {
    const vs = viewStateRef.current;
    const center: [number, number] = [vs.longitude, vs.latitude];
    const overlay = mapRef.current?.getMap?.();
    overlay?.jumpTo({ center, zoom: vs.zoom });
    if (isSplitBasemap) {
      basemapMapRef.current?.getMap?.()?.jumpTo({ center, zoom: vs.zoom });
    }
  }, [isSplitBasemap, mapRef, basemapMapRef]);

  useEffect(() => {
    if (!maxBounds) return;
    mapRef.current?.getMap()?.setMaxBounds(maxBounds);
    if (isSplitBasemap) {
      basemapMapRef.current?.getMap()?.setMaxBounds(maxBounds);
    }
  }, [maxBounds, isSplitBasemap, mapRef, basemapMapRef]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current?.getMap?.();
    if (!map) return;

    const onStyleLoad = () => {
      requestAnimationFrame(() => syncMapsToViewStateRef());
    };

    map.on("style.load", onStyleLoad);
    return () => {
      map.off("style.load", onStyleLoad);
    };
  }, [mapReady, syncMapsToViewStateRef, mapRef]);

  useLayoutEffect(() => {
    if (cameraSyncedForMapStyleModeRef.current === mapStyleMode) return;
    const map = mapRef.current?.getMap?.();
    if (!map || !mapReady) return;
    syncMapsToViewStateRef();
    cameraSyncedForMapStyleModeRef.current = mapStyleMode;
  }, [mapStyleMode, mapReady, syncMapsToViewStateRef, mapRef]);

  const handleOverlayMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) applyMapLoad(map);
  }, [applyMapLoad, mapRef]);

  const handleBasemapLoad = useCallback(() => {
    const basemap = basemapMapRef.current?.getMap();
    if (!basemap) return;
    applyMapLoad(basemap);
    const vs = viewStateRef.current;
    basemap.jumpTo({ center: [vs.longitude, vs.latitude], zoom: vs.zoom });
  }, [applyMapLoad, basemapMapRef]);

  return {
    handleOverlayMapLoad,
    handleBasemapLoad,
  };
}
