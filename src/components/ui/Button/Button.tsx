import React from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { TRANSITIONS, OPACITY, SIZES } from "@/constants/ui";

interface ButtonProps extends Omit<MuiButtonProps, "size"> {
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  size = "medium",
  variant = "contained",
  color = "primary",
  fullWidth = false,
  disabled = false,
  children,
  sx,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonSx = {
    transition: TRANSITIONS.NORMAL,
    opacity: isDisabled ? OPACITY.DISABLED : OPACITY.ACTIVE,
    minHeight:
      size === "small"
        ? SIZES.BUTTON_HEIGHT - 8
        : size === "large"
          ? SIZES.BUTTON_HEIGHT + 8
          : SIZES.BUTTON_HEIGHT,
    ...sx,
  };

  return (
    <MuiButton
      size={size}
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      disabled={isDisabled}
      sx={buttonSx}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={size === "small" ? SIZES.ICON_SMALL : SIZES.ICON_MEDIUM}
          color="inherit"
        />
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button;
