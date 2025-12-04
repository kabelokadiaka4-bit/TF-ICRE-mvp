// frontend/web-app/src/app/(dashboards)/tbml-check/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Link, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Assuming TBMLService exists in ../../lib/api.ts
import { TbmlService } from '@/lib/api'; 

export default function TBMLCheckPage() {
  const [transactionId, setTransactionId] = useState("TXN-12345"); // Mock transaction ID
  const [graphData, setGraphData] = useState<any | null>(null);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTBMLData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Mock API calls to TBML Engine
        const graph = await TbmlService.getNetworkGraph(transactionId);
        const alerts = await TbmlService.getAlerts();
        
        setGraphData(graph);
        setWarnings(alerts); // Assuming alerts are TBML warnings for simplicity here
      } catch (err) {
        console.error("Failed to fetch TBML data:", err);
        setError("Failed to load TBML data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTBMLData();
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">TBML Due Diligence for {transactionId}</h1>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <p className="text-sm text-error-foreground">{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Network Graph Visualization */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Link className="w-5 h-5" />Network Graph Visualization</h2>
          <div className="h-96 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 italic">
            {/* Placeholder for actual graph visualization library (e.g., D3.js, React Flow) */}
            Interactive Network Graph showing transaction entities and relationships.
            {graphData && <pre className="mt-2 text-xs">{JSON.stringify(graphData, null, 2)}</pre>}
          </div>
        </div>

        {/* TBML Warnings & Insights */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" />TBML Warnings & Insights</h2>
          {warnings.length > 0 ? (
            <div className="space-y-3">
              {warnings.map((warning) => (
                <div key={warning.id} className="border-l-4 border-orange-500 pl-3">
                  <p className="text-sm font-medium text-gray-900">{warning.message}</p>
                  <p className="text-xs text-gray-500">Type: {warning.type} • Severity: {warning.severity}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No specific TBML warnings for this transaction.</p>
          )}

          {/* Placeholder for Invoice Mispricing */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2"><DollarSign className="w-4 h-4" />Invoice Mispricing</h3>
            <p className="text-sm text-gray-600">Potential mispricing detected: **$5,000 USD** difference from market average. (Mock data)</p>
          </div>

          {/* Placeholder for Shipment Routes Visualization */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2"><MapPin className="w-4 h-4" />Shipment Routes</h3>
            <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 italic">
              Geospatial visualization of shipment routes. (Mock data)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
