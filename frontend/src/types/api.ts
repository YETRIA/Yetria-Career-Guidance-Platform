/**
 * Yetria Career Guidance Platform - API Types
 * 
 * Bu dosya backend API ile iletişim için gerekli TypeScript tiplerini içerir.
 * Backend'deki Pydantic modelleri ile senkronize tutulmalıdır.
 */

// ===== ENUMS =====
export enum PersonaType {
  BILGISAYAR_MUHENDISI = "Bilgisayar Mühendisi",
  DOKTOR = "Doktor"
}

// ===== REQUEST TYPES =====
export interface CompetencyScores {
  analitik_dusunme: number;
  sayisal_zeka: number;
  stres_yonetimi: number;
  empati: number;
  takim_calismasi: number;
  hizli_karar_alma: number;
  duygusal_dayaniklilik: number;
  teknoloji_adaptasyonu: number;
}

export interface PredictionRequest {
  scores: CompetencyScores;
  user_id?: string;
}

export interface BatchPredictionRequest {
  predictions: PredictionRequest[];
}

// ===== RESPONSE TYPES =====
export interface PredictionResponse {
  predicted_persona: PersonaType;
  confidence: number;
  probabilities: Record<string, number>;
  recommendation: string;
  model_info: {
    model_type: string;
    features_used: string[];
    prediction_confidence: number;
  };
}

export interface BatchPredictionResponse {
  results: PredictionResponse[];
  total_processed: number;
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface DetailedHealthResponse {
  status: string;
  timestamp: string;
  version: string;
  components: {
    api: string;
    model_files: Record<string, boolean>;
    data_file: boolean;
    reports_dir: boolean;
  };
  overall_health: string;
}

export interface ModelInfo {
  model_type: string;
  available_personas: string[];
  required_features: string[];
  score_range: string;
  model_loaded: boolean;
}

// ===== ERROR TYPES =====
export interface ApiError {
  error: string;
  message: string;
  detail?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  detail: string;
}

// ===== UTILITY TYPES =====
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ===== FORM TYPES =====
export interface AssessmentFormData {
  scores: CompetencyScores;
  userInfo?: {
    name?: string;
    email?: string;
    age?: number;
  };
}

// ===== COMPONENT PROPS =====
export interface PredictionResultProps {
  result: PredictionResponse;
  onRetake?: () => void;
  onSave?: () => void;
}

export interface AssessmentFormProps {
  onSubmit: (data: AssessmentFormData) => void;
  loading?: boolean;
  error?: string | null;
}
