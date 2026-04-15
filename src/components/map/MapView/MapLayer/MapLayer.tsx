/**
 * GeoJSON `Source` with a circle layer + a symbol (text) layer, both declarative.
 *
 * Both `<Layer>` components live inside the same `<Source>`, so react-map-gl manages their
 * full lifecycle (create / update / re-create after style swap / cleanup on unmount).
 * No imperative `map.addLayer` — that pattern kept racing with react-map-gl's own source
 * cleanup (which removes every layer referencing the source id).
 */
import React, { useMemo } from "react";
import type { ExpressionSpecification } from "maplibre-gl";
import { Layer, Source, LayerProps } from "react-map-gl/maplibre";
import {
  MAP_LABEL_TEXT_PROP,
  POPULATION_THRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
  MAP_GEOJSON_MARKERS,
  getMapTextLabelPaint,
} from "@/constants";
import { GeoJSON } from "geojson";
import { useMapLayerExpressions } from "@/hooks/map";
import { POPULATION_FOR_YEAR_PROP } from "./expressions";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

interface MapLayerProps extends Omit<
  LayerProps,
  "id" | "type" | "layout" | "paint"
> {
  layerId: string;
  data: GeoJSON;
  mapStyleMode: MapBaseStyleMode;
  minPopulation?: number;
  maxPopulation?: number;
  minMarkerSize?: number;
  maxMarkerSize?: number;
}

const MapLayer = ({
  layerId,
  data,
  mapStyleMode,
  minPopulation = POPULATION_THRESHOLDS[0],
  maxPopulation = POPULATION_THRESHOLDS[POPULATION_THRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
  ...rest
}: MapLayerProps) => {
  const { populationSortKey, circleRadiusExpression, circleColorExpression } =
    useMapLayerExpressions({
      mapStyleMode,
      minPopulation,
      maxPopulation,
      minMarkerSize,
      maxMarkerSize,
    });

  const sourceId = `${layerId}-source`;
  const textLayerId = `${layerId}-text`;

  const textPaint = useMemo(
    () => getMapTextLabelPaint(mapStyleMode),
    [mapStyleMode]
  );

  const textLayout = useMemo(
    () => ({
      // Use a precomputed property to keep label rendering stable during source updates.
      "text-field": [
        "coalesce",
        ["get", MAP_LABEL_TEXT_PROP],
        ["get", "name"],
      ] as ExpressionSpecification,
      "symbol-placement": "point" as const,
      "text-anchor": "top" as const,
      "text-justify": "center" as const,
      "text-offset": [0, 1] as [number, number],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3,
        9,
        8,
        17,
      ] as ExpressionSpecification,
      "text-max-width": 16,
      "text-line-height": 1.2,
      "text-padding": 2,
      "text-pitch-alignment": "viewport" as const,
      "text-rotation-alignment": "viewport" as const,
      "symbol-sort-key": populationSortKey,
      "symbol-z-order": "source" as const,
      // Priority-by-population placement: keep larger towns, drop smaller overlaps.
      "text-allow-overlap": false,
      "text-ignore-placement": false,
    }),
    [populationSortKey]
  );

  return (
    <Source id={sourceId} type="geojson" data={data}>
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
        filter={[
          "all",
          ["has", POPULATION_FOR_YEAR_PROP],
          ["!=", ["get", POPULATION_FOR_YEAR_PROP], ["literal", null]],
        ]}
        {...rest}
      />
      <Layer
        id={textLayerId}
        type="symbol"
        layout={textLayout}
        paint={textPaint}
        filter={[
          "all",
          ["has", POPULATION_FOR_YEAR_PROP],
          ["!=", ["get", POPULATION_FOR_YEAR_PROP], ["literal", null]],
        ]}
      />
    </Source>
  );
};

export default React.memo(MapLayer) as React.FC<MapLayerProps>;
