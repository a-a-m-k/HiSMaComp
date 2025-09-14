import { useMemo, useState } from "react";
import MapView from "@components/MapView/MapView";
import Timeline from "@components/Timeline";
import towns from "@assets/history-data/towns.json";
import { getCenter, getFitZoom } from "@/utils";
import { CENTURY_MAP, YEARS } from "@/constants";
import MapLegend from "@components/Legend";
import { useLegendLayers } from "@/hooks";
import { useMapDataCache } from "@/hooks/useMapDataCache";
import { Box } from "@mui/material";

const marks = YEARS.map((year) => ({
  value: year,
  label: CENTURY_MAP[year].toString() + "th ct.",
}));

const MapContainer = () => {
  const legendLayers = useLegendLayers();
  const { filterTownsByYear, getPopulationStats } = useMapDataCache();

  const { latitude, longitude } = useMemo(() => getCenter(towns), []);
  const initialZoom = useMemo(() => {
    return getFitZoom(towns, window.innerWidth, window.innerHeight);
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(YEARS[0]);

  const filteredTowns = useMemo(() => {
    return filterTownsByYear(towns, selectedYear);
  }, [selectedYear, filterTownsByYear]);

  const populationStats = useMemo(() => {
    return getPopulationStats(filteredTowns, selectedYear);
  }, [filteredTowns, selectedYear, getPopulationStats]);

  return (
    <Box id="map-container" sx={{ width: "100%", height: "100%" }}>
      <MapLegend
        label="Town size according to population number"
        layers={legendLayers}
        selectedYear={selectedYear}
      />
      <MapView
        selectedYear={selectedYear}
        towns={filteredTowns}
        initialPosition={{ latitude, longitude }}
        initialZoom={initialZoom}
      />
      <Timeline
        marks={marks}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
    </Box>
  );
};

export default MapContainer;
