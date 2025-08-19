import { Paper, styled } from "@mui/material";

// Mobile bottom sheet styling
export const MobileSheet = styled(Paper)(({ theme }) => ({
  position: "fixed",
  left: theme.spacing(1),
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  boxShadow: theme.shadows[8],
  padding: theme.spacing(0.5, 2.5, 1, 2.5),
  zIndex: theme.zIndex.modal + 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
}));

// Medium sheet for tablets/small desktops
export const MediumSheet = styled(Paper)(({ theme }) => ({
  position: "fixed",
  left: "50%",
  bottom: theme.spacing(5),
  transform: "translateX(-50%)",
  width: "80%",
  borderRadius: 18,
  boxShadow: theme.shadows[6],
  padding: theme.spacing(2, 2.5, 2.5, 2.5),
  zIndex: theme.zIndex.modal + 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
}));

// Desktop card styling
export const DesktopCard = styled(Paper)(({ theme }) => ({
  position: "absolute",
  right: "50%",
  bottom: theme.spacing(5),
  transform: "translate(50%, 0)",
  width: "70%",
  borderRadius: 18,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(2, 4, 4, 4),
  zIndex: theme.zIndex.modal,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
}));

// Slider mark label style helper
export const getSliderMarkLabelStyle = (
  theme: any,
  size: "mobile" | "medium" | "desktop",
) => {
  const fontSizes = {
    mobile: theme.typography.pxToRem(13),
    medium: theme.typography.pxToRem(14),
    desktop: theme.typography.pxToRem(16),
  };
  const marginTops = {
    mobile: 1,
    medium: 2,
    desktop: 2,
  };

  switch (size) {
    case "medium":
      return {
        fontSize: fontSizes.medium,
        mt: marginTops.medium,
        maxWidth: 48,
        textAlign: "center",
        [theme.breakpoints.down("md")]: {
          fontSize: theme.typography.pxToRem(12),
          maxWidth: 36,
        },
      };
    case "mobile":
      return {
        fontSize: fontSizes.mobile,
        mt: marginTops.mobile,
        maxWidth: 32,
        textAlign: "center",
      };
    default:
      return {
        fontSize: fontSizes.desktop,
        mt: marginTops.desktop,
        textAlign: "center",
      };
  }
};
