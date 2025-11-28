"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, label, showValue = true, color = "bg-primary", className }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-xs font-medium text-on-surface-variant">
          {label && <span>{label}</span>}
          {showValue && <span>{value}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-surface-variant/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={clsx("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}
