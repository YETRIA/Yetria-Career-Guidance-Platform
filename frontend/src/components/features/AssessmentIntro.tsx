import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Compass, MessageCircle, BarChart3, Clock, Target, ArrowRight, ArrowLeft, Brain, Heart, Zap, Shield, Calculator, Leaf, Users, Smartphone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface AssessmentIntroProps {
  onStartTest: () => void;
  onBack: () => void;
}

export function AssessmentIntro({ onStartTest, onBack }: AssessmentIntroProps) {
  const { t } = useLanguage();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion.matches);
  }, []);

  // Abstract Data Visualization Grid - Ana sayfayla aynı
  const AbstractDataGrid = () => {
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

  const testFeatures = [
    {
      icon: MessageCircle,
      title: "Gerçekçi Senaryolar",
      description: "Günlük hayattan durumlar üzerinden pratik düşünme becerini analiz edeceğiz.",
      color: "#1FB9FF"
    },
    {
      icon: Target,
      title: "8 Anahtar Yetkinlik",
      description: "Kariyer başarısı için kritik olan 8 temel alandaki gücünü ölçeceğiz.",
      color: "#7C6BFF"
    },
    {
      icon: Clock,
      title: "Kendi Hızında İlerle",
      description: "İstediğin zaman mola ver, sürenin stresi olmadan potansiyeline odaklan.",
      color: "#FF8E4D"
    },
    {
      icon: BarChart3,
      title: "Detaylı Yol Haritası",
      description: "Sadece sonuç değil; güçlü yönlerin, gelişim alanların ve sana özel kariyer önerileri alacaksın.",
      color: "#2AA9FF"
    }
  ];

  const skillAreas = [
    { name: "Analitik Düşünme", icon: Brain },
    { name: "Empati", icon: Heart },
    { name: "Hızlı ve Soğukkanlı Karar Alma", icon: Zap },
    { name: "Duygusal Dayanıklılık", icon: Shield },
    { name: "Sayısal Zeka", icon: Calculator },
    { name: "Stres Yönetimi", icon: Leaf },
    { name: "Takım Çalışması", icon: Users },
    { name: "Teknoloji Adaptasyonu", icon: Smartphone }
  ];

  const processSteps = [
    {
      title: "Yanıtla",
      description: "Karşına çıkacak gerçek hayat senaryolarına en uygun olduğunu düşündüğün tepkileri ver."
    },
    {
      title: "Analiz Edelim",
      description: "Yapay zeka modelimiz, yanıtlarını 8 anahtar yetkinlik üzerinden anında analiz etsin."
    },
    {
      title: "Keşfet",
      description: "Kişisel yetkinlik haritanı, sana en uygun kariyerleri ve gelişim önerilerini anında gör."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Abstract Data Visualization Grid */}
      <AbstractDataGrid />

      <div className="container max-w-6xl py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-20"
        >
          {/* Giriş Bölümü */}
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
                Gerçekçi senaryolarla potansiyelini ortaya çıkar, sana özel hazırlanan yol haritanla kariyerine yön ver.
              </p>
            </motion.div>

            {/* Ana Eylem Butonları */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <button
                onClick={onStartTest}
                className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-full font-bold text-lg tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                
                <span className="relative flex items-center gap-3">
                  Değerlendirmeye Başla
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </span>
              </button>
              
              <button
                onClick={onBack}
                className="px-8 py-4 rounded-full font-medium border-2 border-white/30 text-white/80 hover:text-white hover:border-white/50 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anasayfaya Dön
              </button>
            </motion.div>
          </div>

          {/* Seni Neler Bekliyor? Bölümü */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 
                className="text-4xl md:text-5xl text-white mb-6"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700
                }}
              >
                Seni Neler{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                  Bekliyor?
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {testFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div
                      className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-6 h-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                        boxShadow: `
                          0 8px 32px rgba(31, 185, 255, 0.1), 
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-cyan-300" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl text-white">{feature.title}</h3>
                          <p className="text-white/80 leading-relaxed">{feature.description}</p>
                        </div>
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
                );
              })}
            </div>
          </section>

          {/* 8 Anahtar Yetkinlik Bölümü */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 
                className="text-4xl md:text-5xl text-white mb-6"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700
                }}
              >
                Odaklanacağımız{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                  8 Anahtar Yetkinlik
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {skillAreas.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div
                      className="relative backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                        boxShadow: `
                          0 8px 32px rgba(31, 185, 255, 0.1), 
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `
                      }}
                    >
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-cyan-300" />
                      </div>
                      <p className="text-white/90 text-sm">{skill.name}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Nasıl Çalışır? Bölümü */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 
                className="text-4xl md:text-5xl text-white mb-6"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700
                }}
              >
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                  Nasıl
                </span>
                {" "}Çalışır?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div
                    className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                      boxShadow: `
                        0 8px 32px rgba(31, 185, 255, 0.1), 
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                    }}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl text-white mb-4">{step.title}</h3>
                    <p className="text-white/80 leading-relaxed">{step.description}</p>

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
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}