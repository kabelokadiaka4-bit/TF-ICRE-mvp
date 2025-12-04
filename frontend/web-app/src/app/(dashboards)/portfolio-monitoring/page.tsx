// frontend/web-app/src/app/(dashboards)/portfolio-monitoring/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchPortfolioMonitoringData, PortfolioMonitoringData, logInteraction } from '@/services/dashboardService';
import { Card } from '@/components/ui/Card';

export default function PortfolioMonitoringPage() {
  const [data, setData] = useState<PortfolioMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      const fetchedData = await fetchPortfolioMonitoringData();
      setData(fetchedData);
    } catch (err) {
      console.error("Failed to fetch portfolio monitoring data:", err);
      setError("Failed to load portfolio monitoring data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    logInteraction('Refresh Portfolio Monitoring');
    loadData(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Monitoring</h1>
            <p className="text-gray-500">Overview of your "living portfolio" performance and alerts.</p>
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
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Daily PD Changes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Daily PD Changes</h2>
          <LineChart className="w-5 h-5 text-blue-500" />
        </div>
        {data?.dailyPdChanges && data.dailyPdChanges.length > 0 ? (
          <div className="space-y-2">
            {data.dailyPdChanges.map((change, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{change.date}</span>
                <span className={`font-medium ${change.pdChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {change.pdChange > 0 && <TrendingUp className="inline-block w-4 h-4 mr-1" />}
                  {change.pdChange < 0 && <TrendingDown className="inline-block w-4 h-4 mr-1" />}
                  {(change.pdChange * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No daily PD changes recorded.</p>
        )}
      </Card>

      {/* Portfolio Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Portfolio Alerts</h2>
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </div>
        {data?.portfolioAlerts && data.portfolioAlerts.length > 0 ? (
          <div className="space-y-3">
            {data.portfolioAlerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">Loan: {alert.loanId} • Type: {alert.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No new portfolio alerts.</p>
        )}
      </Card>

      {/* Deteriorating Accounts */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deteriorating Accounts</h2>
        {data?.deterioratingAccounts && data.deterioratingAccounts.length > 0 ? (
          <div className="space-y-2">
            {data.deterioratingAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center text-sm">
                <span>{account.customerName}</span>
                <span className="font-medium text-red-600">
                  PD: {(account.currentPD * 100).toFixed(2)}% (was {(account.previousPD * 100).toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No deteriorating accounts.</p>
        )}
      </Card>

      {/* High-Risk Transactions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">High-Risk Transactions</h2>
        {data?.highRiskTransactions && data.highRiskTransactions.length > 0 ? (
          <div className="space-y-2">
            {data.highRiskTransactions.map((transaction) => (
              <div key={transaction.id} className="border-l-4 border-red-700 pl-3">
                <p className="text-sm font-medium text-gray-900">{transaction.details}</p>
                <p className="text-xs text-gray-500">Transaction ID: {transaction.transactionId} • Risk Score: {transaction.riskScore}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No high-risk transactions.</p>
        )}
      </Card>

      {/* Cash Flow Projections */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Projections</h2>
        {data?.cashFlowProjections && data.cashFlowProjections.length > 0 ? (
          <div className="space-y-2">
            {data.cashFlowProjections.map((projection, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{projection.month}</span>
                <span className="font-medium">In: ${projection.projectedInflow.toLocaleString()} / Out: ${projection.projectedOutflow.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No cash flow projections available.</p>
        )}
      </Card>

      {/* Placeholder for Drill-down / Re-scoring */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Drill into Customer Timeline</button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Trigger Re-scoring</button>
        </div>
      </Card>
    </div>
  );
}
