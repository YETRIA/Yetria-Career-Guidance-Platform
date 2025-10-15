import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Compass, 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  Trophy,
  ArrowRight,
  Zap,
  Target,
  Heart,
  Shield
} from "lucide-react";

interface StageJourneyPageProps {
  onStartStage: (stageIndex: number) => void;
  onBack: () => void;
  completedStages: number[];
  currentStage: number;
  onViewResults?: () => void;
}

interface StageCompletionModalProps {
  isOpen: boolean;
  stageNumber: number;
  onContinue: () => void;
}

const StageCompletionModal = ({ isOpen, stageNumber, onContinue }: StageCompletionModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
          boxShadow: `
            0 8px 32px rgba(31, 185, 255, 0.15), 
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `
        }}
      >
        {/* Başarı İkonu */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="w-20 h-20 mx-auto mb-6 relative"
        >
          <div 
            className="absolute inset-0 rounded-full backdrop-blur-lg flex items-center justify-center border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
              boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <Trophy className="w-10 h-10 text-orange-400" />
          </div>
          
          {/* Glow Effect */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: 'radial-gradient(circle, rgba(255, 142, 77, 0.3) 0%, transparent 70%)',
              filter: 'blur(8px)'
            }}
          />
        </motion.div>

        {/* Başlık */}
        <h2 
          className="text-2xl md:text-3xl text-white mb-4"
          style={{ 
            fontFamily: "'Poppins', 'Inter', sans-serif",
            fontWeight: 700
          }}
        >
          Harika! {stageNumber}. Aşamayı Tamamladın
        </h2>

        {/* Açıklama */}
        <p className="text-white/80 text-lg leading-relaxed mb-8">
          Keşif yolculuğuna yönlendiriyorum. Hazır olduğunda bir sonraki aşamaya geçebilirsin.
        </p>

        {/* Devam Et Butonu */}
        <button
          onClick={onContinue}
          className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold text-lg tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 flex items-center gap-3 mx-auto"
          style={{ 
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
          
          <span className="relative flex items-center gap-3">
            Yolculuğa Devam Et
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>

        {/* Glass reflection efekti */}
        <div 
          className="absolute top-4 left-4 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
            width: '80px',
            height: '40px',
            filter: 'blur(15px)'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export function StageJourneyPage({ 
  onStartStage, 
  onBack, 
  completedStages, 
  currentStage,
  onViewResults
}: StageJourneyPageProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion.matches);
  }, []);

  // Check if all stages are completed and redirect to results
  useEffect(() => {
    if (completedStages.length === 4 && onViewResults) {
      // All stages completed, show results
      onViewResults();
    }
  }, [completedStages, onViewResults]);

  // Abstract Data Visualization Grid - Ana sayfayla aynı
  const AbstractDataGrid = () => {
    const gridPoints = [
      { x: 20, y: 15, size: 1, intensity: 0.6, cluster: 'constellation-1' },
      { x: 25, y: 18, size: 0.8, intensity: 0.4, cluster: 'constellation-1' },
      { x: 22, y: 22, size: 1.2, intensity: 0.7, cluster: 'constellation-1' },
      { x: 28, y: 20, size: 0.6, intensity: 0.3, cluster: 'constellation-1' },
      { x: 30, y: 25, size: 0.9, intensity: 0.5, cluster: 'constellation-1' },

      { x: 75, y: 20, size: 1.1, intensity: 0.8, cluster: 'constellation-2' },
      { x: 80, y: 17, size: 0.7, intensity: 0.4, cluster: 'constellation-2' },
      { x: 78, y: 25, size: 1.3, intensity: 0.6, cluster: 'constellation-2' },
      { x: 82, y: 23, size: 0.8, intensity: 0.5, cluster: 'constellation-2' },

      { x: 15, y: 70, size: 1, intensity: 0.7, cluster: 'constellation-3' },
      { x: 20, y: 75, size: 0.9, intensity: 0.5, cluster: 'constellation-3' },
      { x: 18, y: 78, size: 1.1, intensity: 0.6, cluster: 'constellation-3' },
      { x: 12, y: 73, size: 0.7, intensity: 0.4, cluster: 'constellation-3' },

      { x: 85, y: 75, size: 1.2, intensity: 0.8, cluster: 'constellation-4' },
      { x: 88, y: 80, size: 0.8, intensity: 0.4, cluster: 'constellation-4' },
      { x: 82, y: 78, size: 1, intensity: 0.6, cluster: 'constellation-4' },
      { x: 90, y: 77, size: 0.6, intensity: 0.3, cluster: 'constellation-4' },

      // Dağınık veri noktaları
      { x: 45, y: 10, size: 0.5, intensity: 0.3, cluster: 'scattered' },
      { x: 55, y: 12, size: 0.6, intensity: 0.2, cluster: 'scattered' },
      { x: 65, y: 8, size: 0.4, intensity: 0.4, cluster: 'scattered' },
      { x: 35, y: 40, size: 0.7, intensity: 0.3, cluster: 'scattered' },
      { x: 40, y: 45, size: 0.5, intensity: 0.2, cluster: 'scattered' },
      { x: 60, y: 38, size: 0.8, intensity: 0.4, cluster: 'scattered' },
      { x: 70, y: 42, size: 0.6, intensity: 0.3, cluster: 'scattered' },
      { x: 10, y: 45, size: 0.5, intensity: 0.2, cluster: 'scattered' },
      { x: 95, y: 50, size: 0.7, intensity: 0.3, cluster: 'scattered' },
      { x: 50, y: 85, size: 0.6, intensity: 0.4, cluster: 'scattered' },
      { x: 55, y: 90, size: 0.4, intensity: 0.2, cluster: 'scattered' },
      { x: 45, y: 88, size: 0.8, intensity: 0.3, cluster: 'scattered' },
    ];

    const gridConnections = [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 },
      { from: 9, to: 10 }, { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 13, to: 14 }, { from: 14, to: 15 }, { from: 15, to: 16 },
      { from: 2, to: 18 }, { from: 7, to: 21 }, { from: 11, to: 27 }, { from: 15, to: 25 },
      { from: 19, to: 20 }, { from: 22, to: 23 }, { from: 26, to: 27 }
    ];

    return (
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

            {gridConnections.map((connection, index) => {
              const fromPoint = gridPoints[connection.from];
              const toPoint = gridPoints[connection.to];
              
              return (
                <motion.line
                  key={`connection-${index}`}
                  x1={fromPoint.x}
                  y1={fromPoint.y}
                  x2={toPoint.x}
                  y2={toPoint.y}
                  stroke="url(#connectionFaint)"
                  strokeWidth="0.08"
                  opacity="0.15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={!reducedMotion ? { 
                    pathLength: [0, 1, 0.8],
                    opacity: [0, 0.15, 0.05, 0.15]
                  } : { pathLength: 1, opacity: 0.1 }}
                  transition={{ 
                    duration: 8,
                    delay: index * 0.3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                />
              );
            })}

            {gridPoints.map((point, index) => (
              <motion.g key={`point-${index}`}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={point.size * 2}
                  fill={point.intensity > 0.5 ? "url(#dataPointCore)" : "url(#dataPointWeak)"}
                  opacity={0.1}
                  filter="url(#subtleGlow)"
                  animate={!reducedMotion ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  } : {}}
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

          {!reducedMotion && (
            <motion.div
              className="absolute inset-0"
              animate={{
                x: [0, 2, 0, -1, 0],
                y: [0, -1, 0, 1, 0],
                rotate: [0, 0.5, 0, -0.3, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "center center" }}
            >
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  background: `radial-gradient(circle at 30% 30%, 
                    rgba(31, 185, 255, 0.05) 0%,
                    transparent 50%),
                    radial-gradient(circle at 70% 70%, 
                    rgba(124, 107, 255, 0.03) 0%,
                    transparent 60%)`
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  };

  const stages = [
    {
      id: 1,
      title: "1. Aşama",
      icon: Zap,
      color: "from-cyan-400 to-blue-500"
    },
    {
      id: 2,
      title: "2. Aşama", 
      icon: Heart,
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 3,
      title: "3. Aşama",
      icon: Shield,
      color: "from-orange-400 to-red-500"
    },
    {
      id: 4,
      title: "4. Aşama",
      icon: Target,
      color: "from-green-400 to-emerald-500"
    }
  ];

  const getStageState = (stageId: number) => {
    if (completedStages.includes(stageId)) {
      return "completed";
    } else if (stageId === currentStage) {
      return "active";
    } else {
      return "locked";
    }
  };

  const handleStageClick = (stageIndex: number) => {
    const stageState = getStageState(stageIndex + 1);
    if (stageState === "active") {
      onStartStage(stageIndex);
    }
  };

  const handleModalContinue = () => {
    setShowCompletionModal(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Abstract Data Visualization Grid */}
      <AbstractDataGrid />

      <div className="container max-w-6xl py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          {/* Header */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <Compass className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl text-white tracking-tight"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                Keşif Yolculuğun Başlıyor
              </h1>
              
              <p 
                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400
                }}
              >
                Değerlendirme 4 aşamadan oluşuyor. Her aşamada 4 senaryo ile farklı yetkinlik alanlarını keşfedeceksin. Aşamalar arası mola verebilir, kendini hazır hissettiğinde diğer aşamalara geçiş yapabilirsin.
              </p>
            </motion.div>

            {/* Geri Dön Butonu */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center"
            >
              <button
                onClick={onBack}
                className="px-8 py-4 rounded-full font-medium border-2 border-white/30 text-white/80 hover:text-white hover:border-white/50 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anasayfaya Dön
              </button>
            </motion.div>
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {stages.map((stage, index) => {
              const stageState = getStageState(stage.id);
              const Icon = stage.icon;
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                >
                  <div
                    className={`relative backdrop-blur-lg border-2 rounded-3xl p-8 transition-all duration-300 ${
                      stageState === "active" 
                        ? "border-cyan-400 shadow-2xl shadow-cyan-400/20 cursor-pointer transform hover:scale-105" 
                        : stageState === "completed"
                        ? "border-cyan-400 bg-gradient-to-br from-cyan-400/10 to-cyan-500/5"
                        : "border-white/20 opacity-60"
                    }`}
                    style={{
                      background: stageState === "active" 
                        ? 'linear-gradient(135deg, rgba(31, 185, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)'
                        : stageState === "completed"
                        ? 'linear-gradient(135deg, rgba(31, 185, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                      boxShadow: stageState === "active"
                        ? '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 4px 16px rgba(31, 185, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => handleStageClick(index)}
                  >
                    {/* Stage Icon */}
                    <div className="flex items-center gap-6 mb-6">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          stageState === "active" 
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg" 
                            : stageState === "completed"
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                            : "bg-white/20"
                        }`}
                      >
                        {stageState === "completed" ? (
                          <CheckCircle className="w-8 h-8 text-white" />
                        ) : stageState === "locked" ? (
                          <Lock className="w-6 h-6 text-white/60" />
                        ) : (
                          <Icon className="w-8 h-8 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 
                          className={`text-2xl mb-2 ${
                            stageState === "locked" ? "text-white/60" : "text-white"
                          }`}
                          style={{ 
                            fontFamily: "'Poppins', 'Inter', sans-serif",
                            fontWeight: 600
                          }}
                        >
                          {stage.title}
                        </h3>
                        <p className={`${
                          stageState === "locked" ? "text-white/40" : "text-white/80"
                        }`}>
                          {stageState === "completed" ? "Tamamlandı" : 
                           stageState === "active" ? "Başla" : "Kilitli"}
                        </p>
                      </div>
                    </div>

                    {/* Stage Status & Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stageState === "completed" && (
                          <span className="text-cyan-300 font-medium">Tamamlandı</span>
                        )}
                        {stageState === "locked" && (
                          <span className="text-white/60 font-medium">Kilitli</span>
                        )}
                      </div>

                      {stageState === "active" && (
                        <button
                          onClick={() => handleStageClick(index)}
                          className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 flex items-center gap-2"
                          style={{ 
                            fontFamily: "'Poppins', 'Inter', sans-serif",
                          }}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                          
                          <span className="relative flex items-center gap-2">
                            Başla
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Connection Line to Next Stage */}
                    {index < stages.length - 1 && (
                      <div 
                        className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-8 ${
                          stageState === "completed" 
                            ? "bg-gradient-to-b from-cyan-400 to-cyan-500" 
                            : "bg-white/20"
                        }`}
                      />
                    )}

                    {/* Glass reflection efekti */}
                    <div 
                      className="absolute top-4 left-4 rounded-full opacity-30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                        width: '120px',
                        height: '60px',
                        filter: 'blur(20px)'
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Stage Completion Modal */}
      <StageCompletionModal 
        isOpen={showCompletionModal}
        stageNumber={currentStage}
        onContinue={handleModalContinue}
      />
    </div>
  );
}