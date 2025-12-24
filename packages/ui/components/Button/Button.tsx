import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";

export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "text" | "contained" | "outlined";
  children: React.ReactNode;
  startIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "contained",
  children,
  startIcon,
  ...props
}) => {
  return (
    <MuiButton variant={variant} startIcon={startIcon} {...props}>
      {children}
    </MuiButton>
  );
};

export default Button;
