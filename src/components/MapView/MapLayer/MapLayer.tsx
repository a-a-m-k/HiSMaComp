import React, { useMemo } from "react";
import { Layer, Source, LayerProps } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  POPULATION_TRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
} from "@/constants";
import { GeoJSON } from "geojson";
import {
  getCircleColorExpression,
  getCircleRadiusExpression,
  getPopulationExpression,
  getPopulationSortKey,
} from "./maplibreExpressions";

interface MapLayerProps
  extends Omit<LayerProps, "id" | "type" | "layout" | "paint"> {
  layerId: string;
  selectedYear: number;
  data: GeoJSON;
  minPopulation?: number;
  maxPopulation?: number;
  minMarkerSize?: number;
  maxMarkerSize?: number;
}

const MapLayer: React.FC<MapLayerProps> = ({
  layerId,
  selectedYear,
  data,
  minPopulation = POPULATION_TRESHOLDS[0],
  maxPopulation = POPULATION_TRESHOLDS[POPULATION_TRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
  ...rest
}) => {
  const selectedCentury = String(selectedYear);
  const minPop = POPULATION_TRESHOLDS[0];
  const maxPop = POPULATION_TRESHOLDS[POPULATION_TRESHOLDS.length - 1];
  const minSize = MIN_MARKER_SIZE;
  const maxSize = MAX_MARKER_SIZE;

  const populationSortKey = useMemo(
    () => getPopulationSortKey(selectedCentury),
    [selectedCentury],
  );

  return (
    <Source id={`${layerId}-source`} type="geojson" data={data}>
      <Layer
        id={`${layerId}-circle`}
        type="circle"
        paint={{
          "circle-radius": getCircleRadiusExpression(
            selectedCentury,
            minPop,
            maxPop,
            minSize,
            maxSize,
          ),
          "circle-color": getCircleColorExpression(selectedCentury),
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
            [
              "to-string",
              ["coalesce", getPopulationExpression(selectedCentury), "N/A"],
            ],
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

export default MapLayer;
