import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, MessageCircle, BarChart3, MapPin, Brain, Rocket, Users, Target } from "lucide-react";
import { Footer } from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/apiService";

interface LandingPageProps {
  onGetStarted?: () => void;
  onPageChange?: (page: string, options?: { mode?: 'signin' | 'signup' }) => void;
}

// Abstract Data Visualization Grid - Giriş ekranındakiyle aynı
const AbstractDataGrid = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion.matches);
  }, []);

  // Grid noktaları - giriş ekranındakiyle aynı
  const gridPoints = [
    // Ana yıldız kümeleri
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

  // Bağlantı çizgileri
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
            {/* Very subtle gradients */}
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

          {/* Ultra-subtle connection lines */}
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

          {/* Data points */}
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

        {/* Slow movement */}
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

export function LandingPage({ onGetStarted, onPageChange }: LandingPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = async () => {
    if (onGetStarted) {
      onGetStarted();
      return;
    }
    if (isAuthenticated) {
      try {
        const progress = await apiService.getProgress();
        if (progress.completed_stages.length >= 4) {
          navigate('/results');
        } else {
          navigate('/assessment-intro');
        }
      } catch {
        navigate('/assessment-intro');
      }
    } else {
      navigate('/auth', { state: { mode: 'signin' } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Abstract Data Visualization Grid - Giriş ekranındakiyle aynı */}
      <AbstractDataGrid />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-12 max-w-4xl mx-auto"
          >
            {/* Ana Başlık - İstediğin yeni metinler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-6"
            >
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                <span className="text-white">
                  Kariyerini
                </span>
                {' '}
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                  Senaryolarla
                </span>
                <br />
                <span className="text-white">
                  Keşfet.
                </span>
              </h1>

              {/* Alt Başlık */}
              <p 
                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400
                }}
              >
                Gerçekçi senaryolarla yetkinliklerini ölç, veriye dayalı önerilerle en doğru kariyer yolunu keşfet.
              </p>
            </motion.div>

            {/* Ana Buton - Giriş ekranındakiyle aynı tasarım */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex justify-center"
            >
              <button
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-16 py-5 rounded-full text-xl tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                
                <span className="relative flex items-center gap-4">
                  Hemen Başla
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bölüm 1: Süreç - "3 Adımda Keşfet" */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900 via-blue-900 to-slate-800">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-6"
          >
            <h2 
              className="text-5xl md:text-6xl text-white tracking-tight"
              style={{ 
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              3 Adımda Potansiyelini Keşfet
            </h2>
            <p 
              className="text-xl text-white/80 max-w-2xl mx-auto"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400
              }}
            >
              Sürecimiz basit, sonuçlarımız güçlü.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Kart 1: Gerçek Senaryolar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group"
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">1. Gerçek Senaryolar</h3>
                  <p className="text-white/70 leading-relaxed">
                    Teorik sorular yerine, gerçek hayattaki durumlara verdiğin tepkileri analiz ederiz.
                  </p>
                </div>
                
                {/* Glass reflection efekti */}
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '100px',
                    height: '50px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>

            {/* Kart 2: Yetkinlik Analizi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">2. Yetkinlik Analizi</h3>
                  <p className="text-white/70 leading-relaxed">
                    Cevapların, yapay zeka destekli algoritmalarımızla 8 temel yetkinlik üzerinden değerlendirilir.
                  </p>
                </div>
                
                {/* Glass reflection efekti */}
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '100px',
                    height: '50px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>

            {/* Kart 3: Veriye Dayalı Rota */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group"
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">3. Veriye Dayalı Rota</h3>
                  <p className="text-white/70 leading-relaxed">
                    Sana en uygun kariyer yollarını ve bu yollarda sana rehber olacak mentorları belirleriz.
                  </p>
                </div>
                
                {/* Glass reflection efekti */}
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '100px',
                    height: '50px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bölüm 2: Sonuç - "Benim İçin Ne Var?" */}
      <section className="relative py-20 bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-6"
          >
            <h2 
              className="text-5xl md:text-6xl text-white tracking-tight"
              style={{ 
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              Sadece Bir Rapor Değil, Yol Haritan
            </h2>
            <p 
              className="text-xl text-white/80 max-w-3xl mx-auto"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400
              }}
            >
              Yetkinliklerini anla, uyum skorlarını gör, gelişim alanların için özel öneriler al.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Sol Sütun: UI Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-3xl p-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.15), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                {/* Mockup Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1 text-center">
                    <div className="text-white/60 text-sm">Yetria Dashboard</div>
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl text-white mb-2">Yazılım Mühendisliği | Uyum: %92</h3>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="w-[92%] bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg text-white mb-4">Güçlü Yanların</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Analitik Düşünme</span>
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div className="w-[95%] bg-blue-400 h-2 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Sayısal Zeka</span>
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div className="w-[88%] bg-blue-400 h-2 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg text-white mb-4">Gelişim Alanların</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Takım Çalışması</span>
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div className="w-[65%] bg-orange-400 h-2 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-white/90 text-sm">
                      💡 <strong>Önerilen Kurs:</strong> Python ile Veri Bilimi
                    </p>
                  </div>
                </div>

                {/* Glass reflection efekti */}
                <div 
                  className="absolute top-8 left-8 rounded-full opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '120px',
                    height: '60px',
                    filter: 'blur(20px)'
                  }}
                />
              </div>
            </motion.div>

            {/* Sağ Sütun: Özellik Listesi */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-white mb-2">Kişisel Yetkinlik Profili</h3>
                  <p className="text-white/70 leading-relaxed">
                    8 temel yetkinlikteki seviyeni net olarak gör.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-white mb-2">Mesleki Uyum Skoru</h3>
                  <p className="text-white/70 leading-relaxed">
                    Yüzlerce meslek arasından sana en uygun olanları veriyle keşfet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-white mb-2">Kişiselleştirilmiş Gelişim</h3>
                  <p className="text-white/70 leading-relaxed">
                    Geliştirmen gereken alanlar için sana özel kurs ve kaynak önerileri al.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bölüm 3: Güven ve Destek - "Neden YETRIA?" */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900 via-slate-800 to-blue-900">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-6"
          >
            <h2 
              className="text-5xl md:text-6xl text-white tracking-tight"
              style={{ 
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              Veri ve Deneyim Bir Arada
            </h2>
            <p 
              className="text-xl text-white/80 max-w-3xl mx-auto"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400
              }}
            >
              Başarın için teknolojiyi ve insan uzmanlığını birleştirdik.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Kart 1: Bilimsel Metodoloji */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">Bilimsel Metodoloji</h3>
                  <p className="text-white/70 leading-relaxed">
                    Psikoloji ve veri bilimi temelinde geliştirilmiş, geçerliliği kanıtlanmış bir sistem.
                  </p>
                </div>
                
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '80px',
                    height: '40px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>

            {/* Kart 2: Yapay Zeka Destekli Analiz */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">Yapay Zeka Destekli Analiz</h3>
                  <p className="text-white/70 leading-relaxed">
                    Gelişmiş algoritmalarımız, senin için en doğru eşleşmeleri saniyeler içinde yapar.
                  </p>
                </div>
                
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '80px',
                    height: '40px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>

            {/* Kart 3: Alanında Uzman Mentorlar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">Alanında Uzman Mentorlar</h3>
                  <p className="text-white/70 leading-relaxed">
                    Sadece bir meslek değil, o meslekteki deneyimli profesyonellerden rehberlik alma imkanı sunarız.
                  </p>
                </div>
                
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '80px',
                    height: '40px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>

            {/* Kart 4: Gerçek Dünya Senaryoları */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white">Gerçek Dünya Senaryoları</h3>
                  <p className="text-white/70 leading-relaxed">
                    Ezber cevaplara değil, gerçek durumlara verdiğin pratik çözümlere odaklanırız.
                  </p>
                </div>
                
                <div 
                  className="absolute top-4 left-4 rounded-full opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                    width: '80px',
                    height: '40px',
                    filter: 'blur(15px)'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onPageChange={onPageChange} />
    </div>
  );
}