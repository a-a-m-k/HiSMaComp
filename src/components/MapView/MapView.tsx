import React, { useMemo } from "react";
import Map, {
  NavigationControl,
  StyleSpecification,
} from "react-map-gl/maplibre";
import MaplibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMediaQuery, useTheme } from "@mui/material";
import { DEFAULT_MAP_CONTAINER_PROPS } from "./constants";
import terrainStyleJson from "@assets/terrain-gl-style/terrain.json";
import MapScreenshotButton from "../ScreenshotButton/ScreenshotButton";
import { townsToGeoJSON } from "@/utils";
import MapLayer from "./MapLayer/MapLayer";
import { MAP_LAYER_ID, MOBILE_TIMELINE_HEIGHT } from "@/constants";
import { FloatingButtonBox } from "@/common/styles";
import { useApp } from "@/context/AppContext";

interface MapViewComponentProps {
  initialPosition: { longitude: number; latitude: number };
  initialZoom: number;
}

const MapView: React.FC<MapViewComponentProps> = ({
  initialPosition: { longitude, latitude },
  initialZoom,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { filteredTowns } = useApp();

  const townsGeojson = useMemo(() => {
    try {
      return townsToGeoJSON(filteredTowns);
    } catch (error) {
      console.error("Error converting towns to GeoJSON:", error);
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }
  }, [filteredTowns]);

  return (
    <Map
      initialViewState={{ longitude, latitude, zoom: initialZoom }}
      canvasContextAttributes={{ preserveDrawingBuffer: true }}
      minZoom={initialZoom}
      maxZoom={DEFAULT_MAP_CONTAINER_PROPS.maxZoom}
      style={{ width: "100%", height: "100%" }}
      mapStyle={terrainStyleJson as StyleSpecification}
      mapLib={MaplibreGL}
      attributionControl={false}
    >
      <FloatingButtonBox timelineHeight={MOBILE_TIMELINE_HEIGHT}>
        <MapScreenshotButton />
      </FloatingButtonBox>
      <MapLayer layerId={MAP_LAYER_ID} data={townsGeojson} />
      {!isMobile && <NavigationControl position="bottom-right" />}
    </Map>
  );
};

export default React.memo(MapView);
