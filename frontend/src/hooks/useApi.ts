/**
 * Yetria Career Guidance Platform - API Hooks
 * 
 * Bu dosya API çağrıları için React hooks içerir.
 * Loading states, error handling ve data management sağlar.
 */

import { useState, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';
import {
  PredictionRequest,
  PredictionResponse,
  BatchPredictionRequest,
  BatchPredictionResponse,
  HealthResponse,
  DetailedHealthResponse,
  ModelInfo
} from '../types/api';

// ===== GENERIC API HOOK =====
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiActions<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiState<T> & UseApiActions<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiService.getErrorMessage(apiError);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError
  };
}

// ===== SPECIFIC API HOOKS =====

// Health Check Hook
export function useHealthCheck() {
  return useApi(apiService.checkHealth);
}

export function useDetailedHealthCheck() {
  return useApi(apiService.checkDetailedHealth);
}

// Prediction Hooks
export function useCareerPrediction() {
  return useApi(apiService.predictCareer);
}

export function useBatchCareerPrediction() {
  return useApi(apiService.predictCareerBatch);
}

export function useModelInfo() {
  return useApi(apiService.getModelInfo);
}

// ===== CUSTOM HOOKS =====

// Connection Test Hook
export function useConnectionTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = useCallback(async () => {
    setTesting(true);
    try {
      const connected = await apiService.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      setIsConnected(false);
      return false;
    } finally {
      setTesting(false);
    }
  }, []);

  return {
    isConnected,
    testing,
    testConnection
  };
}

// Assessment Form Hook
export function useAssessmentForm() {
  const [formData, setFormData] = useState<PredictionRequest | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAssessment = useCallback(async (data: PredictionRequest) => {
    setFormData(data);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiService.predictCareer(data);
      setResult(response);
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiService.getErrorMessage(apiError);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(null);
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    formData,
    result,
    loading,
    error,
    submitAssessment,
    resetForm
  };
}

// ===== UTILITY HOOKS =====

// Retry Hook
export function useRetry<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  maxRetries: number = 3
) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async (...args: any[]): Promise<T | null> => {
    let lastError: ApiError | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        if (attempt > 0) {
          setIsRetrying(true);
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
        
        const result = await apiFunction(...args);
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (err) {
        lastError = err as ApiError;
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw lastError;
        }
      }
    }
    
    setIsRetrying(false);
    throw lastError;
  }, [apiFunction, maxRetries]);

  return {
    retryCount,
    isRetrying,
    executeWithRetry
  };
}
