"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Calendar, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ReportingService } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export default function ReportsPage() {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Reporting Engine</h1>
          <p className="text-sm text-on-surface-variant">Generate regulatory and operational reports.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4"/>} onClick={() => setShowBuilder(!showBuilder)}>
          New Report
        </Button>
      </div>

      {showBuilder && <ReportBuilder onClose={() => setShowBuilder(false)} />}

      <ReportsList />
    </div>
  );
}

function ReportBuilder({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("risk_portfolio");
  const [format, setFormat] = useState("pdf");

  const generateMutation = useMutation({
    mutationFn: ReportingService.generateReport,
    onSuccess: () => {
      // In a real app, invalidating the 'reports' query would refresh the list
      onClose();
    }
  });

  return (
    <Card className="bg-surface border border-primary/20">
      <CardHeader title="Generate New Report" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Report Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 rounded-lg bg-surface-variant/10 border border-white/10 text-sm text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="risk_portfolio">Portfolio Risk Assessment</option>
            <option value="regulatory_sarb">Regulatory Return (SARB)</option>
            <option value="tbml_summary">TBML Alert Summary</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Date Range</label>
          <select className="w-full p-2 rounded-lg bg-surface-variant/10 border border-white/10 text-sm text-on-surface focus:border-primary focus:outline-none">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Format</label>
          <div className="flex gap-2">
            {['PDF', 'CSV', 'XBRL'].map(f => (
              <button
                key={f}
                onClick={() => setFormat(f.toLowerCase())}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  format === f.toLowerCase() 
                    ? "bg-primary/20 border-primary text-primary" 
                    : "bg-surface-variant/5 border-white/10 text-on-surface-variant hover:bg-surface-variant/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button 
          isLoading={generateMutation.isPending}
          onClick={() => generateMutation.mutate({ type, dateRange: "30d", format })}
        >
          Generate
        </Button>
      </div>
    </Card>
  );
}

function ReportsList() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: ReportingService.getReports,
    initialData: []
  });

  return (
    <Card>
      <CardHeader 
        title="Generated Reports" 
        action={<Button size="sm" variant="ghost" leftIcon={<Filter className="w-4 h-4"/>}>Filter</Button>}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/10 border-b border-white/5">
            <tr>
              <th className="px-6 py-3">Report Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date Generated</th>
              <th className="px-6 py-3">Format</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reports.map((rpt: any) => (
              <tr key={rpt.id} className="hover:bg-surface-variant/5 transition-colors">
                <td className="px-6 py-4 font-medium text-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {rpt.name}
                </td>
                <td className="px-6 py-4 text-on-surface-variant">{rpt.type}</td>
                <td className="px-6 py-4 text-on-surface-variant flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {rpt.date}
                </td>
                <td className="px-6 py-4"><Badge variant="neutral">{rpt.format}</Badge></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1 ml-auto">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}