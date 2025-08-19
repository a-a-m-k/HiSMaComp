import { useMemo, useState } from "react";
import MapView from "@components/MapView/MapView";
import Timeline from "@components/Timeline";
import towns from "@assets/history-data/towns.json";
import { getCenter, getFitZoom } from "@/utils";
import { CENTURY_MAP, YEARS } from "@/constants";
import MapLegend from "@components/Legend";
import { useLegendLayers } from "@/hooks";
import { Box } from "@mui/material";

const MapContainer = () => {
  const minCentury = YEARS[0];

  const marks = YEARS.map((year) => ({
    value: year,
    label: CENTURY_MAP[year].toString() + "th ct.",
  }));
  const legendLayers = useLegendLayers();

  // Calculate map center and initial zoom
  const { latitude, longitude } = useMemo(() => getCenter(towns), []);

  const initialZoom = useMemo(() => {
    return getFitZoom(towns, window.innerWidth, window.innerHeight);
  }, [towns]);

  const [selectedYear, setSelectedYear] = useState<number>(minCentury);

  // Filter localities by selected year
  const filteredTowns = useMemo(() => {
    return towns.filter(
      (town) =>
        town.populationByCentury &&
        town.populationByCentury[selectedYear] !== undefined,
    );
  }, [selectedYear, towns]);

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
