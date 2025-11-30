"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Play, RotateCw, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataService } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

export default function DataIngestionPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const { data: pipelines, isLoading, refetch } = useQuery({
    queryKey: ['pipelines'],
    queryFn: DataService.getPipelineStatus,
    initialData: [
      { id: "dag_daily_ingestion", name: "Daily Data Ingestion", status: "success", lastRun: "2024-11-25T02:30:00Z", duration: "45m" },
      { id: "dag_quality_check", name: "Data Quality Checks", status: "success", lastRun: "2024-11-25T03:15:00Z", duration: "12m" },
      { id: "dag_model_training", name: "Credit Model Retraining", status: "running", lastRun: "2024-11-25T10:00:00Z", duration: "1h 20m" },
    ]
  });

  const triggerMutation = useMutation({
    mutationFn: async (pipelineId: string) => {
      // Simulate API call to trigger Airflow DAG
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      // In a real app, this would re-fetch the pipeline status
      refetch();
    }
  });

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      setUploadQueue(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      setUploadQueue(prev => [...prev, ...files]);
    }
  };

  const uploadFiles = () => {
    // Simulate upload process
    setUploadQueue([]);
    // Show success message (mock)
    alert("Files uploaded to landing zone successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Data Ingestion Hub</h1>
          <p className="text-sm text-on-surface-variant">Manage data pipelines and upload raw datasets.</p>
        </div>
        <Button 
            leftIcon={triggerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            onClick={() => triggerMutation.mutate("dag_daily_ingestion")}
            disabled={triggerMutation.isPending}
        >
            {triggerMutation.isPending ? "Triggering..." : "Trigger Pipeline"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <Card className="lg:col-span-2">
          <CardHeader title="Manual Ingestion" subtitle="Upload CSV/Excel/Parquet files to Cloud Storage" />
          
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer relative overflow-hidden ${
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-outline/20 hover:border-primary/50 hover:bg-surface-variant/10"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input 
                type="file" 
                multiple 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileSelect}
            />
            <div className="w-16 h-16 rounded-full bg-surface-variant/50 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-on-surface mb-2">Drag & drop files here</p>
            <p className="text-sm text-on-surface-variant mb-6">or click to browse from your computer</p>
            <Button variant="secondary" className="pointer-events-none">Select Files</Button>
          </div>

          {/* Upload Queue */}
          <AnimatePresence>
            {uploadQueue.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-on-surface">Upload Queue ({uploadQueue.length})</h4>
                        <Button size="sm" onClick={uploadFiles}>Start Upload</Button>
                    </div>
                    <div className="space-y-2">
                        {uploadQueue.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-variant/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-on-surface-variant" />
                                    <span className="text-sm text-on-surface">{file.name}</span>
                                </div>
                                <span className="text-xs text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Pipeline Monitor */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader 
            title="Pipeline Status" 
            subtitle="Airflow DAGs" 
            action={
                <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            }
          />
          <div className="flex-1 space-y-4">
            {pipelines.map((dag: any) => (
              <div key={dag.id} className="p-4 rounded-xl bg-surface-variant/5 border border-white/5 hover:bg-surface-variant/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm text-on-surface">{dag.name}</div>
                  <StatusBadge status={dag.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dag.duration}</span>
                  <span>{new Date(dag.lastRun).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Data Catalog Preview */}
      <Card>
        <CardHeader title="Available Datasets" subtitle="BigQuery tables ready for analysis" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/10 border-b border-white/5">
              <tr>
                <th className="px-6 py-3">Dataset Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Rows</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-surface-variant/5">
                <td className="px-6 py-4 font-medium text-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> loans_raw
                </td>
                <td className="px-6 py-4 text-on-surface-variant">Table (BigQuery)</td>
                <td className="px-6 py-4">1.2M</td>
                <td className="px-6 py-4">2 hours ago</td>
                <td className="px-6 py-4 text-right text-primary text-xs cursor-pointer hover:underline">Query</td>
              </tr>
              <tr className="hover:bg-surface-variant/5">
                <td className="px-6 py-4 font-medium text-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" /> customer_360
                </td>
                <td className="px-6 py-4 text-on-surface-variant">View (BigQuery)</td>
                <td className="px-6 py-4">450k</td>
                <td className="px-6 py-4">1 day ago</td>
                <td className="px-6 py-4 text-right text-primary text-xs cursor-pointer hover:underline">Query</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'success') return <Badge variant="success">Success</Badge>;
  if (status === 'running') return <Badge variant="info">Running</Badge>;
  return <Badge variant="error">Failed</Badge>;
}