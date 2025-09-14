import MapView from "@components/MapView/MapView";
import Timeline from "@components/Timeline";
import towns from "@assets/history-data/towns.json";
import { CENTURY_MAP, YEARS } from "@/constants";
import MapLegend from "@components/Legend";
import { useLegendLayers } from "@/hooks";
import { useMapCalculations } from "@/hooks/useMapCalculations";
import { AppProvider } from "@/context/AppContext";
import { Box } from "@mui/material";
import ErrorBoundary from "@components/ErrorBoundary";

const marks = YEARS.map(year => ({
  value: year,
  label: CENTURY_MAP[year].toString() + "th ct.",
}));

const MapContainer = () => {
  const legendLayers = useLegendLayers();

  return (
    <AppProvider towns={towns}>
      <Box id="map-container" sx={{ width: "100%", height: "100%" }}>
        <MapLegend
          label="Town size according to population number"
          layers={legendLayers}
        />
        <ErrorBoundary>
          <MapViewWithCalculations />
        </ErrorBoundary>
        <Timeline marks={marks} />
      </Box>
    </AppProvider>
  );
};

const MapViewWithCalculations = () => {
  const { center, fitZoom } = useMapCalculations();

  return (
    <MapView
      initialPosition={{
        latitude: center.latitude,
        longitude: center.longitude,
      }}
      initialZoom={fitZoom}
    />
  );
};

export default MapContainer;
