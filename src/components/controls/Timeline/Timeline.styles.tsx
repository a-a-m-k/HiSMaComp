import Paper from "@mui/material/Paper";
import { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import {
  COMPONENT_WIDTHS,
  TIMELINE_WIDTHS,
  TIMELINE_HEIGHTS,
  OVERLAY_POSITIONS,
} from "@/constants/ui";

const baseSheetStyles = (theme: Theme): React.CSSProperties => ({
  position: "fixed",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  zIndex: theme.zIndex.modal,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
});

/**
 * Timeline styles for mobile devices.
 * Uses OVERLAY_POSITIONS constants for consistent spacing from viewport edges.
 */
export const MobileSheet = styled(Paper)(({ theme }) => ({
  ...baseSheetStyles(theme),
  left: theme.spacing(OVERLAY_POSITIONS.TIMELINE.HORIZONTAL),
  right: theme.spacing(OVERLAY_POSITIONS.TIMELINE.HORIZONTAL),
  bottom: `calc(${theme.spacing(OVERLAY_POSITIONS.TIMELINE.BOTTOM)} + env(safe-area-inset-bottom, 0px))`,
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(1.5, 3.5, 1.5),
  zIndex: theme.zIndex.modal + 2,
  width: `calc(100% - ${theme.spacing(2)})`,
  marginLeft: "env(safe-area-inset-left, 0px)",
  marginRight: "env(safe-area-inset-right, 0px)",
}));

/**
 * Timeline styles for tablet devices.
 * Uses OVERLAY_POSITIONS constants for consistent spacing from viewport edges.
 */
export const MediumSheet = styled(Paper)(({ theme }) => ({
  ...baseSheetStyles(theme),
  left: theme.spacing(OVERLAY_POSITIONS.TIMELINE.HORIZONTAL),
  right: theme.spacing(OVERLAY_POSITIONS.TIMELINE.HORIZONTAL),
  bottom: theme.spacing(OVERLAY_POSITIONS.TIMELINE.BOTTOM),
  width: `calc(100% - ${theme.spacing(2)})`,
  transform: "none",
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(1, 4, 2),
  zIndex: theme.zIndex.modal + 2,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.25, 4, 1.75),
    width: COMPONENT_WIDTHS.MOBILE,
  },
}));

/**
 * Timeline styles for desktop devices.
 * Uses OVERLAY_POSITIONS constants for consistent spacing from viewport edges.
 */
export const DesktopCard = styled(Paper)(({ theme }) => ({
  ...baseSheetStyles(theme),
  left: "50%",
  bottom: theme.spacing(OVERLAY_POSITIONS.TIMELINE.BOTTOM),
  transform: "translateX(-50%)",
  width: TIMELINE_WIDTHS.DESKTOP,
  padding: theme.spacing(2, 5, 3.5),
  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
  height: `${TIMELINE_HEIGHTS.DESKTOP}px`,
  minHeight: `${TIMELINE_HEIGHTS.DESKTOP}px`,
}));
