/**
 * Yetria Career Guidance Platform - API Service
 * 
 * This file contains the Axios-based service layer for communication with the backend API.
 * All API requests are managed from here.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// ===== API CONFIGURATION =====
const API_BASE_URL = 'http://localhost:8000/api/v1';
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
    const apiError = {
      error: error.response?.statusText || 'Unknown Error',
      message: responseData?.detail || error.message || 'An error occurred',
      detail: responseData?.detail,
      timestamp: new Date().toISOString()
    };
    
    return Promise.reject(apiError);
  }
);

// ===== AUTH INTERCEPTOR =====
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// ===== API SERVICE CLASS =====
class ApiService {
  // ===== AUTH ENDPOINTS =====
  async register(userData: {
    email: string;
    password: string;
    name: string;
    age?: number;
    usertypeid: number;
    educationlevelid?: number;
  }) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser() {
    const response = await apiClient.get('/users/me');
    return response.data;
  }

  // ===== SCENARIO ENDPOINTS =====
  async getScenarios(stage?: number) {
    const params = stage ? { stage } : {};
    const response = await apiClient.get('/scenarios', { params });
    return response.data;
  }

  // ===== RESPONSE ENDPOINTS =====
  async postResponses(responses: Array<{ scenario_id: number; option_letter: string }>) {
    console.log('API Service - postResponses called with:', responses);
    console.log('API Service - Current auth token:', apiClient.defaults.headers.common['Authorization']);
    
    const response = await apiClient.post('/responses', responses);
    console.log('API Service - Response received:', response.data);
    return response.data;
  }

  async getProgress() {
    const response = await apiClient.get('/responses/progress');
    return response.data as { total_responses: number; current_stage: number; completed_stages: number[] };
  }

  async getResultFromSaved() {
    const response = await apiClient.get('/responses/result');
    return response.data;
  }

  async getAssessmentResult() {
    const response = await apiClient.get('/assessment-result');
    return response.data;
  }

  async getAssessmentStatus() {
    const response = await apiClient.get('/assessment-status');
    return response.data;
  }

  // ===== MENTORSHIP ENDPOINTS =====
  async getRecommendedMentors(occupationTitle: string) {
    const response = await apiClient.get('/mentors/recommend', { params: { occupation_title: occupationTitle } });
    return response.data as Array<any>;
  }

  async createMentorshipRequest(mentorprofileid: number) {
    const response = await apiClient.post('/mentorship/requests', { mentorprofileid });
    return response.data as any;
  }

  async listMyMentorshipRequests() {
    const response = await apiClient.get('/mentorship/requests');
    return response.data as Array<any>;
  }

  // ===== HEALTH ENDPOINTS =====
  async checkHealth() {
    const response = await apiClient.get('/api/v1/health');
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

  // ===== COURSE SERVICES =====
  
  /**
   * Get all courses
   */
  async getAllCourses(): Promise<any[]> {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get course recommendations based on competency keywords
   */
  async getCourseRecommendations(competencyKeywords: string[], limit: number = 3): Promise<any[]> {
    try {
      const response = await apiClient.post('/courses/recommendations', {
        competency_keywords: competencyKeywords,
        limit: limit
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      throw error;
    }
  }

  getErrorMessage(error: any): string {
    console.log('🟡 apiService.getErrorMessage called with:', error);
    console.log('🟡 isNetworkError:', this.isNetworkError(error));
    
    if (this.isNetworkError(error)) {
      const msg = 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
      console.log('🟡 Returning network error message:', msg);
      return msg;
    }
    
    // Check transformed error format (from response interceptor)
    // error.detail comes from backend's HTTPException detail field
    if (error.detail) {
      // Return the detail message directly (backend sends Turkish messages)
      return error.detail;
    }
    
    // Fallback to original response checking (for errors not caught by interceptor)
    // 401 Unauthorized - Yanlış email/şifre
    if (error.response?.status === 401) {
      return 'Email adresi veya şifre hatalı. Lütfen tekrar deneyin.';
    }
    
    // 422 Unprocessable Entity - Validation errors
    if (error.response?.status === 422) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail) && detail.length > 0) {
        return detail[0].msg || detail[0];
      }
      if (typeof detail === 'string') {
        return detail;
      }
    }
    
    // 400 Bad Request
    if (error.response?.status === 400) {
      const detail = error.response?.data?.detail;
      if (detail) {
        return typeof detail === 'string' ? detail : 'Geçersiz istek.';
      }
    }
    
    // 409 Conflict - Email already exists
    if (error.response?.status === 409) {
      return 'Bu email adresi zaten kullanılıyor.';
    }
    
    // Backend'den gelen mesaj
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Beklenmeyen bir hata oluştu.';
  }
}

// ===== SINGLETON INSTANCE =====
export const apiService = new ApiService();

// ===== EXPORT DEFAULT =====

export default apiService;
