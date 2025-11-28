"use client";

import { FileText, Download, Share2, Calendar, ChevronRight } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { title: "Monthly Compliance Audit", date: "Nov 2025", size: "2.4 MB", type: "PDF" },
    { title: "High Risk Entities Summary", date: "Nov 28, 2025", size: "850 KB", type: "CSV" },
    { title: "Quarterly TBML Analysis", date: "Q3 2025", size: "4.1 MB", type: "PDF" },
    { title: "Model Performance Review", date: "Oct 2025", size: "1.2 MB", type: "PDF" },
    { title: "Transaction Volume Report", date: "Nov 2025", size: "3.8 MB", type: "XLSX" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Reports & Analytics</h1>
        <p className="text-on-surface-variant mt-1">Access generated reports and regulatory filings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary" /> Recent Generated Reports
          </h2>
          <div className="bg-surface border border-outline/10 rounded-2xl overflow-hidden">
            {reports.map((report, i) => (
              <div key={i} className="p-4 flex items-center justify-between border-b border-outline/10 last:border-0 hover:bg-surface-variant/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-variant/30 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-on-surface group-hover:text-primary transition-colors">{report.title}</h3>
                    <div className="text-xs text-on-surface-variant flex items-center gap-2">
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-variant/50 text-xs">{report.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 hover:bg-surface-variant/30 rounded-full text-on-surface-variant hover:text-primary" title="Download">
                     <Download className="w-4 h-4" />
                   </button>
                   <button className="p-2 hover:bg-surface-variant/30 rounded-full text-on-surface-variant hover:text-primary" title="Share">
                     <Share2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Generate */}
        <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-primary mb-4">Generate New Report</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Report Type</label>
                        <select className="w-full bg-surface border border-outline/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                            <option>Compliance Audit</option>
                            <option>Risk Assessment</option>
                            <option>Transaction History</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Date Range</label>
                        <select className="w-full bg-surface border border-outline/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                            <option>Last 30 Days</option>
                            <option>This Quarter</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="bg-surface border border-outline/10 rounded-2xl p-6">
                <h3 className="font-semibold text-on-surface mb-4">Scheduled Reports</h3>
                <div className="space-y-3">
                    {['Weekly Risk Summary', 'Monthly Executive Brief'].map(item => (
                        <div key={item} className="flex items-center justify-between text-sm">
                            <span className="text-on-surface-variant">{item}</span>
                            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 text-xs text-primary font-medium flex items-center justify-center gap-1 hover:underline">
                    Manage Schedule <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props: any) {
    return (
        <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
    )
}
