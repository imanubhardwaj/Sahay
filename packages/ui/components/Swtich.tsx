"use client";

import { clsx } from "clsx";

interface SwitchProps {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export default function IOSSwitch({
  checked,
  onChange,
  disabled,
  className,
  name,
  id,
}: SwitchProps) {
  return (
    <label
      className={clsx(
        "relative inline-flex items-center cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        id={id}
      />
      <div
        className={clsx(
          "w-[42px] h-[26px] rounded-full transition-colors duration-300",
          "bg-gray-200 peer-checked:bg-green-500",
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:bg-white after:rounded-full after:h-[22px] after:w-[22px]",
          "after:transition-transform after:duration-300",
          "peer-checked:after:translate-x-4",
          "after:shadow-sm",
        )}
      />
    </label>
  );
}
