import { useState, useEffect } from "react";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Brain,
  Loader2
} from "lucide-react";

import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";

interface ScenarioOption {
  letter: string;
  text: string;
}

interface Scenario {
  id: number;
  text: string;
  competency_name: string;
  options: ScenarioOption[];
}

interface UserResponse {
  scenario_id: number;
  option_letter: string;
}

interface ScenarioFlowPageProps {
  stageNumber?: number;
  onStageComplete?: (stageNumber: number, results: any) => void;
}

export function ScenarioFlowPage({ stageNumber = 1, onStageComplete }: ScenarioFlowPageProps = {}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);

  // Load scenarios from API
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getScenarios(stageNumber);
        setScenarios(data);
      } catch (error) {
        console.error('Error loading scenarios:', error);
        toast.error('Senaryolar yüklenirken bir hata oluştu');
        navigate('/scenarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, [navigate, stageNumber]);

  // Stage countdown
  useEffect(() => {
    if (!showCountdown) return;
    if (countdown <= 0) {
      setShowCountdown(false);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showCountdown, countdown]);

  const currentScenario = scenarios[currentScenarioIndex];
  const progress = scenarios.length > 0 ? ((currentScenarioIndex + 1) / scenarios.length) * 100 : 0;

  const handleOptionSelect = (optionLetter: string) => {
    setSelectedOption(optionLetter);
  };

  const handleNext = () => {
    if (!selectedOption || !currentScenario) return;

    // Save response
    const newResponse: UserResponse = {
      scenario_id: currentScenario.id,
      option_letter: selectedOption
    };

    setResponses(prev => [...prev, newResponse]);

    // Move to next scenario or finish
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // All scenarios completed, submit responses
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(prev => prev - 1);
      setSelectedOption(null);
      
      // Remove the last response
      setResponses(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Add current response if not already added
      if (selectedOption && currentScenario) {
        const finalResponse: UserResponse = {
          scenario_id: currentScenario.id,
          option_letter: selectedOption
        };
        
        // Combine all responses and remove duplicates
        const allResponses = [...responses, finalResponse];
        
        // Remove duplicate responses (same scenario_id)
        const uniqueResponses = allResponses.reduce((acc, response) => {
          acc[response.scenario_id] = response;
          return acc;
        }, {} as Record<number, UserResponse>);
        
        const finalResponses = Object.values(uniqueResponses);
        
        // Debug: Log the responses being sent
        console.log('Submitting responses:', finalResponses);
        console.log('Current stage:', stageNumber);
        
        // Submit to API
        const result = await apiService.postResponses(finalResponses);
        
        // If this is part of a stage system, call onStageComplete
        if (onStageComplete) {
          onStageComplete(stageNumber, result);
        } else {
          // Navigate to results page with the prediction result
          navigate('/results', { 
            state: { 
              predictionResult: result,
              responses: finalResponses 
            } 
          });
        }
      }
    } catch (error: any) {
      console.error('Error submitting responses:', error);
      
      // More detailed error message
      let errorMessage = 'Cevaplar gönderilirken bir hata oluştu';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Sunucu hatası: ${error.response.status} - ${error.response.data?.detail || error.response.data?.message || 'Bilinmeyen hata'}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      } else {
        // Something else happened
        errorMessage = `Beklenmeyen hata: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      tr: {
        'scenario.title': 'Kariyer Değerlendirme Testi',
        'scenario.subtitle': 'Size en uygun kariyer yolunu bulalım',
        'scenario.progress': 'İlerleme',
        'scenario.question': 'Soru',
        'scenario.next': 'İleri',
        'scenario.previous': 'Geri',
        'scenario.finish': 'Testi Bitir',
        'scenario.loading': 'Senaryolar yükleniyor...',
        'scenario.submitting': 'Cevaplar gönderiliyor...'
      },
      en: {
        'scenario.title': 'Career Assessment Test',
        'scenario.subtitle': 'Let\'s find the career path that suits you best',
        'scenario.progress': 'Progress',
        'scenario.question': 'Question',
        'scenario.next': 'Next',
        'scenario.previous': 'Previous',
        'scenario.finish': 'Finish Test',
        'scenario.loading': 'Loading scenarios...',
        'scenario.submitting': 'Submitting responses...'
      }
    };
    return translations[language]?.[key] || key;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-white/80">{t('scenario.loading')}</p>
        </div>
      </div>
    );
  }

  // Countdown overlay
  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ zIndex: 1 }} />
        <div className="relative z-10 text-center">
          <motion.div
            key={countdown}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-white"
          >
            <div className="text-8xl font-bold mb-4">{countdown}</div>
            <div className="text-white/80">Hazır mısın?</div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/80">Senaryo bulunamadı</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-6 py-3 rounded-xl font-medium border-2 border-white/30 text-white/80 hover:text-white hover:border-white/50 transition-all duration-200"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Abstract Data Visualization Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
          className="w-full h-full relative"
        >
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            className="absolute inset-0"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="dataPointCore" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(31, 185, 255, 0.4)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgba(31, 185, 255, 0.1)" stopOpacity="0.2" />
              </radialGradient>
              
              <radialGradient id="dataPointWeak" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.1)" stopOpacity="0.1" />
              </radialGradient>

              <linearGradient id="connectionFaint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(31, 185, 255, 0.1)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="rgba(124, 107, 255, 0.1)" stopOpacity="0.2" />
              </linearGradient>

              <filter id="subtleGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Data points */}
            {[
              { x: 20, y: 15, size: 1, intensity: 0.6 },
              { x: 75, y: 20, size: 1.1, intensity: 0.8 },
              { x: 15, y: 70, size: 1, intensity: 0.7 },
              { x: 85, y: 75, size: 1.2, intensity: 0.8 },
              { x: 45, y: 10, size: 0.5, intensity: 0.3 },
              { x: 55, y: 12, size: 0.6, intensity: 0.2 },
              { x: 35, y: 40, size: 0.7, intensity: 0.3 },
              { x: 60, y: 38, size: 0.8, intensity: 0.4 },
              { x: 50, y: 85, size: 0.6, intensity: 0.4 },
              { x: 45, y: 88, size: 0.8, intensity: 0.3 }
            ].map((point, index) => (
              <motion.g key={`point-${index}`}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={point.size * 2}
                  fill={point.intensity > 0.5 ? "url(#dataPointCore)" : "url(#dataPointWeak)"}
                  opacity={0.1}
                  filter="url(#subtleGlow)"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 4 + (index * 0.1),
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={point.size}
                  fill={point.intensity > 0.5 ? "url(#dataPointCore)" : "url(#dataPointWeak)"}
                  opacity={point.intensity * 0.3}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: point.intensity * 0.3,
                  }}
                  transition={{
                    scale: { duration: 0.8, delay: index * 0.05 },
                    opacity: { duration: 0.8, delay: index * 0.05 },
                  }}
                />
              </motion.g>
            ))}
          </svg>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="mb-4">
            <Badge 
              variant="secondary" 
              className="text-lg px-4 py-2 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border-cyan-400/30 text-cyan-300"
            >
              <Brain className="w-5 h-5 mr-2" />
              {stageNumber}. Aşama
            </Badge>
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ 
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            {t('scenario.title')}
          </h1>
          <p 
            className="text-xl text-white/80 max-w-2xl mx-auto"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400
            }}
          >
            {t('scenario.subtitle')}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white/80">
              {t('scenario.progress')}
            </span>
            <span className="text-sm text-white/60">
              {currentScenarioIndex + 1} / {scenarios.length}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Scenario Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenarioIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="max-w-4xl mx-auto p-8 backdrop-blur-lg border border-white/20 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                boxShadow: `
                  0 8px 32px rgba(31, 185, 255, 0.15), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >

              {/* Question */}
              <div className="mb-8">
                <h2 
                  className="text-2xl font-semibold text-white mb-4"
                  style={{ 
                    fontFamily: "'Poppins', 'Inter', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {t('scenario.question')} {currentScenarioIndex + 1}
                </h2>
                <p 
                  className="text-white/90 leading-relaxed text-lg"
                  style={{ 
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400
                  }}
                >
                  {currentScenario.text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentScenario.options.map((option, index) => (
                  <motion.div
                    key={option.letter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      className={`w-full justify-start text-left h-auto p-4 rounded-xl transition-all duration-300 ${
                        selectedOption === option.letter 
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-400/25' 
                          : 'bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 hover:border-white/40'
                      }`}
                      onClick={() => handleOptionSelect(option.letter)}
                    >
                      <div className="flex items-start">
                        <span className="font-semibold mr-3 min-w-[2rem]">
                          {option.letter}.
                        </span>
                        <span className="text-sm leading-relaxed">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentScenarioIndex === 0}
                  className="px-6 py-3 rounded-xl font-medium border-2 border-white/30 text-white/80 hover:text-white hover:border-white/50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('scenario.previous')}
                </button>

                <button
                  onClick={handleNext}
                  disabled={!selectedOption || isSubmitting}
                  className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('scenario.submitting')}
                    </>
                  ) : currentScenarioIndex === scenarios.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('scenario.finish')}
                    </>
                  ) : (
                    <>
                      {t('scenario.next')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}