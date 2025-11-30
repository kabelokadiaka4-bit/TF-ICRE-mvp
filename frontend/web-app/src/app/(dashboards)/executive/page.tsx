"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Download, RefreshCw, Globe, TrendingUp, PieChart, Activity, CalendarDays, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { WorldMap, CountryRiskData } from "@/components/WorldMap";
import { LiveTicker, TickerItem } from "@/components/LiveTicker";
import { useState } from "react";

// Mock Data - Replace with actual API calls
const tickerData: TickerItem[] = [
  { id: 'fx1', label: 'USD/ZAR', value: '18.52', change: '+0.15%', changeType: 'up' },
  { id: 'com1', label: 'Gold Spot', value: '$2,020', change: '-0.3%', changeType: 'down' },
  { id: 'com2', label: 'Crude Oil', value: '$78.23', change: '+1.2%', changeType: 'up' },
  { id: 'fx2', label: 'EUR/KES', value: '158.70', change: '0.0%', changeType: 'neutral' },
];

const trendData = [
  { name: 'Jan', pd: 4.2, lgd: 30 },
  { name: 'Feb', pd: 4.5, lgd: 32 },
  { name: 'Mar', pd: 4.1, lgd: 31 },
  { name: 'Apr', pd: 3.8, lgd: 29 },
  { name: 'May', pd: 3.5, lgd: 28 },
  { name: 'Jun', pd: 3.2, lgd: 28 },
];

const riskDistribution = [
  { name: 'Low Risk', value: 45, color: '#4ade80' },
  { name: 'Medium Risk', value: 35, color: '#fbbf24' },
  { name: 'High Risk', value: 15, color: '#f87171' },
  { name: 'Critical', value: 5, color: '#ef4444' },
];

const africaRiskData: CountryRiskData[] = [
  { country: 'South Africa', riskLevel: 'medium' },
  { country: 'Nigeria', riskLevel: 'high' },
  { country: 'Kenya', riskLevel: 'medium' },
  { country: 'Egypt', riskLevel: 'critical' },
  { country: 'Ghana', riskLevel: 'low' },
];

export default function ExecutivePage() {
  const [dateRange, setDateRange] = useState('Last 6 Months'); // Mock state

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-on-surface tracking-tight"
          >
            Executive Overview
          </motion.h1>
          <p className="text-on-surface-variant mt-1">Portfolio performance, risk exposure, and strategic insights.</p>
        </div>
        <div className="flex gap-3">
           <LiveTicker data={tickerData} className="w-64" /> {/* Live Ticker Integration */}
           <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
           <Button leftIcon={<Download className="w-4 h-4" />}>Export Report</Button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Exposure" 
          value="$42.5B" 
          trend={{ value: 8.5, label: "YoY", direction: "up" }}
          icon={<Globe className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard 
          title="Avg Portfolio PD" 
          value="3.2%" 
          trend={{ value: -0.4, label: "vs last quarter", direction: "up" }}
          icon={<Activity className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard 
          title="Capital Adequacy" 
          value="18.4%" 
          trend={{ value: 0, label: "stable", direction: "neutral" }}
          icon={<PieChart className="w-5 h-5" />}
          delay={0.3}
        />
        <StatCard 
          title="Risk-Adj. Return" 
          value="12.1%" 
          trend={{ value: 1.2, label: "vs target", direction: "up" }}
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0.4}
        />
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 min-h-[400px]" delay={0.5}>
          <CardHeader 
            title="Pan-African Risk Map" 
            subtitle="Concentration risk by jurisdiction" 
            action={
              <div className="relative">
                <Button variant="outline" size="sm" rightIcon={<ChevronDown className="w-4 h-4" />}>
                  <CalendarDays className="w-4 h-4 mr-2" /> {dateRange}
                </Button>
                {/* Dropdown for date range selection would go here */}
              </div>
            }
          />
          <div className="h-[300px] -mt-4"> {/* Adjusted height for map */}
             <WorldMap riskData={africaRiskData} /> {/* WorldMap Integration */}
          </div>
        </Card>

        {/* Compliance Traffic Lights */}
        <Card className="lg:col-span-1" delay={0.6}>
          <CardHeader title="Regulatory Compliance" subtitle="Status by jurisdiction" />
          <div className="space-y-4">
            <ComplianceRow country="South Africa" status="COMPLIANT" color="green" />
            <ComplianceRow country="Nigeria" status="ATTENTION" color="yellow" />
            <ComplianceRow country="Kenya" status="COMPLIANT" color="green" />
            <ComplianceRow country="Ghana" status="COMPLIANT" color="green" />
            <ComplianceRow country="Egypt" status="CRITICAL" color="red" />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Analysis */}
        <Card className="h-[400px]" delay={0.7}>
          <CardHeader 
            title="Risk Trend Analysis" 
            subtitle="6-month Probability of Default (PD) vs Loss Given Default (LGD)"
            action={
              <div className="relative">
                <Button variant="outline" size="sm" rightIcon={<ChevronDown className="w-4 h-4" />}>
                  <CalendarDays className="w-4 h-4 mr-2" /> {dateRange}
                </Button>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D0BCFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D0BCFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLgd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CCC2DC" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#CCC2DC" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#49454F" vertical={false} />
              <XAxis dataKey="name" stroke="#CAC4D0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#CAC4D0" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid #49454F', borderRadius: '12px' }}
                itemStyle={{ color: '#E6E1E5' }}
              />
              <Area type="monotone" dataKey="pd" stroke="#D0BCFF" strokeWidth={3} fillOpacity={1} fill="url(#colorPd)" />
              <Area type="monotone" dataKey="lgd" stroke="#CCC2DC" strokeWidth={3} fillOpacity={1} fill="url(#colorLgd)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Distribution */}
        <Card className="h-[400px]" delay={0.8}>
          <CardHeader title="Portfolio Risk Distribution" subtitle="By exposure volume" />
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={riskDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#CAC4D0" fontSize={12} tickLine={false} axisLine={false} width={80}/>
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid #49454F', borderRadius: '12px' }}
                 itemStyle={{ color: '#E6E1E5' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function ComplianceRow({ country, status, color }: any) {
  const colors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-variant/5 border border-white/5">
      <span className="font-medium text-on-surface">{country}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[color as keyof typeof colors]} animate-pulse`} />
        <span className="text-xs font-bold text-on-surface-variant">{status}</span>
      </div>
    </div>
  );
}