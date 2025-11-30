"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "@/lib/api";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { useState } from "react";

export default function SettingsPage() {
  return (
    <RoleBasedRoute allowedRoles={["admin"]}>
      <SettingsContent />
    </RoleBasedRoute>
  );
}

function SettingsContent() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: AdminService.getSystemSettings,
    initialData: {
        featureFlags: { enable_beta_model: false, enable_dark_mode_default: true, maintenance_mode: false },
        riskThresholds: { auto_approve_score: 750, manual_review_score: 600, tbml_alert_threshold: 70 }
    }
  });

  const updateMutation = useMutation({
    mutationFn: AdminService.updateSystemSettings,
    onSuccess: () => {
        console.log("Settings saved");
    }
  });

  // Local state for editing before save
  const [flags, setFlags] = useState(settings.featureFlags);
  const [thresholds, setThresholds] = useState(settings.riskThresholds);

  const handleSave = () => {
      updateMutation.mutate({ featureFlags: flags, riskThresholds: thresholds });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">System Settings</h1>
          <p className="text-sm text-on-surface-variant">Global configuration and feature flags.</p>
        </div>
        <Button leftIcon={<Save className="w-4 h-4"/>} onClick={handleSave} isLoading={updateMutation.isPending}>
            Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader title="Risk Thresholds" subtitle="Parameters for automated decisioning" />
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Auto-Approve Score (Minimum)</label>
                    <input 
                        type="number" 
                        value={thresholds.auto_approve_score} 
                        onChange={(e) => setThresholds({...thresholds, auto_approve_score: parseInt(e.target.value)})}
                        className="w-full p-2 rounded-lg bg-surface-variant/10 border border-white/10 text-sm text-on-surface focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Manual Review Range (Minimum)</label>
                    <input 
                        type="number" 
                        value={thresholds.manual_review_score} 
                        onChange={(e) => setThresholds({...thresholds, manual_review_score: parseInt(e.target.value)})}
                        className="w-full p-2 rounded-lg bg-surface-variant/10 border border-white/10 text-sm text-on-surface focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">TBML Alert Threshold</label>
                    <input 
                        type="number" 
                        value={thresholds.tbml_alert_threshold} 
                        onChange={(e) => setThresholds({...thresholds, tbml_alert_threshold: parseInt(e.target.value)})}
                        className="w-full p-2 rounded-lg bg-surface-variant/10 border border-white/10 text-sm text-on-surface focus:border-primary outline-none"
                    />
                </div>
            </div>
        </Card>

        <Card>
            <CardHeader title="Feature Flags" subtitle="Toggle system capabilities" />
            <div className="space-y-4">
                {Object.entries(flags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-surface-variant/5">
                        <span className="text-sm font-medium text-on-surface capitalize">{key.replace(/_/g, " ")}</span>
                        <button 
                            onClick={() => setFlags({...flags, [key]: !value})}
                            className={`text-2xl transition-colors ${value ? "text-primary" : "text-on-surface-variant"}`}
                        >
                            {value ? <ToggleRight /> : <ToggleLeft />}
                        </button>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}
