import { forwardRef } from "react";
import { clsx } from "clsx";

export type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  borderColor?: string;
  endAdornment?: React.ReactNode;
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  variant?: "outlined" | "standard" | "filled";
  multiline?: boolean;
  rows?: number;
  sx?: unknown;
  slotProps?: unknown;
};

const Input = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className,
      endAdornment,
      label,
      error,
      helperText,
      fullWidth,
      variant,
      borderColor,
      multiline,
      rows,
      sx,
      slotProps,
      ...rest
    },
    ref,
  ) => {
    return (
      <div className={clsx("relative", fullWidth && "w-full")}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={clsx(
              "w-full h-12 px-3 text-sm rounded-lg border outline-none transition-colors",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 hover:border-gray-400",
              endAdornment && "pr-10",
              className,
            )}
            style={borderColor ? { borderColor } : undefined}
            {...rest}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {endAdornment}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={clsx(
              "mt-1 text-xs",
              error ? "text-red-500" : "text-gray-500",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
