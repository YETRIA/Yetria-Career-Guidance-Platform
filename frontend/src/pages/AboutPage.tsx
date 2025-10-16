import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { Target, Telescope, Brain, Fingerprint, Users, Sprout } from "lucide-react";
import { Footer } from "../components/layout/Footer";

interface AboutPageProps {
  onPageChange?: (page: string, options?: { mode?: 'signin' | 'signup' }) => void;
}

export function AboutPage({ onPageChange }: AboutPageProps = {}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion.matches);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Abstract Data Visualization Grid */}
      <AbstractDataGrid />

      <div className="container relative z-10 py-20">
        {/* Ana Başlık ve Hikaye Bölümü */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 mb-20"
        >
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl text-white tracking-tight"
            style={{ 
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Ezberleri{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
              Bozmak
            </span>
            {" "}İçin Buradayız
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400
            }}
          >
            YETRIA, gençlerin kariyer yolculuğundaki belirsizliği ortadan kaldırma tutkusuyla doğdu. 
            Klasik testlerin ve varsayımların ötesine geçerek, her bireyin eşsiz yetkinliklerini veri ve 
            bilimle aydınlatan, onlara en doğru kariyer rotasını çizen teknoloji destekli bir platformuz.
          </p>
        </motion.div>

        {/* Misyon ve Vizyon Bölümü */}
        <section className="mb-20">
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
              Pusulamız ve Ufkumuz
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Misyon Kartı */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
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
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl text-white">Misyonumuz</h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    Her gencin kendi potansiyelini somut verilerle keşfetmesini sağlamak ve onlara 
                    yetenekleriyle parlayacakları doğru kariyer yolunda rehberlik etmek.
                  </p>
                </div>
                
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

            {/* Vizyon Kartı */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
                    <Telescope className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl text-white">Vizyonumuz</h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    Kariyer kararlarındaki belirsizliği ortadan kaldırarak, herkesin mutlu ve üretken 
                    olduğu bir iş gücü ekosisteminin oluşmasına öncülük etmek.
                  </p>
                </div>
                
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
        </section>

        {/* İlkeler Bölümü */}
        <section className="mb-20">
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
              Yolumuzu Aydınlatan İlkeler
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* İlke 1: Bilimsel Yaklaşım */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-xl p-6 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Bilimsel Yaklaşım</h3>
                </div>
              </div>
            </motion.div>

            {/* İlke 2: Kişiselleştirme */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-xl p-6 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Kişiselleştirme</h3>
                </div>
              </div>
            </motion.div>

            {/* İlke 3: Erişilebilirlik */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-xl p-6 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Erişilebilirlik</h3>
                </div>
              </div>
            </motion.div>

            {/* İlke 4: Sürekli Gelişim */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div
                className="relative backdrop-blur-lg border border-white/20 rounded-xl p-6 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  boxShadow: `
                    0 8px 32px rgba(31, 185, 255, 0.1), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Sürekli Gelişim</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Kurucular Bölümü */}
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
              Hikayenin Arkasındaki Ekip
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Kurucu 1: Tuba Sarıkaya */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
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
                  {/* Placeholder fotoğraf */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl text-white">Tuba Sarıkaya</h3>
                    <p className="text-cyan-300">Kurucu Ortak</p>
                  </div>
                  
                  <p className="text-white/70 text-sm">
                    Bilgisayar Mühendisliği Öğrencisi
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

            {/* Kurucu 2: Gül Erten */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
                  {/* Placeholder fotoğraf */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl text-white">Gül Erten</h3>
                    <p className="text-purple-300">Kurucu Ortak</p>
                  </div>
                  
                  <p className="text-white/70 text-sm">
                    Bilgisayar Mühendisliği Öğrencisi
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
        </section>
      </div>

      {/* Footer */}
      <Footer onPageChange={onPageChange} />
    </div>
  );
}
