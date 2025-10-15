import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ResultsDashboard } from "../components/features/ResultsDashboard";

interface PredictionResult {
  uyum_skorlari: Array<{
    meslek: string;
    uyum: number;
  }>;
  kazanan_meslek: string;
  yetkinlik_karsilastirmasi: Array<{
    yetkinlik: string;
    grup_ortalamasi: number;
    fark: number;
  }>;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { apiService } = await import('../services/apiService');
        
        // Önce navigation state ile geldiyse onu kullan
        const resultFromNav = location.state?.predictionResult;
        if (resultFromNav) {
          setPredictionResult(resultFromNav);
          setIsLoading(false);
          return;
        }
        
        // Navigation state yoksa assessment status kontrol et
        const status = await apiService.getAssessmentStatus();
        
        if (status.has_completed_assessment && status.can_view_results) {
          // Kullanıcının kayıtlı sonuçları var, onları getir
          try {
            const savedResult = await apiService.getAssessmentResult();
            
            // JSON string'leri parse et
            const competencyScores = typeof savedResult.competency_scores === 'string' 
              ? JSON.parse(savedResult.competency_scores) 
              : savedResult.competency_scores;
              
            const occupationScores = typeof savedResult.occupation_compatibility_scores === 'string'
              ? JSON.parse(savedResult.occupation_compatibility_scores)
              : savedResult.occupation_compatibility_scores;
            
            // Saved result'ı PredictionResult formatına çevir
            const formattedResult: PredictionResult = {
              uyum_skorlari: occupationScores || [],
              kazanan_meslek: savedResult.recommended_occupation || '',
              yetkinlik_karsilastirmasi: Object.entries(competencyScores || {}).map(([yetkinlik, skor]) => ({
                yetkinlik,
                grup_ortalamasi: skor as number, // Kayıtlı skorları grup ortalaması olarak kullan
                fark: 0 // Fark bilgisi yok, 0 olarak ayarla
              }))
            };
            
            setPredictionResult(formattedResult);
          } catch (resultError) {
            console.error('❌ Error loading saved results:', resultError);
            // Fallback: eski yöntemi dene
            try {
              const result = await apiService.getResultFromSaved();
              setPredictionResult(result);
            } catch (fallbackError) {
              console.error('❌ Fallback also failed:', fallbackError);
              navigate('/scenarios');
            }
          }
        } else {
          // Kullanıcının tamamlanmış değerlendirmesi yok
          navigate('/assessment-intro');
        }
      } catch (e) {
        console.error('Error checking assessment status:', e);
        // Hata durumunda kullanıcıyı senaryolara yönlendir
        navigate('/scenarios');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [location.state, navigate]);

  // Bridge: map backend prediction structure to ResultsDashboard props
  const toDashboardProps = () => {
    if (!predictionResult) return null;
    const keyMap: Record<string, string> = {
      'Analitik Düşünme': 'analytical',
      'Sayısal Zeka': 'numerical',
      'Stres Yönetimi': 'stress_management',
      'Empati': 'empathy',
      'Takım Çalışması': 'teamwork',
      'Hızlı ve Soğukkanlı Karar Alma': 'decision_making',
      'Duygusal Dayanıklılık': 'resilience',
      'Teknoloji Adaptasyonu': 'technology'
    };
    const skillScores: Record<string, number> = {};
    predictionResult.yetkinlik_karsilastirmasi.forEach(s => {
      const key = keyMap[s.yetkinlik] || s.yetkinlik;
      skillScores[key] = s.grup_ortalamasi;
    });
    return {
      results: {
        skillScores,
        winningCareer: predictionResult.kazanan_meslek,
        responses: {
          winner: predictionResult.kazanan_meslek,
          compatibility: predictionResult.uyum_skorlari
        }
      },
      onEnrollCourse: (_: string) => {}
    } as const;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sonuçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!predictionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 flex items-center justify-center">
        <button 
          onClick={() => navigate('/scenarios')} 
          className="px-8 py-4 rounded-full font-medium border-2 border-white/30 text-white/80 hover:text-white hover:border-white/50 transition-all duration-200"
        >
            Teste Geri Dön
        </button>
      </div>
    );
  }
  const dashboardProps = toDashboardProps();
  return dashboardProps ? (
    <ResultsDashboard 
      results={dashboardProps.results}
      onEnrollCourse={dashboardProps.onEnrollCourse}
    />
  ) : null;
}