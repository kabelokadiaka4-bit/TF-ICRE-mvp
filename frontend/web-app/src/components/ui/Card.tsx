"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import { ReactNode } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  glow?: boolean;
  delay?: number;
}

export function Card({ children, className, noPadding = false, glow = false, delay = 0, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-white/5 bg-surface-variant/5 backdrop-blur-xl shadow-2xl",
        glow && "before:absolute before:-top-20 before:-right-20 before:h-60 before:w-60 before:rounded-full before:bg-primary/5 before:blur-[80px]",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx("flex items-start justify-between mb-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-on-surface tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
