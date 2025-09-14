import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, useTheme } from "@mui/material";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  componentCount: number;
}

const PerformanceMonitor = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    fps: 60,
    componentCount: 0,
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

        setMetrics((prev) => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
          componentCount: document.querySelectorAll("[data-testid]").length,
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
        setIsVisible((prev) => !prev);
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

  return (
    <Box
      data-performance-monitor
      sx={{
        position: "fixed",
        top: theme.spacing(1.25),
        left: theme.spacing(9),
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: 2,
        borderRadius: 1,
        fontFamily: "monospace",
        fontSize: "12px",
        minWidth: 200,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, color: "white" }}>
        Performance Monitor
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>FPS:</span>
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
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Memory:</span>
          <span>{formatMemory(metrics.memoryUsage)}</span>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Components:</span>
          <span>{metrics.componentCount}</span>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Render Time:</span>
          <span>{metrics.renderTime.toFixed(2)}ms</span>
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1,
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "10px",
        }}
      >
        Press Ctrl+Shift+P to toggle
      </Typography>
    </Box>
  );
};

export default React.memo(PerformanceMonitor) as React.FC;
