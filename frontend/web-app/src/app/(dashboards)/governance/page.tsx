"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Database, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { governanceApi } from "@/lib/api";

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
    queryFn: governanceApi.getModels,
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
  return (
    <Card>
      <CardHeader title="Regulations-as-Code Engine" subtitle="Executable compliance rules" action={<Button size="sm">New Rule</Button>} />
      <div className="grid gap-4">
        <PolicyCard 
          title="NCA Affordability Check" 
          code="IF debt_to_income > 0.45 THEN REJECT" 
          active 
          region="South Africa" 
        />
        <PolicyCard 
          title="POPIA Data Sovereignty" 
          code="resource.location MUST BE IN ['africa-south1']" 
          active 
          region="Pan-African" 
        />
        <PolicyCard 
          title="AML Threshold Monitoring" 
          code="IF transaction_amount > 10000 AND risk_score > 70 THEN FLAG_STR" 
          active 
          region="Global" 
        />
      </div>
    </Card>
  );
}

function PolicyCard({ title, code, active, region }: any) {
  return (
    <div className="p-4 rounded-xl bg-surface-variant/5 border border-white/5 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-sm font-bold text-on-surface">{title}</h4>
          <Badge variant="info">{region}</Badge>
          {active && <Badge variant="success">Active</Badge>}
        </div>
        <code className="text-xs text-primary bg-surface-variant/20 px-2 py-1 rounded">{code}</code>
      </div>
      <Button variant="ghost" size="sm">Edit</Button>
    </div>
  );
}

function AuditTrailView() {
  return (
    <Card>
      <CardHeader title="Immutable Audit Log" subtitle="Blockchain-anchored record of all decisions" />
      <div className="text-center py-12 text-on-surface-variant">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Audit logs are immutable and stored in BigQuery.</p>
        <Button variant="outline" className="mt-4">Query Logs</Button>
      </div>
    </Card>
  );
}