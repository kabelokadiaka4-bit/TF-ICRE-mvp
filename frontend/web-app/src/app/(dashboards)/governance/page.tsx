// frontend/web-app/src/app/(dashboards)/governance/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, Settings, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { GovernanceService } from '@/lib/api';
import { Card, CardHeader } from '@/components/ui/Card';

export default function GovernancePage() {
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [policyRules, setPolicyRules] = useState<any[]>([]);
  const [modelRegistry, setModelRegistry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [auditData, policyData, modelData] = await Promise.all([
        GovernanceService.getAuditTrail({}), // No filters for now
        // GovernanceService.getPolicyRules(), // Assuming this will be an API call
        Promise.resolve([ // Mock policy rules
          { id: "pol1", name: "NCA Affordability", status: "active", version: "1.0", code: "data.loan.dti < 0.45" },
          { id: "pol2", name: "POPIA Data Sovereignty", status: "active", version: "1.0", code: "data.resource.location == 'africa-south1'" },
        ]),
        GovernanceService.getModels(), // Mock API call
      ]);

      setAuditTrail(auditData.results || []);
      setPolicyRules(policyData || []);
      setModelRegistry(modelData || []);
    } catch (err) {
      console.error("Failed to load governance data:", err);
      setError("Failed to load governance data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleAdjustRule = (ruleId: string) => {
    alert(`Adjusting rule: ${ruleId}`);
    // Implement modal or new page for rule adjustment
  };

  const handleApprovePolicyChange = (policyId: string) => {
    alert(`Approving policy change for: ${policyId}`);
    // Implement API call to approve policy
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Governance & Audit Console</h1>
            <p className="text-gray-500">Manage policies, audit trails, and model registry.</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700
            hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? '' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Audit Trail Section */}
      <Card>
        <CardHeader title="Audit Trail" action={<button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">View Full Log</button>} />
        {auditTrail.length > 0 ? (
          <div className="space-y-3">
            {auditTrail.map((entry: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-3">
                <p className="text-sm font-medium text-gray-900">{entry.event_type} by {entry.entity_id}</p>
                <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No recent audit entries.</p>
        )}
      </Card>

      {/* Policy Rules Section */}
      <Card>
        <CardHeader title="Policy Rules (Regulations-as-Code)" action={<button className="px-3 py-1 text-sm bg-green-500 text-white rounded-md">Add New Rule</button>} />
        {policyRules.length > 0 ? (
          <div className="space-y-4">
            {policyRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{rule.name} (v{rule.version})</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {rule.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded-md overflow-x-auto">{rule.code}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAdjustRule(rule.id)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600">Adjust Rule</button>
                  <button onClick={() => handleApprovePolicyChange(rule.id)} className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600">Approve Changes</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No policy rules defined.</p>
        )}
      </Card>

      {/* Model Registry Section */}
      <Card>
        <CardHeader title="Model Registry" action={<button className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md">Register New Model</button>} />
        {modelRegistry.length > 0 ? (
          <div className="space-y-3">
            {modelRegistry.map((model: any, index: number) => (
              <div key={index} className="border-l-4 border-purple-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{model.model_name} (ID: {model.model_id})</p>
                <p className="text-xs text-gray-500">Owner: {model.owner} • Status: {model.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No models registered.</p>
        )}
      </Card>
    </div>
  );
}