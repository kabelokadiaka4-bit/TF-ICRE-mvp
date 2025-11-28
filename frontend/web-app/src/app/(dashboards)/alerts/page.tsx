"use client";

import { AlertTriangle, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function AlertsPage() {
  // Mock Backend Data (simulating tbml-engine)
  const alerts = [
    { id: "ALT-2025-889", severity: "High", entity: "Global Trade Corp", type: "Over-Invoicing", date: "2025-11-28", status: "Open" },
    { id: "ALT-2025-888", severity: "Critical", entity: "Oceanic Logistics", type: "Ghost Shipment", date: "2025-11-28", status: "Investigating" },
    { id: "ALT-2025-887", severity: "Medium", entity: "AgriExports Ltd", type: "Dual Use Goods", date: "2025-11-27", status: "Resolved" },
    { id: "ALT-2025-886", severity: "Low", entity: "TechImports SA", type: "Unusual Route", date: "2025-11-27", status: "False Positive" },
    { id: "ALT-2025-885", severity: "High", entity: "MetalWorks Inc", type: "Under-Invoicing", date: "2025-11-26", status: "Open" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">TBML Alerts</h1>
          <p className="text-on-surface-variant mt-1">Real-time alerts detected by the Trade-Based Money Laundering engine.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline/10 rounded-lg text-sm font-medium hover:bg-surface-variant/20 transition-colors">
                <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                    type="text" 
                    placeholder="Search alerts..." 
                    className="pl-9 pr-4 py-2 bg-surface border border-outline/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <AlertStat label="Critical Alerts" value="3" color="text-red-400" />
         <AlertStat label="High Priority" value="12" color="text-orange-400" />
         <AlertStat label="Investigating" value="8" color="text-blue-400" />
         <AlertStat label="Resolved Today" value="15" color="text-green-400" />
      </div>

      <div className="space-y-4">
        {alerts.map((alert, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={alert.id} 
            className="bg-surface p-4 rounded-xl border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${
                    alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 
                    alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                }`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-on-surface group-hover:text-primary transition-colors">{alert.entity}</h4>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-1">
                        <span className="font-mono text-xs bg-surface-variant/30 px-1.5 rounded">{alert.id}</span>
                        <span>•</span>
                        <span>{alert.type}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 md:pr-4">
                <div className="text-right">
                    <div className="text-sm font-medium text-on-surface">{alert.date}</div>
                    <div className="text-xs text-on-surface-variant">Detected</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    alert.status === 'Open' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                    alert.status === 'Investigating' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                    'border-green-500/30 text-green-400 bg-green-500/10'
                }`}>
                    {alert.status}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AlertStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="bg-surface p-4 rounded-xl border border-outline/10 flex items-center justify-between">
            <span className="text-on-surface-variant text-sm font-medium">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
        </div>
    )
}
