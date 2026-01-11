import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "@/theme/theme";
import MapPage from "@/pages/MapPage";
import { ErrorBoundary, PerformanceMonitor } from "@/components/dev";
import { ErrorTestHelper } from "@/components/dev/ErrorBoundary/ErrorTestHelper";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ErrorTestHelper />
        <MapPage />
        {process.env.NODE_ENV === "development" && <PerformanceMonitor />}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
