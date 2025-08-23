import { APP_MIN_WIDTH } from "@/constants";
import { Paper, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";

const baseSheetStyles = (theme: Theme): React.CSSProperties => ({
  position: "fixed",
  borderRadius: 18,
  boxShadow: theme.shadows[3],
  zIndex: theme.zIndex.modal,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
});

export const MobileSheet = styled(Paper)(({ theme }) => ({
  ...baseSheetStyles(theme),
  left: theme.spacing(1),
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  boxShadow: theme.shadows[8],
  padding: theme.spacing(0.5, 3, 1, 3),
  zIndex: theme.zIndex.modal + 2,
  width: `calc(100% - ${theme.spacing(2)})`,
  minWidth: APP_MIN_WIDTH,
}));

export const MediumSheet = styled(Paper)(({ theme }) => ({
  ...baseSheetStyles(theme),
  left: "50%",
  bottom: theme.spacing(5),
  transform: "translateX(-50%)",
  width: "80%",
  boxShadow: theme.shadows[6],
  padding: theme.spacing(1, 3.5, 1, 3.5),
  zIndex: theme.zIndex.modal + 2,
  maxWidth: 700,
}));

export const DesktopCard = styled(Paper)(({ theme }) => ({
  ...baseSheetStyles(theme),
  right: "50%",
  bottom: theme.spacing(5),
  transform: "translate(50%, 0)",
  width: "70%",
  padding: theme.spacing(2, 4, 4, 4),
  maxWidth: 900,
}));
