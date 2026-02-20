import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { Theme } from "@mui/material/styles";
import BugReport from "@mui/icons-material/BugReport";
import Memory from "@mui/icons-material/Memory";
import Speed from "@mui/icons-material/Speed";
import type { PerformanceMetricsState } from "./usePerformanceMetrics";

export interface PerformanceMonitorPanelProps {
  theme: Theme;
  metrics: PerformanceMetricsState;
  onDebugLog: () => void;
}

function formatMemory(bytes?: number): string {
  if (!bytes) return "N/A";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Presentational overlay panel for dev performance metrics (FPS, memory, etc.).
 */
export function PerformanceMonitorPanel({
  theme,
  metrics,
  onDebugLog,
}: PerformanceMonitorPanelProps) {
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
            onClick={onDebugLog}
            sx={{ color: "white" }}
            aria-label="Log debug information to console"
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
}
