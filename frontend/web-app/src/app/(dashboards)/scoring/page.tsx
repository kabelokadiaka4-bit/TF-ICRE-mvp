"use client";

import { Activity, BarChart3, GitBranch, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function ScoringModelsPage() {
  // Mock Backend Data (would typically come from api.ts -> scoring-engine)
  const models = [
    { id: "SM-001", name: "SME Credit Risk v2", type: "Credit Risk", status: "Active", accuracy: "94.2%", lastRun: "2h ago" },
    { id: "SM-002", name: "Trade Fraud Detection", type: "Fraud", status: "Training", accuracy: "88.5%", lastRun: "N/A" },
    { id: "SM-003", name: "ESG Compliance Score", type: "Compliance", status: "Active", accuracy: "91.0%", lastRun: "1d ago" },
    { id: "SM-004", name: "Liquidity Forecast", type: "Financial", status: "Deprecated", accuracy: "76.4%", lastRun: "30d ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Scoring Models</h1>
          <p className="text-on-surface-variant mt-1">Manage and monitor AI/ML risk scoring models.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          New Model
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Active Models" value="12" change="+2 this week" icon={Activity} color="text-green-400" />
        <StatsCard title="Avg. Accuracy" value="92.4%" change="+1.2% improvement" icon={BarChart3} color="text-blue-400" />
        <StatsCard title="Total Predictions" value="1.4M" change="Last 30 days" icon={GitBranch} color="text-purple-400" />
      </div>

      {/* Models List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-outline/10 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b border-outline/10 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Deployed Models</h3>
          <button className="text-sm text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-variant/30 text-on-surface-variant font-medium uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Model Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Last Run</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-surface-variant/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-on-surface">{model.name}</div>
                    <div className="text-xs text-on-surface-variant font-mono">{model.id}</div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{model.type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={model.status} />
                  </td>
                  <td className="px-6 py-4 font-medium">{model.accuracy}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{model.lastRun}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-primary/80 font-medium text-xs">Config</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-outline/10 shadow-sm hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-on-surface-variant text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-surface-variant/30 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-on-surface-variant mt-4">{change}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-500/10 text-green-400 border-green-500/20",
    Training: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Deprecated: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-500/10 text-gray-400"}`}>
      {status}
    </span>
  );
}
