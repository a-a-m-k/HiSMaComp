import React from "react";
import { useTheme } from "@mui/material/styles";
import { logger } from "@/utils/logger";
import { usePerformanceMetrics } from "./usePerformanceMetrics";
import { useMonitorShortcut } from "./useMonitorShortcut";
import { useMonitorScreenSize } from "./useMonitorScreenSize";
import { PerformanceMonitorPanel } from "./PerformanceMonitorPanel";

const PerformanceMonitor = () => {
  const theme = useTheme();
  const metrics = usePerformanceMetrics();
  const isVisible = useMonitorShortcut();
  const isLargeScreen = useMonitorScreenSize();

  const handleDebugLog = () => {
    if (!import.meta.env.DEV) return;
    logger.debug("🐛 Debug Info - Performance Metrics:", metrics);
    logger.debug("Window dimensions:", {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    logger.debug("Map container:", document.querySelector("#map-container"));
    logger.debug(
      "Towns data loaded:",
      document.querySelectorAll("[data-town]").length
    );
  };

  if (!isVisible || !import.meta.env.DEV || !isLargeScreen) {
    return null;
  }

  return (
    <PerformanceMonitorPanel
      theme={theme}
      metrics={metrics}
      onDebugLog={handleDebugLog}
    />
  );
};

export default React.memo(PerformanceMonitor) as React.FC;
