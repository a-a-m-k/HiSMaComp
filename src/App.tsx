import React, { Suspense } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "@/theme/theme";
import MapPage from "@/pages/MapPage";
import { ErrorBoundary } from "@/components/dev";

// Lazy load dev-only components to reduce initial bundle size
const PerformanceMonitor = React.lazy(
  () => import("@/components/dev/PerformanceMonitor/PerformanceMonitor")
);
const ErrorTestHelper = React.lazy(
  () =>
    import("@/components/dev/ErrorBoundary/ErrorTestHelper").then(module => ({
      default: module.ErrorTestHelper,
    }))
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        {process.env.NODE_ENV === "development" && (
          <Suspense fallback={null}>
            <ErrorTestHelper />
          </Suspense>
        )}
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
