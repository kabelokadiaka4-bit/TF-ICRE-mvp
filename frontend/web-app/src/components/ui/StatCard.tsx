"use client";

import { Card } from "./Card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

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
}

export function StatCard({ title, value, trend, icon, delay = 0 }: StatCardProps) {
  return (
    <Card glow className="flex flex-col justify-between min-h-[140px]" transition={{ duration: 0.5, delay }}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-on-surface-variant">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-surface-variant/20 text-primary">{icon}</div>}
      </div>
      
      <div>
        <div className="text-3xl font-bold text-on-surface tracking-tight mb-2">{value}</div>
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
