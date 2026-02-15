import { TILE_OPTIMIZATION_SETTINGS } from "@/constants";
import type { DeviceTileSetting } from "@/constants/mapTiles";
import { logger } from "@/utils/logger";

/**
 * Applies device-aware tile loading settings to a MapLibre map instance.
 * Uses internal MapLibre GL properties; if a major upgrade breaks this, remove
 * or adjust—the map still works with default settings.
 *
 * @see https://maplibre.org/maplibre-gl-js-docs/api/
 */
export function applyTileOptimization(
  map: unknown,
  deviceType: DeviceTileSetting
): void {
  try {
    const settings = TILE_OPTIMIZATION_SETTINGS[deviceType];
    // MapLibre internal properties; type loosely to allow assignment
    const mapInstance = map as {
      _maxTileCacheSize?: number;
      _maxParallelImageRequests?: number;
      _requestManager?: { maxRequestsPerTile?: number };
    };

    if (
      "_maxTileCacheSize" in mapInstance &&
      typeof mapInstance._maxTileCacheSize === "number"
    ) {
      mapInstance._maxTileCacheSize = settings.cache;
    }

    if (
      "_maxParallelImageRequests" in mapInstance &&
      typeof mapInstance._maxParallelImageRequests === "number"
    ) {
      mapInstance._maxParallelImageRequests = settings.parallel;
    }

    const requestManager = mapInstance._requestManager;
    if (
      requestManager &&
      typeof requestManager === "object" &&
      "maxRequestsPerTile" in requestManager &&
      typeof requestManager.maxRequestsPerTile === "number"
    ) {
      requestManager.maxRequestsPerTile = settings.perTile;
    }
  } catch (error) {
    logger.warn("Failed to optimize tile loading configuration:", error);
  }
}
