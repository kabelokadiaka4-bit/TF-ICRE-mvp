"use client";

import ScorecardView from "@/components/ScorecardView";
import DocumentViewer from "@/components/DocumentViewer";
import ExplanationPanel from "@/components/ExplanationPanel";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Building2, MapPin, Calendar, AlertTriangle } from "lucide-react";

export default function AnalystPage() {
  return (
    <div className="space-y-6">
      {/* Applicant Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-white/5 p-6 rounded-2xl shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Acme Manufacturing Ltd.</h1>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Johannesburg, ZA</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> App Date: Nov 20, 2024</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-variant/20 border border-white/5 text-xs">ID: LOAN-2024-8892</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="danger" size="sm" leftIcon={<AlertTriangle className="w-4 h-4" />}>Override Decision</Button>
           <Button>Approve Application</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)] min-h-[600px]">
        {/* Left: Scorecard */}
        <div className="lg:col-span-1 h-full">
          <ScorecardView />
        </div>

        {/* Center: Explanation */}
        <div className="lg:col-span-1 h-full">
          <ExplanationPanel />
        </div>

        {/* Right: Documents */}
        <div className="lg:col-span-1 h-full">
          <DocumentViewer />
        </div>
      </div>
    </div>
  );
}
