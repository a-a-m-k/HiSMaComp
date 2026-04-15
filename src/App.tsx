import React, { Suspense } from "react";
import CssBaseline from "@mui/material/CssBaseline";

import MapPage from "@/pages/MapPage";
import { ErrorBoundary } from "@/components/dev";
import { MapStyleProvider } from "@/context/MapStyleContext";
import { AppThemeProvider } from "@/theme/AppThemeProvider";

const PerformanceMonitor = React.lazy(
  () => import("@/components/dev/PerformanceMonitor/PerformanceMonitor")
);
const ErrorTestHelper = React.lazy(() =>
  import("@/components/dev/ErrorBoundary/ErrorTestHelper").then(module => ({
    default: module.ErrorTestHelper,
  }))
);

const App: React.FC = () => {
  return (
    <MapStyleProvider>
      <AppThemeProvider>
        <CssBaseline enableColorScheme />
        <ErrorBoundary>
          {import.meta.env.DEV && (
            <Suspense fallback={null}>
              <ErrorTestHelper />
            </Suspense>
          )}
          <MapPage />
        </ErrorBoundary>
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <PerformanceMonitor />
          </Suspense>
        )}
      </AppThemeProvider>
    </MapStyleProvider>
  );
};

export default App;
