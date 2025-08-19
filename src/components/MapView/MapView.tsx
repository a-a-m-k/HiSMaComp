import React, { useMemo } from "react";
import Map, {
  NavigationControl,
  StyleSpecification,
} from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMediaQuery, useTheme } from "@mui/material";
import { MapViewProps } from "./MapView.types";
import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import terrainStyleJson from "@assets/terrain-gl-style/terrain.json";
import MapScreenshotButton from "../ScreenshotButton/ScreenshotButton";
import { townsToGeoJSON } from "@/utils";
import MapLayer from "./MapLayer/MapLayer";
import { MAP_LAYER_ID, MOBILE_TIMELINE_HEIGHT } from "@/constants";
import { FloatingButtonBox } from "@/common/styles";

const MapView: React.FC<MapViewProps> = ({
  towns,
  mapContainerProps,
  initialPosition: { longitude, latitude },
  initialZoom,
  selectedYear,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mergedMapContainerProps = {
    ...DEFAULT_MAP_CONTAINER_PROPS,
    ...mapContainerProps,
  };

  const townsGeojson = useMemo(() => townsToGeoJSON(towns), [towns]);

  return (
    <Map
      initialViewState={{ longitude, latitude, zoom: initialZoom }}
      canvasContextAttributes={{ preserveDrawingBuffer: true }}
      minZoom={initialZoom}
      maxZoom={mergedMapContainerProps.maxZoom}
      style={{ width: "100%", height: "100%" }}
      mapStyle={terrainStyleJson as StyleSpecification}
      mapLib={MaplibreGL}
      attributionControl={false}
    >
      <FloatingButtonBox timelineHeight={MOBILE_TIMELINE_HEIGHT}>
        <MapScreenshotButton />
      </FloatingButtonBox>
      <MapLayer
        layerId={MAP_LAYER_ID}
        selectedYear={selectedYear}
        data={townsGeojson}
      />
      {!isMobile && <NavigationControl position="bottom-right" />}
    </Map>
  );
};

export default React.memo(MapView);
