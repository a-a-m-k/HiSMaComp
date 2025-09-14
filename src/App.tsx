import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import MapPage from "./pages/MapPage";
import PerformanceMonitor from "./components/PerformanceMonitor/PerformanceMonitor";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MapPage />
      <PerformanceMonitor />
    </ThemeProvider>
  );
};

export default App;
