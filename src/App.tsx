import React, { Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "@/theme/theme";
import MapPage from "@/pages/MapPage";
import { ErrorBoundary } from "@/components/dev";

// Lazy load dev-only components to reduce initial bundle size
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ErrorTestHelper />
          </Suspense>
        )}
        <MapPage />
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <PerformanceMonitor />
          </Suspense>
        )}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
