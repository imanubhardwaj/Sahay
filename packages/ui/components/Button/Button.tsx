import React from "react";
import { clsx } from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "text" | "contained" | "outlined";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "success"
    | "warning"
    | "info"
    | "inherit";
  sx?: unknown;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "contained",
  children,
  startIcon,
  endIcon,
  className,
  fullWidth,
  size = "medium",
  disabled,
  color,
  sx,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeClasses = {
    small: "px-3 py-1.5 text-xs gap-1.5",
    medium: "px-4 py-2 text-sm gap-2",
    large: "px-6 py-3 text-base gap-2",
  };

  const variantClasses = {
    contained:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
    outlined:
      "border border-current text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    text: "text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
