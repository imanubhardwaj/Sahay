import React from "react";
import { clsx } from "clsx";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large";
  color?: string;
  edge?: "start" | "end" | false;
  "aria-label"?: string;
}

const sizeClasses = {
  small: "p-1",
  medium: "p-2",
  large: "p-3",
};

export default function IconButton({
  className,
  size = "medium",
  children,
  disabled,
  edge,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full transition-colors hover:bg-black/10 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        sizeClasses[size],
        edge === "start" && "-ml-2",
        edge === "end" && "-mr-2",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
