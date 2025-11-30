"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button"; // Added Button import
import { useQuery } from "@tanstack/react-query";
import { DataService } from "@/lib/api";
import { CheckCircle2, AlertTriangle, Clock, Database, RefreshCw } from "lucide-react"; // Added RefreshCw
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function DataQualityPage() {
  const { data: metrics, isLoading, refetch } = useQuery({ // Added refetch
    queryKey: ['data-quality'],
    queryFn: DataService.getDataQualityMetrics,
    initialData: {
      overall_score: 94,
      completeness: 98,
      accuracy: 92,
      timeliness: 95,
      datasets: [
        { name: "loans_raw", rows: 150000, quality: 88 },
        { name: "customer_kyc", rows: 45000, quality: 96 },
        { name: "transaction_logs", rows: 2500000, quality: 99 }
      ]
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-on-surface">Data Quality Dashboard</h1>
        <Button 
            size="sm" 
            variant="outline" 
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
        >
            Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Overall Quality" 
          value={`${metrics.overall_score}/100`} 
          trend={{ value: 2, label: "improved", direction: "up" }}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard 
          title="Completeness" 
          value={`${metrics.completeness}%`} 
          trend={{ value: 0, label: "stable", direction: "neutral" }}
          icon={<Database className="w-5 h-5" />}
        />
        <StatCard 
          title="Accuracy" 
          value={`${metrics.accuracy}%`} 
          trend={{ value: -1, label: "declined", direction: "down" }}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard 
          title="Timeliness" 
          value={`${metrics.timeliness}%`} 
          trend={{ value: 5, label: "faster", direction: "up" }}
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Dataset Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Dataset Quality Scores" subtitle="Health check per table" />
          <div className="space-y-6">
            {metrics.datasets.map((ds: any) => (
              <div key={ds.name}>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium text-on-surface">{ds.name}</span>
                  <span className="text-on-surface-variant font-mono">{ds.quality}/100</span>
                </div>
                <ProgressBar 
                  value={ds.quality} 
                  color={ds.quality > 90 ? "bg-green-500" : ds.quality > 75 ? "bg-yellow-500" : "bg-red-500"} 
                  showValue={false}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Critical Issues" subtitle="Requires immediate attention" />
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-error">High Null Rate in 'credit_score'</div>
                <div className="text-xs text-error/80 mt-1">Table: loans_raw • Impact: 15% of rows</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-start">
              <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-yellow-500">Ingestion Lag Detected</div>
                <div className="text-xs text-yellow-500/80 mt-1">Source: Core Banking • Lag: 45 mins</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}