/**
 * GeoJSON `Source` with circle + symbol layers for town population markers and labels.
 */
import React, { useEffect } from "react";
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
    selectedYear,
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
          // Two-line column: name, then population (newline). Not a single horizontal "name · pop" line.
          "text-field": [
            "concat",
            ["coalesce", ["get", "name"], ""],
            "\n",
            ["to-string", ["coalesce", populationExpression, "N/A"]],
          ],
          "text-font": [...MAP_GEOJSON_TEXT_FONT],
          "text-anchor": "top",
          "text-justify": "center",
          "text-offset": [0, 1],
          "text-size": 10,
          // Ems per line for wrapped name lines; population stays on its own line after `\n`.
          "text-max-width": 16,
          "text-line-height": 1.2,
          // Extra collision margin so basemap sea/water line labels yield to this label (glyph box alone can miss curved sea labels).
          "text-padding": 4,
          // Screen-space quads: avoids map-plane projection that can skew glyph aspect.
          "text-pitch-alignment": "viewport",
          "text-rotation-alignment": "viewport",
          // Same sort as circles: `getPopulationSortKey` uses negated population so placement order is largest towns first; with collision on, smaller towns drop labels when they overlap.
          "symbol-sort-key": populationSortKey,
          // Collision: hide overlapping labels; larger towns win (see symbol-sort-key). No `text-ignore-placement` — it can break labels after year changes.
          "text-allow-overlap": false,
        }}
        paint={getMapTextLabelPaint(mapStyleMode) as Record<string, unknown>}
        {...rest}
      />
    </Source>
  );
};

export default React.memo(MapLayer) as React.FC<MapLayerProps>;
