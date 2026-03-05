import React from "react";
import { clsx } from "clsx";
import { AlertVariant } from "./Wrapper";

export interface Props {
  className?: string;
  open?: boolean;
  onClose?: () => void;
  variant?: AlertVariant;
  action?: React.ReactNode;
  children?: string | React.ReactNode;
}

const variantStyles: Record<string, string> = {
  success: "bg-green-600 text-white",
  info: "bg-blue-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-yellow-500 text-black",
};

const variantIcons: Record<string, string> = {
  success: "\u2713",
  info: "\u2139",
  error: "\u2717",
  warning: "\u26A0",
};

export default function Alert({
  children,
  open,
  variant = AlertVariant.INFO,
  onClose,
  className,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="alert"
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium shadow-lg",
        variantStyles[variant],
        className,
      )}
    >
      <span className="text-lg leading-none">{variantIcons[variant]}</span>
      <span className="flex-1 whitespace-pre-wrap">{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity text-current"
          aria-label="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
