// frontend/web-app/src/app/(dashboards)/reports/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { ReportingService } from '@/lib/api';
import { Card, CardHeader } from '@/components/ui/Card';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Portfolio');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [format, setFormat] = useState('PDF');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingHistory, setRefreshingHistory] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchReportHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshingHistory(true);
      setError("");
      const history = await ReportingService.getReports();
      setReportHistory(history);
    } catch (err) {
      console.error("Failed to fetch report history:", err);
      setError("Failed to load report history. Please try again.");
    } finally {
      setRefreshingHistory(false);
    }
  };

  useEffect(() => {
    fetchReportHistory();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const report = await ReportingService.generateReport({ type: reportType, dateRange, format });
      setGeneratedReport(report);
      alert(`Report "${reportType}" generated! Status: ${report.status}`);
      await fetchReportHistory(true); // Refresh history after generating
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500">Generate and review various reports for insights and compliance.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Report Generation Form */}
      <Card>
        <CardHeader title="Generate New Report" />
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option>Portfolio</option>
              <option>TBML</option>
              <option>Compliance Audit</option>
              <option>Basel/ECL Output</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Last Year</option>
            </select>
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">Format</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option>PDF</option>
              <option>CSV</option>
              <option>JSON</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Generating..." : "Generate Report"}
          </button>
        </form>
      </Card>

      {/* Generated Report Display */}
      {generatedReport && (
        <Card>
          <CardHeader title="Recently Generated Report" />
          <p className="text-sm text-gray-700 mb-2">Report ID: {generatedReport.reportId}</p>
          <p className="text-sm text-gray-700 mb-4">Status: {generatedReport.status}</p>
          <a 
            href={generatedReport.downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Download className="mr-2 h-4 w-4" /> Download Report
          </a>
        </Card>
      )}

      {/* Report History Section */}
      <Card>
        <CardHeader title="Report History" action={
          <button 
            onClick={() => fetchReportHistory(true)} 
            disabled={refreshingHistory}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshingHistory ? 'animate-spin' : ''}`} /> Refresh
          </button>
        } />
        {reportHistory.length > 0 ? (
          <div className="space-y-3">
            {reportHistory.map((report) => (
              <div key={report.id} className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{report.name}</p>
                <p className="text-xs text-gray-500">Type: {report.type} • Date: {report.date} • Format: {report.format}</p>
                <a href={report.downloadUrl} className="text-xs text-blue-600 hover:underline">Download</a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No reports generated yet.</p>
        )}
      </Card>
    </div>
  );
}
