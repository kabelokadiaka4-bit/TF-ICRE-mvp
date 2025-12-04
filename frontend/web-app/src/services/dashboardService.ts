// frontend/web-app/src/services/dashboardService.ts

export interface HeatmapData {
  region: string;
  riskScore: number;
}

export interface Alert {
  id: string;
  type: 'TBML' | 'Credit' | 'Compliance';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  timestamp: string;
}

export interface PortfolioTrend {
  date: string;
  value: number; // e.g., total portfolio value or average risk score
}

export interface TBMLWarning {
  id: string;
  transactionId: string;
  reason: string;
  score: number;
}

export interface ComplianceNote {
  id: string;
  rule: string;
  status: 'Compliant' | 'Non-Compliant';
  details: string;
}

export interface PortfolioDailyChange {
  date: string;
  pdChange: number; // Percentage change in PD
}

export interface PortfolioAlert {
  id: string;
  type: 'PD_INCREASE' | 'STATUS_CHANGE';
  message: string;
  loanId: string;
}

export interface DeterioratingAccount {
  id: string;
  customerName: string;
  currentPD: number;
  previousPD: number;
}

export interface HighRiskTransaction {
  id: string;
  transactionId: string;
  riskScore: number;
  details: string;
}

export interface CashFlowProjection {
  month: string;
  projectedInflow: number;
  projectedOutflow: number;
}


export interface DashboardStats {
  activeSpaces: number;
  trainedRoles: number;
  pendingTasks: number;
  systemHealth: 'optimal' | 'degraded';
  // New dashboard data
  heatmaps: HeatmapData[];
  alerts: Alert[];
  portfolioTrends: PortfolioTrend[];
  tbmlWarnings: TBMLWarning[];
  complianceNotes: ComplianceNote[];
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface PortfolioMonitoringData {
  dailyPdChanges: PortfolioDailyChange[];
  portfolioAlerts: PortfolioAlert[];
  deterioratingAccounts: DeterioratingAccount[];
  highRiskTransactions: HighRiskTransaction[];
  cashFlowProjections: CashFlowProjection[];
}

// Logger utility
export const logInteraction = (action: string, details?: any) => {
  console.log(`[User Interaction] ${new Date().toISOString()}: ${action}`, details);
  // In production, send to analytics service (e.g., Mixpanel, Segment)
};

// Mock API Call
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return {
    activeSpaces: 12,
    trainedRoles: 5,
    pendingTasks: 3,
    systemHealth: 'optimal',
    heatmaps: [
      { region: "East Africa", riskScore: 75 },
      { region: "West Africa", riskScore: 60 },
      { region: "Southern Africa", riskScore: 88 },
    ],
    alerts: [
      { id: "al1", type: "TBML", severity: "High", message: "Suspicious transaction detected", timestamp: "2025-11-30T10:00:00Z" },
      { id: "al2", type: "Credit", severity: "Medium", message: "Loan default risk increased", timestamp: "2025-11-29T14:30:00Z" },
    ],
    portfolioTrends: [
      { date: "2025-10-01", value: 100 },
      { date: "2025-10-15", value: 105 },
      { date: "2025-11-01", value: 102 },
      { date: "2025-11-15", value: 108 },
    ],
    tbmlWarnings: [
      { id: "tbw1", transactionId: "TXN001", reason: "Invoice mispricing", score: 75 },
      { id: "tbw2", transactionId: "TXN002", reason: "Circular transaction", score: 82 },
    ],
    complianceNotes: [
      { id: "cn1", rule: "KYC Compliance", status: "Compliant", details: "All documents verified" },
      { id: "cn2", rule: "Sanctions Check", status: "Non-Compliant", details: "Potential hit on sanctions list" },
    ],
  };
};

export const fetchRecentActivity = async (): Promise<ActivityLog[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { id: '1', action: 'Created Space "Marketing"', timestamp: '2 hours ago', user: 'You' },
    { id: '2', action: 'Role "Analyst" finished training', timestamp: '5 hours ago', user: 'System' },
    { id: '3', action: 'Reviewed TBML Warning TXN001', timestamp: '1 hour ago', user: 'Analyst' },
  ];
};

export const fetchPortfolioMonitoringData = async (): Promise<PortfolioMonitoringData> => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    dailyPdChanges: [
      { date: "2025-11-28", pdChange: -0.01 },
      { date: "2025-11-29", pdChange: 0.005 },
      { date: "2025-11-30", pdChange: 0.02 },
    ],
    portfolioAlerts: [
      { id: "pa1", type: "PD_INCREASE", message: "PD increased for Loan #L123", loanId: "L123" },
      { id: "pa2", type: "STATUS_CHANGE", message: "Loan #L456 status changed to delinquent", loanId: "L456" },
    ],
    deterioratingAccounts: [
      { id: "da1", customerName: "Acme Corp", currentPD: 0.15, previousPD: 0.10 },
      { id: "da2", customerName: "Globex Inc", currentPD: 0.08, previousPD: 0.05 },
    ],
    highRiskTransactions: [
      { id: "hrt1", transactionId: "TRX789", riskScore: 85, details: "Large value transaction to high-risk country." },
    ],
    cashFlowProjections: [
      { month: "Dec 2025", projectedInflow: 1200000, projectedOutflow: 800000 },
      { month: "Jan 2026", projectedInflow: 1100000, projectedOutflow: 900000 },
    ],
  };
};
