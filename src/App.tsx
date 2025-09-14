import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import MapPage from "./pages/MapPage";
import PerformanceMonitor from "./components/PerformanceMonitor/PerformanceMonitor";
import ErrorBoundary from "./components/ErrorBoundary";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <MapPage />
        <PerformanceMonitor />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
