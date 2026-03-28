/**
 * GeoJSON `Source` with circle + symbol layers for town population markers and labels.
 */
import React, { useEffect, useMemo } from "react";
import type { ExpressionSpecification } from "maplibre-gl";
import { Layer, Source, LayerProps, useMap } from "react-map-gl/maplibre";
import {
  POPULATION_THRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
  MAP_GEOJSON_MARKERS,
  MAP_GEOJSON_TEXT_FONT,
  getMapTextLabelPaint,
} from "@/constants";
import { GeoJSON } from "geojson";
import { useMapLayerExpressions } from "@/hooks/map";
import { bumpTownTextLayerToTop } from "@/utils/map/mapLabelCollision";
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
    mapStyleMode,
    minPopulation,
    maxPopulation,
    minMarkerSize,
    maxMarkerSize,
  });

  const mapRef = useMap().current;

  /** Top symbol layers place first and win cross-layer collision vs basemap water labels. */
  useEffect(() => {
    const map = mapRef?.getMap?.();
    if (!map) return;
    const bumpToTop = () => bumpTownTextLayerToTop(map, layerId);
    bumpToTop();
    const id = window.setTimeout(bumpToTop, 0);
    map.once("idle", bumpToTop);
    map.on("style.load", bumpToTop);
    return () => {
      window.clearTimeout(id);
      map.off("style.load", bumpToTop);
    };
  }, [layerId, mapRef, mapStyleMode, selectedYear]);

  const textField = useMemo(
    (): ExpressionSpecification => [
      "concat",
      ["coalesce", ["get", "name"], ""],
      "\n",
      ["to-string", ["coalesce", populationExpression, "N/A"]],
    ],
    [populationExpression]
  );

  const textLayoutBase = useMemo(
    () => ({
      "text-field": textField,
      "text-font": [...MAP_GEOJSON_TEXT_FONT],
      "text-anchor": "top" as const,
      "text-justify": "center" as const,
      "text-offset": [0, 1] as [number, number],
      "text-size": 10,
      "text-max-width": 16,
      "text-line-height": 1.2,
      "text-padding": 4,
      "text-pitch-alignment": "viewport" as const,
      "text-rotation-alignment": "viewport" as const,
      "symbol-sort-key": populationSortKey,
      "symbol-z-order": "source" as const,
    }),
    [populationSortKey, textField]
  );

  return (
    <Source
      id={`${layerId}-source`}
      key={`${layerId}-${selectedYear}`}
      type="geojson"
      data={data}
    >
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
          ...textLayoutBase,
          // Historic years often have no town ≥50k; collision would hide almost all labels on small viewports.
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        }}
        paint={getMapTextLabelPaint(mapStyleMode) as Record<string, unknown>}
        {...rest}
      />
    </Source>
  );
};

export default React.memo(MapLayer) as React.FC<MapLayerProps>;
