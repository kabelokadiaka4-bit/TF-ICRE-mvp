// frontend/web-app/src/app/(dashboards)/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Activity, 
  PlusCircle, 
  RefreshCw 
} from 'lucide-react'; 
import { fetchDashboardData, fetchRecentActivity, logInteraction, DashboardStats, ActivityLog } from '@/services/dashboardService';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

/**
 * DashboardOverview Component
 * 
 * Renders the main landing page for the authenticated user.
 * Provides high-level metrics and quick access to core functionalities.
 */
export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data Fetching
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsData, activityData] = await Promise.all([
        fetchDashboardData(),
        fetchRecentActivity()
      ]);

      setStats(statsData);
      setActivities(activityData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      // Error handling UI logic would go here
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleNavigate = (path: string, context: string) => {
    logInteraction(`Navigate to ${context}`);
    router.push(path);
  };

  const handleRefresh = () => {
    logInteraction('Refresh Dashboard');
    loadData(true);
  };

  const handleQuickAction = (action: string) => {
    logInteraction(`Quick Action Triggered: ${action}`);
    switch (action) {
      case 'Create New Role':
        router.push('/roles/create'); // Placeholder route
        break;
      case 'Start Collaboration Space':
        router.push('/spaces/create'); // Placeholder route
        break;
      case 'Synthesize Training Data':
        router.push('/data/synthesize'); // Placeholder route
        break;
      case 'Configure Models':
        router.push('/models/configure'); // Placeholder route
        break;
      default:
        alert(`Action triggered: ${action}`); 
    }
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
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening with your Second Me.</p>
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
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Metrics Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Spaces" 
          value={String(stats?.activeSpaces || 0)} 
          icon={<LayoutDashboard className="w-6 h-6 text-blue-600" />}
          onClick={() => handleNavigate('/spaces', 'Spaces')}
        />
        <StatCard 
          title="Trained Roles" 
          value={String(stats?.trainedRoles || 0)} 
          icon={<Users className="w-6 h-6 text-purple-600" />}
          onClick={() => handleNavigate('/roles', 'Roles')}
        />
        <StatCard 
          title="Pending Tasks" 
          value={String(stats?.pendingTasks || 0)} 
          icon={<MessageSquare className="w-6 h-6 text-orange-600" />}
          onClick={() => handleNavigate('/tasks', 'Tasks')}
        />
        <StatCard 
          title="System Status" 
          value={stats?.systemHealth === 'optimal' ? 'Optimal' : 'Issues'} 
          icon={<Activity className="w-6 h-6 text-green-600" />}
          statusColor={stats?.systemHealth === 'optimal' ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* New Widgets Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Heatmaps Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1 xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Heatmap</h2>
          {stats?.heatmaps && stats.heatmaps.length > 0 ? (
            <div className="space-y-2">
              {stats.heatmaps.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-700">
                  <span>{item.region}</span>
                  <span className="font-medium">{item.riskScore}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No heatmap data available.</p>
          )}
        </div>

        {/* Alerts Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Critical Alerts</h2>
          {stats?.alerts && stats.alerts.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.map((alert) => (
                <div key={alert.id} className="border-l-4 border-red-500 pl-3">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.type} - {alert.severity} • {alert.timestamp}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No critical alerts.</p>
          )}
        </div>

        {/* Portfolio Trends Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Trends</h2>
          {stats?.portfolioTrends && stats.portfolioTrends.length > 0 ? (
            <div className="space-y-2">
              {stats.portfolioTrends.map((trend, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-700">
                  <span>{trend.date}</span>
                  <span className="font-medium">{trend.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No portfolio trends available.</p>
          )}
        </div>

        {/* TBML Warnings Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">TBML Warnings</h2>
          {stats?.tbmlWarnings && stats.tbmlWarnings.length > 0 ? (
            <div className="space-y-3">
              {stats.tbmlWarnings.map((warning) => (
                <div key={warning.id} className="border-l-4 border-orange-500 pl-3">
                  <p className="text-sm font-medium text-gray-900">{warning.reason}</p>
                  <p className="text-xs text-gray-500">TXN: {warning.transactionId} • Score: {warning.score}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No TBML warnings.</p>
          )}
        </div>

        {/* Compliance Notes Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Notes</h2>
          {stats?.complianceNotes && stats.complianceNotes.length > 0 ? (
            <div className="space-y-3">
              {stats.complianceNotes.map((note) => (
                <div key={note.id} className="border-l-4 border-blue-500 pl-3">
                  <p className="text-sm font-medium text-gray-900">{note.rule}</p>
                  <p className="text-xs text-gray-500">Status: {note.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No compliance notes.</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard 
              title="Create New Role"
              description="Define a new persona with specific memories."
              onClick={() => handleQuickAction('Create Role')}
            />
            <ActionCard 
              title="Start Collaboration Space"
              description="Invite participants to a new room."
              onClick={() => handleQuickAction('Create Space')}
            />
            <ActionCard 
              title="Synthesize Training Data"
              description="Upload documents to train your model."
              onClick={() => handleQuickAction('Upload Data')}
            />
            <ActionCard 
              title="Configure Models"
              description="Adjust base model and thinking parameters."
              onClick={() => handleQuickAction('Configure')}
            />
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="mt-1 min-w-[8px] h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-gray-800 font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp} • {activity.user}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No recent activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ActionCard - A large button for initiating main workflows
 */
const ActionCard = ({ title, description, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 w-full text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
  >
    <div className="p-2 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
      <PlusCircle className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-medium text-gray-900 group-hover:text-blue-700">{title}</h4>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </button>
);