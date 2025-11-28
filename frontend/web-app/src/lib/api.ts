"use client";

import axios from "axios";
import { auth } from "./firebase";

// Base URLs for microservices
// In a real setup, these would be environment variables or a single API Gateway URL
const SCORING_API_URL = process.env.NEXT_PUBLIC_SCORING_API_URL || "https://scoring-engine-api.run.app";
const GOVERNANCE_API_URL = process.env.NEXT_PUBLIC_GOVERNANCE_API_URL || "https://governance-engine-api.run.app";
const TBML_API_URL = process.env.NEXT_PUBLIC_TBML_API_URL || "https://tbml-engine-api.run.app";

// Create an Axios instance
const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject Firebase Auth Token
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;

// --- API Functions ---

// Scoring Engine
export const scoringApi = {
  getScore: async (entityId: string) => {
    const response = await apiClient.post(`${SCORING_API_URL}/v1/score`, { entity_id: entityId });
    return response.data;
  },
  getExplanation: async (loanId: string) => {
    const response = await apiClient.get(`${SCORING_API_URL}/v1/explain/${loanId}`);
    return response.data;
  }
};

// Governance Engine
export const governanceApi = {
  getModels: async () => {
    // Placeholder for fetching list of models (this endpoint might need to be added to backend)
    // For now, returning mock data is handled in the component, but we'll prep the call
    // return (await apiClient.get(`${GOVERNANCE_API_URL}/v1/models`)).data;
    return []; 
  },
  registerModel: async (modelData: any) => {
    return (await apiClient.post(`${GOVERNANCE_API_URL}/v1/governance/model/register`, modelData)).data;
  }
};

// TBML Engine
export const tbmlApi = {
  checkTransaction: async (transactionData: any) => {
    return (await apiClient.post(`${TBML_API_URL}/v1/tbml/check`, transactionData)).data;
  }
};
