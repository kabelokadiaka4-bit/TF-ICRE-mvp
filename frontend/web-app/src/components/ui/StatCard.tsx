"use client";

import { Card } from "./Card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import clsx from "clsx"; // Added missing import

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
  statusColor?: string;
}

export function StatCard({ title, value, trend, icon, delay = 0, onClick, statusColor }: StatCardProps) {
  return (
    <Card 
      glow 
      className={clsx(
        "flex flex-col justify-between min-h-[140px]",
        onClick && "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-shadow",
        statusColor // Apply statusColor to the card itself if needed, or to a specific element within
      )}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-on-surface-variant">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-surface-variant/20 text-primary">{icon}</div>}
      </div>
      
      <div>
        <div className={clsx("text-3xl font-bold text-on-surface tracking-tight mb-2", statusColor)}>{value}</div>
        {trend && (
          <div className="flex items-center gap-2 text-xs">
            <span className={`flex items-center font-medium ${
              trend.direction === "up" ? "text-green-400" : 
              trend.direction === "down" ? "text-red-400" : "text-gray-400"
            }`}>
              {trend.direction === "up" && <ArrowUpRight className="w-3 h-3 mr-1" />}
              {trend.direction === "down" && <ArrowDownRight className="w-3 h-3 mr-1" />}
              {trend.direction === "neutral" && <Minus className="w-3 h-3 mr-1" />}
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-on-surface-variant/60">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
