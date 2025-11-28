"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "./ui/Card";
import { Gauge } from "./ui/Gauge";
import { ProgressBar } from "./ui/ProgressBar";
import { Activity, ShieldAlert, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { scoringApi } from "../lib/api";

export default function ScorecardView() {
  // Fetch score data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['score', 'entity-123'], // Hardcoded entity for demo
    queryFn: () => scoringApi.getScore('entity-123'),
    // Mock data fallback for demo if API fails/is not running
    initialData: {
      score: 680,
      composite_rating: "B+",
      pd_12m: 0.08,
      lgd: 0.35,
      ead_usd: 450000,
      tbml_score: 45 // Adding this field even if not in standard response yet
    }
  });

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;
  if (isError) return <div className="text-error p-4">Failed to load scorecard.</div>;

  return (
    <Card className="h-full flex flex-col gap-6">
      <CardHeader
        title="Composite Credit Rating"
        subtitle="Multi-dimensional risk assessment"
        action={
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            AI Confidence: 87%
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Main Rating Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-surface-variant/5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error via-yellow-500 to-green-500" />
          <Gauge value={data.score} label="Score" color="#D0BCFF" size={140} />
          <div className="mt-4 text-center">
            <div className="text-4xl font-bold text-primary">{data.composite_rating}</div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Moderate Risk</div>
          </div>
        </div>

        {/* Key Risk Metrics */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <RiskMetric
            label="PD (12m)"
            value={`${(data.pd_12m * 100).toFixed(1)}%`}
            subtext="Prob. of Default"
            color="text-error"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <RiskMetric
            label="LGD"
            value={`${(data.lgd * 100).toFixed(0)}%`}
            subtext="Loss Given Default"
            color="text-on-surface"
            icon={<ShieldAlert className="w-4 h-4" />}
          />
          <RiskMetric
            label="EAD"
            value={`$${(data.ead_usd / 1000).toFixed(0)}k`}
            subtext="Exposure at Default"
            color="text-on-surface"
            icon={<Activity className="w-4 h-4" />}
          />
          <RiskMetric
            label="TBML Score"
            value={`${data.tbml_score || 45}/100`}
            subtext="Trade Integrity"
            color="text-secondary"
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="space-y-4 mt-2">
        <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider border-b border-white/5 pb-2">
          Score Components
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-xs font-medium text-on-surface-variant">Financial (60%)</div>
            <ProgressBar value={72} color="bg-blue-500" showValue={false} className="flex-1" />
            <span className="text-xs font-bold text-blue-400">7.2/10</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-xs font-medium text-on-surface-variant">Qualitative (25%)</div>
            <ProgressBar value={65} color="bg-purple-500" showValue={false} className="flex-1" />
            <span className="text-xs font-bold text-purple-400">6.5/10</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-xs font-medium text-on-surface-variant">Behavioral (15%)</div>
            <ProgressBar value={88} color="bg-green-500" showValue={false} className="flex-1" />
            <span className="text-xs font-bold text-green-400">8.8/10</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RiskMetric({ label, value, subtext, color, icon }: any) {
  return (
    <div className="bg-surface-variant/10 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <span className="text-xs text-on-surface-variant font-medium">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
        <div className="text-[10px] text-on-surface-variant/70">{subtext}</div>
      </div>
    </div>
  );
}