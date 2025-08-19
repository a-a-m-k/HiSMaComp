import { Box, IconButton, styled } from "@mui/material";
import { FLOATING_BUTTON_SIZE } from "../constants";

export const FloatingButtonBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "corner" && prop !== "timelineHeight",
})<{ timelineHeight: number }>(({ theme, timelineHeight }) => ({
  position: "absolute",
  zIndex: theme.zIndex.appBar + 1,
  left: theme.spacing(1),
  top: theme.spacing(2),
  bottom: "auto",
  [theme.breakpoints.down("md")]: {
    // On mobile, position at bottom left above timeline, as first in column
    bottom: theme.spacing(1),
    top: "auto",
  },
  [theme.breakpoints.down("sm")]: {
    // On mobile, position at bottom left above timeline, as first in column
    bottom: timelineHeight + 20,
    top: "auto",
  },
}));

export const FloatingButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  borderRadius: "50%",
  width: FLOATING_BUTTON_SIZE,
  height: FLOATING_BUTTON_SIZE,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "background 0.2s",
  "&:hover": { backgroundColor: "#f5f5f5" },
  "&:focus": {
    backgroundColor: "#f5f5f5",
    outline: "none",
    boxShadow: "none",
  },
}));
