"use client";

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { auth } from "./firebase";

// --- Configuration ---
const API_CONFIG = {
  scoring: process.env.NEXT_PUBLIC_SCORING_API_URL || "https://scoring-engine-api.run.app",
  governance: process.env.NEXT_PUBLIC_GOVERNANCE_API_URL || "https://governance-engine-api.run.app",
  tbml: process.env.NEXT_PUBLIC_TBML_API_URL || "https://tbml-engine-api.run.app",
  data: process.env.NEXT_PUBLIC_DATA_API_URL || "https://data-service-api.run.app", // Future/Mock
  admin: process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://admin-service-api.run.app", // Future placeholder
};

// --- Base Client Factory ---
const createClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000, // 10s timeout
  });

  // Request Interceptor: Inject Auth Token
  client.interceptors.request.use(
    async (config) => {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error("Error fetching auth token:", error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Global Error Handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized (e.g., redirect to login or refresh token)
      if (error.response?.status === 401) {
        console.warn("Unauthorized access. User might need to re-login.");
        // Optionally trigger a global logout or refresh flow here
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// --- Service Instances ---
const scoringClient = createClient(API_CONFIG.scoring);
const governanceClient = createClient(API_CONFIG.governance);
const tbmlClient = createClient(API_CONFIG.tbml);
const dataClient = createClient(API_CONFIG.data); // Mock client

// --- API Services ---

export const ReportingService = {
  generateReport: async (params: { type: string; dateRange: string; format: string }) => {
    // Mock report generation
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    return { 
      reportId: `rpt-${Date.now()}`, 
      status: "GENERATED", 
      downloadUrl: "#" 
    };
  },
  getReports: async () => {
    // Mock report history
    return [
      { id: "rpt-001", name: "Monthly Portfolio Risk (Oct 2024)", type: "Risk", date: "2024-11-01", format: "PDF" },
      { id: "rpt-002", name: "Regulatory Return - SARB (Q3)", type: "Compliance", date: "2024-10-15", format: "CSV" },
      { id: "rpt-003", name: "TBML Alert Summary", type: "FinCrime", date: "2024-11-20", format: "PDF" },
    ];
  }
};

export const AdminService = {
  getUsers: async () => {
    return [
      { id: "u1", email: "admin@dbsa.org", role: "admin", status: "active", lastLogin: "2024-11-25T08:00:00Z" },
      { id: "u2", email: "analyst@dbsa.org", role: "analyst", status: "active", lastLogin: "2024-11-25T09:30:00Z" },
      { id: "u3", email: "manager@dbsa.org", role: "manager", status: "active", lastLogin: "2024-11-24T16:45:00Z" },
      { id: "u4", email: "auditor@regulator.gov", role: "viewer", status: "invited", lastLogin: null },
    ];
  },
  updateUserRole: async (userId: string, role: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, userId, role };
  },
  getSystemSettings: async () => {
    return {
      featureFlags: {
        enable_beta_model: false,
        enable_dark_mode_default: true,
        maintenance_mode: false,
      },
      riskThresholds: {
        auto_approve_score: 750,
        manual_review_score: 600,
        tbml_alert_threshold: 70,
      }
    };
  },
  updateSystemSettings: async (settings: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, settings };
  }
};

export const DataService = {
  getPipelineStatus: async () => {
    // Mock Airflow DAG status
    return [
      { id: "dag_daily_ingestion", name: "Daily Data Ingestion", status: "success", lastRun: "2024-11-25T02:30:00Z", duration: "45m" },
      { id: "dag_quality_check", name: "Data Quality Checks", status: "success", lastRun: "2024-11-25T03:15:00Z", duration: "12m" },
      { id: "dag_model_training", name: "Credit Model Retraining", status: "running", lastRun: "2024-11-25T10:00:00Z", duration: "1h 20m" },
    ];
  },
  getDataQualityMetrics: async () => {
    // Mock Data Quality metrics
    return {
      overall_score: 94,
      completeness: 98,
      accuracy: 92,
      timeliness: 95,
      datasets: [
        { name: "loans_raw", rows: 150000, quality: 88 },
        { name: "customer_kyc", rows: 45000, quality: 96 },
        { name: "transaction_logs", rows: 2500000, quality: 99 }
      ]
    };
  }
};

export const ScoringService = {
  getScore: async (entityId: string) => {
    const response = await scoringClient.post<any>("/v1/score", { entity_id: entityId });
    return response.data;
  },
  getExplanation: async (loanId: string) => {
    const response = await scoringClient.get<any>(`/v1/explain/${loanId}`);
    return response.data;
  },
  batchScore: async (requests: any[]) => {
    const response = await scoringClient.post<any>("/v1/score/batch", { requests });
    return response.data;
  }
};

export const GovernanceService = {
  getModels: async () => {
    // Placeholder: Ideally backend has a GET /v1/models endpoint
    // For now, we might need to mock or use a specific query endpoint
    // return (await governanceClient.get("/v1/models")).data;
    return []; 
  },
  registerModel: async (modelData: any) => {
    const response = await governanceClient.post<any>("/v1/governance/model/register", modelData);
    return response.data;
  },
  logOverride: async (overrideData: any) => {
    const response = await governanceClient.post<any>("/v1/governance/override", overrideData);
    return response.data;
  },
  getAuditTrail: async (filters: any) => {
    const response = await governanceClient.get<any>("/v1/governance/audit", { params: filters });
    return response.data;
  },
  updatePolicy: async (policyData: any) => {
    const response = await governanceClient.post<any>("/v1/governance/policy/update", policyData);
    return response.data;
  }
};

export const TbmlService = {
  checkTransaction: async (transactionData: any) => {
    const response = await tbmlClient.post<any>("/v1/tbml/check", transactionData);
    return response.data;
  },
  getNetworkGraph: async (transactionId: string) => {
    const response = await tbmlClient.post<any>("/v1/tbml/network", { transaction_id: transactionId });
    return response.data;
  },
  getAlerts: async () => {
    const response = await tbmlClient.get<any>("/v1/tbml/alerts");
    return response.data;
  }
};

// Export legacy names for backward compatibility if needed, or refactor components to use Services
export const scoringApi = ScoringService;
export const governanceApi = GovernanceService;
export const tbmlApi = TbmlService;