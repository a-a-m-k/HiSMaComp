import maplibregl from "maplibre-gl";
import MapLibreWorker from "maplibre-gl/dist/maplibre-gl-csp-worker.js?worker";

type MapLibreWithWorker = typeof maplibregl & {
  workerClass?: unknown;
};

const configuredMaplibre = maplibregl as MapLibreWithWorker;

// Use CSP worker build so Rollup can emit a separate worker chunk
// instead of keeping the whole worker payload inside the main maplibre chunk.
if (!configuredMaplibre.workerClass) {
  configuredMaplibre.workerClass = MapLibreWorker;
}

export const maplibreGl = Promise.resolve(configuredMaplibre);
