import React, { useMemo, useRef } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "@mui/material";

import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import MapLayer from "./MapLayer/MapLayer";
import { getTerrainStyle } from "@/utils/map";
import { ScreenshotButton } from "@/components/controls";
import { MAP_LAYER_ID } from "@/constants";
import { ScreenshotButtonContainer } from "@/components/controls/ScreenshotButton/ScreenshotButton.styles";
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
          <MapLayer layerId={MAP_LAYER_ID} data={townsGeojson} />
          {!isMobile && (
            <ScreenshotButtonContainer>
              <ScreenshotButton />
            </ScreenshotButtonContainer>
          )}
          {isDesktop && <NavigationControl position="bottom-right" />}
          <TownMarkers towns={filteredTowns} />
        </Map>
      </div>
    </>
  );
};

export default MapView;
