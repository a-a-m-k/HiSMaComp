/**
 * GeoJSON `Source` with circle + symbol layers for town population markers and labels.
 */
import React from "react";
import { Layer, Source, LayerProps } from "react-map-gl/maplibre";
import {
  POPULATION_THRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
  MAP_GEOJSON_MARKERS,
  getMapTextLabelPaint,
} from "@/constants";
import { GeoJSON } from "geojson";
import { useMapLayerExpressions } from "@/hooks/map";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

interface MapLayerProps extends Omit<
  LayerProps,
  "id" | "type" | "layout" | "paint"
> {
  layerId: string;
  data: GeoJSON;
  selectedYear: number;
  mapStyleMode: MapBaseStyleMode;
  minPopulation?: number;
  maxPopulation?: number;
  minMarkerSize?: number;
  maxMarkerSize?: number;
}

const MapLayer = ({
  layerId,
  data,
  selectedYear,
  mapStyleMode,
  minPopulation = POPULATION_THRESHOLDS[0],
  maxPopulation = POPULATION_THRESHOLDS[POPULATION_THRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
  ...rest
}: MapLayerProps) => {
  const {
    populationSortKey,
    circleRadiusExpression,
    circleColorExpression,
    populationExpression,
  } = useMapLayerExpressions({
    selectedYear,
    mapStyleMode,
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
          "circle-stroke-width": MAP_GEOJSON_MARKERS.circleStrokeWidth,
          "circle-stroke-color": MAP_GEOJSON_MARKERS.outline[mapStyleMode],
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
          // With `symbol-sort-key` from population (see getPopulationSortKey), MapLibre places larger towns first; smaller labels omit on overlap.
          "text-allow-overlap": false,
          "symbol-sort-key": populationSortKey,
        }}
        paint={getMapTextLabelPaint(mapStyleMode) as Record<string, unknown>}
        {...rest}
      />
    </Source>
  );
};

export default React.memo(MapLayer) as React.FC<MapLayerProps>;
