import React, { Suspense, lazy } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "@/theme/theme";
import MapPage from "@/pages/MapPage";
import { ErrorBoundary } from "@/components/dev";
import { ErrorTestHelper } from "@/components/dev/ErrorBoundary/ErrorTestHelper";

// Lazy load PerformanceMonitor - dev-only component, not needed in production bundle
const PerformanceMonitor = lazy(
  () => import("@/components/dev/PerformanceMonitor/PerformanceMonitor")
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ErrorTestHelper />
        <MapPage />
        {process.env.NODE_ENV === "development" && (
          <Suspense fallback={null}>
            <PerformanceMonitor />
          </Suspense>
        )}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
