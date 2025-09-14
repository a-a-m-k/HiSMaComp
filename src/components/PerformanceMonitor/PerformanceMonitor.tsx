import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { BugReport, Memory, Speed } from "@mui/icons-material";
import { PerformanceMemory } from "@/common/types";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  componentCount: number;
  townsCount: number;
  lastRenderTime: number;
}

const PerformanceMonitor = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    fps: 60,
    componentCount: 0,
    townsCount: 0,
    lastRenderTime: 0,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        // Get towns count from map data
        const mapContainer = document.querySelector("#map-container");
        const townsCount = mapContainer
          ? Array.from(mapContainer.querySelectorAll("[data-town]")).length
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (
            performance as Performance & { memory?: PerformanceMemory }
          ).memory?.usedJSHeapSize,
          componentCount: document.querySelectorAll("[data-testid]").length,
          townsCount,
          lastRenderTime: currentTime - prev.lastRenderTime,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    // Toggle with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    checkScreenSize();

    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener("resize", throttledResize);
    return () => {
      window.removeEventListener("resize", throttledResize);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!isVisible || process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!isLargeScreen) {
    return null;
  }

  const formatMemory = (bytes?: number) => {
    if (!bytes) return "N/A";
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handleDebugLog = () => {
    console.group("🐛 Debug Info");
    console.log("Performance Metrics:", metrics);
    console.log("Window dimensions:", {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    console.log("Map container:", document.querySelector("#map-container"));
    console.log(
      "Towns data loaded:",
      document.querySelectorAll("[data-town]").length
    );
    console.groupEnd();
  };

  return (
    <Box
      data-performance-monitor
      sx={{
        position: "fixed",
        top: theme.spacing(1.25),
        left: theme.spacing(9),
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "white",
        padding: 2,
        borderRadius: 1,
        fontFamily: "monospace",
        fontSize: "12px",
        minWidth: 220,
        backdropFilter: "blur(4px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ color: "white", fontSize: "14px" }}>
          🚀 Dev Monitor
        </Typography>
        <Tooltip title="Log debug info to console">
          <IconButton
            size="small"
            onClick={handleDebugLog}
            sx={{ color: "white" }}
          >
            <BugReport fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Speed fontSize="small" />
            <span>FPS:</span>
          </Box>
          <Chip
            label={metrics.fps}
            size="small"
            color={
              metrics.fps >= 50
                ? "success"
                : metrics.fps >= 30
                  ? "warning"
                  : "error"
            }
            sx={{ fontSize: "10px", height: "20px" }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Memory fontSize="small" />
            <span>Memory:</span>
          </Box>
          <span>{formatMemory(metrics.memoryUsage)}</span>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Towns:</span>
          <span>{metrics.townsCount}</span>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Components:</span>
          <span>{metrics.componentCount}</span>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Render:</span>
          <span>{metrics.renderTime.toFixed(1)}ms</span>
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1.5,
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "10px",
          textAlign: "center",
        }}
      >
        Ctrl+Shift+P to toggle
      </Typography>
    </Box>
  );
};

export default React.memo(PerformanceMonitor) as React.FC;
