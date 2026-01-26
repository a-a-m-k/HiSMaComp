import React from "react";
import { Layer, Source, LayerProps } from "react-map-gl/maplibre";
import {
  POPULATION_THRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
} from "@/constants";
import { GeoJSON } from "geojson";
import { useApp } from "@/context/AppContext";
import { useMapLayerExpressions } from "@/hooks/map";

interface MapLayerProps
  extends Omit<LayerProps, "id" | "type" | "layout" | "paint"> {
  layerId: string;
  data: GeoJSON;
  minPopulation?: number;
  maxPopulation?: number;
  minMarkerSize?: number;
  maxMarkerSize?: number;
}

const MapLayer = ({
  layerId,
  data,
  minPopulation = POPULATION_THRESHOLDS[0],
  maxPopulation = POPULATION_THRESHOLDS[POPULATION_THRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
  ...rest
}: MapLayerProps) => {
  const { selectedYear } = useApp();

  const {
    populationSortKey,
    circleRadiusExpression,
    circleColorExpression,
    populationExpression,
  } = useMapLayerExpressions({
    selectedYear,
    minPopulation,
    maxPopulation,
    minMarkerSize,
    maxMarkerSize,
  });

  return (
    <Source id={`${layerId}-source`} type="geojson" data={data}>
      <Layer
        id={`${layerId}-circle`}
        type="circle"
        paint={{
          "circle-radius": circleRadiusExpression,
          "circle-color": circleColorExpression,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        }}
        layout={{
          "circle-sort-key": populationSortKey,
        }}
        {...rest}
      />

      <Layer
        id={`${layerId}-text`}
        type="symbol"
        layout={{
          "text-field": [
            "format",
            ["get", "name"],
            {},
            "\n",
            {},
            ["to-string", ["coalesce", populationExpression, "N/A"]],
            { "font-scale": 0.8 },
          ],
          "text-anchor": "top",
          "text-offset": [0, 1.5],
          "text-size": 10,
          "text-allow-overlap": false,
          "symbol-sort-key": populationSortKey,
        }}
        paint={{
          "text-color": "#222",
          "text-halo-color": "#fff",
          "text-halo-width": 0.8,
        }}
        {...rest}
      />
    </Source>
  );
};

export default React.memo(MapLayer) as React.FC<MapLayerProps>;
