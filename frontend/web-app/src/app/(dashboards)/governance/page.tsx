"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Database, ShieldCheck, Search, Filter, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GovernanceService } from "@/lib/api";
import { PolicyEditor } from "@/components/PolicyEditor";

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState("registry");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Governance Console</h1>
          <p className="text-sm text-on-surface-variant">Oversight for models, policies, and compliance.</p>
        </div>
        <div className="flex bg-surface-variant/10 p-1 rounded-xl">
          {["registry", "policy", "audit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              }`}
            >
              {tab === "registry" && "Model Registry"}
              {tab === "policy" && "Policy Engine"}
              {tab === "audit" && "Audit Trail"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "registry" && <ModelRegistryView />}
      {activeTab === "policy" && <PolicyEngineView />}
      {activeTab === "audit" && <AuditTrailView />}
    </div>
  );
}

function ModelRegistryView() {
  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: GovernanceService.getModels,
    initialData: [
        { id: "SME_Credit_Scoring_XGB_v2.3.1", status: "PRODUCTION", owner: "Risk Analytics", auc: 0.823, bias: "PASS" },
        { id: "TBML_Graph_Network_v1.0.0", status: "STAGING", owner: "FinCrime Unit", auc: 0.78, bias: "PASS" },
        { id: "Cash_Flow_Forecast_LSTM_v1.2", status: "PRODUCTION", owner: "Treasury", auc: 0.89, bias: "WARN" },
    ]
  });

  if (isLoading) return <div>Loading registry...</div>;

  return (
    <Card>
      <CardHeader 
        title="Pan-African Model Registry (PAMR)" 
        subtitle="Centralized tracking of all production ML models"
        action={<Button size="sm" leftIcon={<Database className="w-4 h-4"/>}>Register Model</Button>}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/10 border-b border-white/5">
            <tr>
              <th className="px-6 py-3">Model ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Owner</th>
              <th className="px-6 py-3">Performance (AUC)</th>
              <th className="px-6 py-3">Fairness Check</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {models.map((m: any) => (
              <tr key={m.id} className="hover:bg-surface-variant/5">
                <td className="px-6 py-4 font-medium font-mono text-xs text-on-surface">{m.id}</td>
                <td className="px-6 py-4"><Badge variant={m.status === "PRODUCTION" ? "success" : "warning"}>{m.status}</Badge></td>
                <td className="px-6 py-4 text-on-surface-variant">{m.owner}</td>
                <td className="px-6 py-4 font-bold text-on-surface">{m.auc}</td>
                <td className="px-6 py-4"><Badge variant={m.bias === "PASS" ? "success" : "error"}>{m.bias}</Badge></td>
                <td className="px-6 py-4 text-right text-primary text-xs cursor-pointer hover:underline">View Card</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PolicyEngineView() {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const policies = [
    { id: "nca_affordability", name: "NCA Affordability Check", region: "South Africa", active: true },
    { id: "popia_sovereignty", name: "POPIA Data Sovereignty", region: "Pan-African", active: true },
    { id: "aml_threshold", name: "AML Threshold Monitoring", region: "Global", active: true },
  ];

  const exampleRego = `package credit.policy

default allow = false

# Block loans if Debt-to-Income ratio > 45%
allow {
    input.loan.dti < 0.45
    input.borrower.credit_score >= 600
}

# High-value loans require manual approval
allow {
    input.loan.amount > 1000000
    input.approval.level == "senior_manager"
}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Policy List */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="flex-1 overflow-y-auto">
            <CardHeader title="Policy Library" subtitle="Select a policy to edit" action={<Button size="sm" variant="ghost"><Filter className="w-4 h-4"/></Button>}/>
            <div className="space-y-2">
                {policies.map(p => (
                    <div 
                        key={p.id}
                        onClick={() => setSelectedPolicy(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedPolicy === p.id 
                                ? "bg-primary/10 border-primary/50" 
                                : "bg-surface-variant/5 border-white/5 hover:bg-surface-variant/10"
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-medium text-sm text-on-surface">{p.name}</span>
                            {p.active && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"/>}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="info" className="text-[10px] px-1.5 py-0">{p.region}</Badge>
                            <span className="text-[10px] font-mono text-on-surface-variant">{p.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      {/* Editor */}
      <div className="lg:col-span-2">
        {selectedPolicy ? (
            <PolicyEditor policyId={selectedPolicy} initialCode={exampleRego} />
        ) : (
            <Card className="h-full flex items-center justify-center text-on-surface-variant">
                <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Select a policy to view code</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}

function AuditTrailView() {
  const [filters, setFilters] = useState({ userId: "" });
  
  // Mock data fetch
  const { data: auditLogs, isLoading } = useQuery({
      queryKey: ['audit', filters],
      queryFn: () => GovernanceService.getAuditTrail(filters),
      initialData: {
          results: [
              { timestamp: "2024-11-25T10:30:00Z", event_type: "credit_decision", actor: { email: "analyst@dbsa.org" }, action: "APPROVE", resource: "loan-123" },
              { timestamp: "2024-11-25T11:15:00Z", event_type: "policy_update", actor: { email: "admin@dbsa.org" }, action: "WRITE", resource: "policy:nca_affordability" },
              { timestamp: "2024-11-25T12:05:00Z", event_type: "model_override", actor: { email: "manager@dbsa.org" }, action: "OVERRIDE", resource: "loan-456" },
          ]
      }
  });

  return (
    <Card>
      <CardHeader 
        title="Immutable Audit Log" 
        subtitle="Blockchain-anchored record of all decisions" 
        action={
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant"/>
                    <input 
                        placeholder="Search by User/Resource" 
                        className="pl-9 pr-4 py-2 bg-surface-variant/10 border border-white/5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 w-64"
                    />
                </div>
                <Button variant="outline" leftIcon={<Filter className="w-4 h-4"/>}>Filter</Button>
            </div>
        }
      />
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/10 border-b border-white/5">
                <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Event Type</th>
                    <th className="px-6 py-3">Actor</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Resource</th>
                    <th className="px-6 py-3">Verification</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {auditLogs.results.map((log: any, i: number) => (
                    <tr key={i} className="hover:bg-surface-variant/5">
                        <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4"><Badge variant="neutral">{log.event_type}</Badge></td>
                        <td className="px-6 py-4 font-medium text-on-surface">{log.actor.email}</td>
                        <td className="px-6 py-4 font-bold text-xs">{log.action}</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{log.resource}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                                <ShieldCheck className="w-3 h-3" /> Verified
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </Card>
  );
}
