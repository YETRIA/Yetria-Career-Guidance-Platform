/**
 * Yetria Career Guidance Platform - API Service
 * 
 * This file contains the Axios-based service layer for communicating with the backend API.
 * All API calls are managed from here.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  PredictionRequest,
  PredictionResponse,
  BatchPredictionRequest,
  BatchPredictionResponse,
  HealthResponse,
  DetailedHealthResponse,
  ModelInfo,
  ApiError,
  ApiResponse
} from '../types/api';

// ===== API CONFIGURATION =====
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = 30000; // 30 seconds

// ===== AXIOS INSTANCE =====
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== REQUEST INTERCEPTOR =====
apiClient.interceptors.request.use(
  (config) => {
    // Request logging
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Add authentication token to all requests
    // Note: Token is managed by setAuthToken function, not here
    // const token = localStorage.getItem('yetria_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success logging
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // Error logging
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Transform error to our format
    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      error: error.response?.statusText || 'Unknown Error',
      message: responseData?.detail || error.message || 'An error occurred',
      detail: responseData?.detail,
      timestamp: new Date().toISOString()
    };
    
    return Promise.reject(apiError);
  }
);

// ===== API SERVICE CLASS =====
class ApiService {
  // ===== HEALTH ENDPOINTS =====
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  }

  async checkDetailedHealth(): Promise<DetailedHealthResponse> {
    const response = await apiClient.get<DetailedHealthResponse>('/api/v1/health/detailed');
    return response.data;
  }

  // ===== PREDICTION ENDPOINTS =====
  async predictCareer(request: PredictionRequest): Promise<PredictionResponse> {
    const response = await apiClient.post<PredictionResponse>('/api/v1/predict', request);
    return response.data;
  }

  async predictCareerBatch(request: BatchPredictionRequest): Promise<BatchPredictionResponse> {
    const response = await apiClient.post<BatchPredictionResponse>('/api/v1/predict/batch', request);
    return response.data;
  }

  async getModelInfo(): Promise<ModelInfo> {
    const response = await apiClient.get<ModelInfo>('/api/v1/predict/info');
    return response.data;
  }

  // ===== UTILITY METHODS =====
  async testConnection(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // ===== ERROR HANDLING HELPERS =====
  isNetworkError(error: any): boolean {
    return !error.response && error.request;
  }

  isServerError(error: any): boolean {
    return error.response?.status >= 500;
  }

  isClientError(error: any): boolean {
    return error.response?.status >= 400 && error.response?.status < 500;
  }

  getErrorMessage(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Beklenmeyen bir hata oluştu.';
  }
}

// ===== AUTH INTERCEPTOR =====
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// ===== SINGLETON INSTANCE =====
export const apiService = new ApiService();

// ===== EXPORT TYPES =====
export type { ApiError, ApiResponse };

// ===== EXPORT DEFAULT =====
export default apiService;
