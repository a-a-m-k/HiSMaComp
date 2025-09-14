import { Town } from "@/common/types";

export const createSpatialIndex = (towns: Town[]) => {
  const index = new Map<string, Town[]>();

  towns.forEach((town) => {
    // Grid cells for spatial indexing
    const latCell = Math.floor(town.latitude * 10) / 10;
    const lngCell = Math.floor(town.longitude * 10) / 10;
    const key = `${latCell},${lngCell}`;

    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key)!.push(town);
  });

  return index;
};

export const filterTownsInBounds = (
  towns: Town[],
  bounds: { north: number; south: number; east: number; west: number },
): Town[] => {
  return towns.filter(
    (town) =>
      town.latitude >= bounds.south &&
      town.latitude <= bounds.north &&
      town.longitude >= bounds.west &&
      town.longitude <= bounds.east,
  );
};

const populationCache = new Map<string, number>();

export const calculatePopulationForYear = (
  towns: Town[],
  year: number,
): number => {
  const cacheKey = `${year}-${towns.length}`;

  if (populationCache.has(cacheKey)) {
    return populationCache.get(cacheKey)!;
  }

  const totalPopulation = towns.reduce((sum, town) => {
    const population = town.populationByCentury[year];
    return sum + (population || 0);
  }, 0);

  populationCache.set(cacheKey, totalPopulation);

  // Prevent memory leaks
  if (populationCache.size > 50) {
    const firstKey = populationCache.keys().next().value;
    populationCache.delete(firstKey);
  }

  return totalPopulation;
};

export const createGeoJSONFeatures = (
  towns: Town[],
): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = towns.map((town) => ({
    id: town.name,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [town.longitude, town.latitude],
    },
    properties: {
      ...town,
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
};

export const optimizeMapViewport = (
  towns: Town[],
  containerWidth: number,
  containerHeight: number,
) => {
  if (towns.length === 0) {
    return { center: { lat: 0, lng: 0 }, zoom: 2 };
  }

  const lats = towns.map((t) => t.latitude);
  const lngs = towns.map((t) => t.longitude);

  const bounds = {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };

  const center = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };

  const latDiff = bounds.north - bounds.south;
  const lngDiff = bounds.east - bounds.west;
  const maxDiff = Math.max(latDiff, lngDiff);

  const zoom = Math.min(15, Math.max(2, Math.floor(10 - Math.log2(maxDiff))));

  return { center, zoom, bounds };
};
