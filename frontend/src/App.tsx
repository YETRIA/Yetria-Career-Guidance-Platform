// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "./components/layout/Navigation";
import { LandingPage } from "./pages/LandingPage";
import { AboutPage } from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ScenarioFlowPage } from "./pages/ScenarioFlowPage";
import { ResultsPage } from "./pages/ResultsPage";
import { StageJourneyPage } from "./pages/StageJourneyPage";

import { AssessmentIntro } from "./components/features/AssessmentIntro";
import { ApiTest } from "./components/features/ApiTest";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { motion } from "motion/react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Router içinde kullanılacak component
function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, setAppState] = useState<"brain-entry" | "app">("brain-entry");
  
  // Add stage management
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [currentStage, setCurrentStage] = useState<number>(1);
  
  // Get auth mode from location state
  const authMode = location.state?.mode || 'signin';

  const [reducedMotion, setReducedMotion] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);

  // These hooks are now safely within the provider context
  const { isLoading, isAuthenticated } = useAuth();

  // Load persisted progress after auth is ready and authenticated
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    
    // Add a delay and retry mechanism to ensure token is properly set
    const loadProgress = async () => {
      // Wait for token to be set in all API clients
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const { apiService } = await import('./services/apiService');
        const p = await apiService.getProgress();
        if (Array.isArray(p.completed_stages)) setCompletedStages(p.completed_stages);
        if (p.current_stage) setCurrentStage(p.current_stage);
      } catch (err: any) {
        console.error('Error loading progress:', err);
        
        // If authentication fails, retry once after a delay
        if (err?.detail === 'Not authenticated' || err?.message?.includes('Not authenticated')) {
          console.log('Retrying progress load after authentication error...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            const { apiService } = await import('./services/apiService');
            const p = await apiService.getProgress();
            if (Array.isArray(p.completed_stages)) setCompletedStages(p.completed_stages);
            if (p.current_stage) setCurrentStage(p.current_stage);
          } catch (retryErr) {
            console.error('Retry failed:', retryErr);
            // no-op; user might not have any responses yet
          }
        }
      }
    };
    loadProgress();
  }, [isLoading, isAuthenticated]);

  // Check for reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    prefersReducedMotion.addEventListener("change", handleChange);
    
    return () => prefersReducedMotion.removeEventListener("change", handleChange);
  }, []);

  // Keyboard navigation for brain entry
  useEffect(() => {
    if (appState === "brain-entry") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCompassActivation();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [appState]);

  const handleCompassActivation = () => {
    // Delay app reveal to allow compass activation animation
    setTimeout(() => {
      setAppState("app");
    }, reducedMotion ? 300 : 800);
  };


  // Abstract Data Visualization Grid - Yıldız haritası benzeri
  const AbstractDataGrid = () => {
    // Grid noktaları - yıldız haritası pattern'ı
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

    // Bağlantı çizgileri - sadece yakın ve ilgili noktalar
    const gridConnections = [
      // Constellation 1 internal connections
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      // Constellation 2 internal connections  
      { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 },
      // Constellation 3 internal connections
      { from: 9, to: 10 }, { from: 10, to: 11 }, { from: 11, to: 12 },
      // Constellation 4 internal connections
      { from: 13, to: 14 }, { from: 14, to: 15 }, { from: 15, to: 16 },
      // Sparse inter-constellation connections
      { from: 2, to: 18 }, { from: 7, to: 21 }, { from: 11, to: 27 }, { from: 15, to: 25 },
      // Scattered point connections
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

              {/* Ultra-subtle connection line */}
              <linearGradient id="connectionFaint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(31, 185, 255, 0.1)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="rgba(124, 107, 255, 0.1)" stopOpacity="0.2" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="compassGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Soft glow filter */}
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

            {/* Data points - very subtle */}
            {gridPoints.map((point, index) => (
              <motion.g key={`point-${index}`}>
                {/* Soft outer glow */}
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
                
                {/* Main data point */}
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

            {/* Flowing data streams - very minimal */}
            {!reducedMotion && [1, 2].map((streamSet) => (
              <motion.g key={`streams-${streamSet}`}>
                {gridConnections.slice(0, 3).map((connection, index) => {
                  const fromPoint = gridPoints[connection.from];
                  const toPoint = gridPoints[connection.to];
                  
                  return (
                    <motion.circle
                      key={`stream-${streamSet}-${index}`}
                      r="0.2"
                      fill="rgba(31, 185, 255, 0.4)"
                      opacity="0.6"
                      animate={{
                        cx: [fromPoint.x, toPoint.x],
                        cy: [fromPoint.y, toPoint.y],
                        opacity: [0, 0.6, 0]
                      }}
                      transition={{
                        duration: 6,
                        delay: (streamSet * 3) + (index * 1.5),
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
              </motion.g>
            ))}
          </svg>

          {/* Slow, gentle movement for star map feeling */}
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
              style={{
                transformOrigin: "center center",
              }}
            >
              {/* Additional subtle atmosphere */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  background: `radial-gradient(circle at 30% 30%, 
                    rgba(31, 185, 255, 0.05) 0%,
                    transparent 50%)`,
                  filter: 'blur(20px)'
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  };

  // Fütüristik Glassmorphism Pusula Komponenti
  const FuturisticCompass = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Pusula Container */}
          <motion.div
            className="relative cursor-pointer"
            onClick={handleCompassActivation}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCompassActivation();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Keşfe başlamak için pusulaya tıkla"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ pointerEvents: 'auto' }}
            ref={compassRef}
          >
            {/* Glassmorphism Pusula */}
            <div
              className="relative backdrop-blur-lg border border-cyan-300/30 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                boxShadow: `
                  0 8px 32px rgba(31, 185, 255, 0.15), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(31, 185, 255, 0.1)
                `,
                width: '480px',
                height: '480px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Ana Pusula SVG */}
              <svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="relative z-10"
                fill="none"
              >
                <defs>
                  {/* Cyan gradient for compass ring */}
                  <linearGradient id="compassRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(31, 185, 255, 0.8)" />
                    <stop offset="50%" stopColor="rgba(56, 189, 248, 0.6)" />
                    <stop offset="100%" stopColor="rgba(31, 185, 255, 0.9)" />
                  </linearGradient>

                  {/* Data point gradients */}
                  <radialGradient id="dataGlow" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                    <stop offset="50%" stopColor="rgba(31, 185, 255, 0.8)" />
                    <stop offset="100%" stopColor="rgba(31, 185, 255, 0.4)" />
                  </radialGradient>

                  {/* Needle gradient */}
                  <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(31, 185, 255, 0.9)" />
                    <stop offset="50%" stopColor="rgba(255, 255, 255, 0.9)" />
                    <stop offset="100%" stopColor="rgba(31, 185, 255, 0.7)" />
                  </linearGradient>

                  {/* Glow filter */}
                  <filter id="compassGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Dış çerçeve - ince cyan */}
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  fill="none"
                  stroke="url(#compassRing)"
                  strokeWidth="3"
                  filter="url(#compassGlow)"
                  opacity="0.8"
                />

                {/* İç çerçeve - daha ince */}
                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="rgba(31, 185, 255, 0.4)"
                  strokeWidth="1"
                  opacity="0.6"
                />

                {/* Veri noktaları - N,S,E,W pozisyonlarında */}
                {/* Kuzey */}
                <motion.circle
                  cx="200"
                  cy="60"
                  r="6"
                  fill="url(#dataGlow)"
                  filter="url(#compassGlow)"
                  animate={!reducedMotion ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Güney */}
                <motion.circle
                  cx="200"
                  cy="340"
                  r="5"
                  fill="url(#dataGlow)"
                  filter="url(#compassGlow)"
                  animate={!reducedMotion ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.9, 0.6]
                  } : {}}
                  transition={{
                    duration: 2.5,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Doğu */}
                <motion.circle
                  cx="340"
                  cy="200"
                  r="5.5"
                  fill="url(#dataGlow)"
                  filter="url(#compassGlow)"
                  animate={!reducedMotion ? {
                    scale: [1, 1.4, 1],
                    opacity: [0.8, 1, 0.8]
                  } : {}}
                  transition={{
                    duration: 1.8,
                    delay: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Batı */}
                <motion.circle
                  cx="60"
                  cy="200"
                  r="4.5"
                  fill="url(#dataGlow)"
                  filter="url(#compassGlow)"
                  animate={!reducedMotion ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  } : {}}
                  transition={{
                    duration: 2.2,
                    delay: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Ara veri noktaları - diagonal pozisyonlar */}
                <motion.circle cx="285" cy="115" r="3" fill="url(#dataGlow)" opacity="0.6" 
                  animate={!reducedMotion ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 3, repeat: Infinity }} />
                <motion.circle cx="115" cy="115" r="3.5" fill="url(#dataGlow)" opacity="0.7" 
                  animate={!reducedMotion ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2.8, delay: 0.3, repeat: Infinity }} />
                <motion.circle cx="285" cy="285" r="4" fill="url(#dataGlow)" opacity="0.5" 
                  animate={!reducedMotion ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2.3, delay: 0.7, repeat: Infinity }} />
                <motion.circle cx="115" cy="285" r="3.2" fill="url(#dataGlow)" opacity="0.6" 
                  animate={!reducedMotion ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 2.7, delay: 1, repeat: Infinity }} />

                {/* Merkez nokta */}
                <circle
                  cx="200"
                  cy="200"
                  r="8"
                  fill="rgba(31, 185, 255, 0.3)"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="2"
                />

                {/* Pusula İğnesi - Sürekli dönen */}
                <motion.g
                  style={{ transformOrigin: "200px 200px" }}
                  animate={!reducedMotion ? {
                    rotate: 360
                  } : {}}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {/* İğne gövdesi */}
                  <path
                    d="M200 80 L208 190 L200 200 L192 190 Z"
                    fill="url(#needleGradient)"
                    filter="url(#compassGlow)"
                    opacity="0.9"
                  />
                  
                  {/* İğne ucu */}
                  <circle
                    cx="200"
                    cy="80"
                    r="4"
                    fill="rgba(255, 255, 255, 0.9)"
                    filter="url(#compassGlow)"
                  />
                  
                  {/* İğne kuyruğu */}
                  <path
                    d="M200 320 L192 210 L200 200 L208 210 Z"
                    fill="rgba(31, 185, 255, 0.6)"
                    opacity="0.7"
                  />
                </motion.g>

                {/* Dekoratif çizgiler */}
                <g opacity="0.3">
                  <line x1="200" y1="40" x2="200" y2="55" stroke="rgba(31, 185, 255, 0.6)" strokeWidth="2" />
                  <line x1="200" y1="345" x2="200" y2="360" stroke="rgba(31, 185, 255, 0.6)" strokeWidth="2" />
                  <line x1="40" y1="200" x2="55" y2="200" stroke="rgba(31, 185, 255, 0.6)" strokeWidth="2" />
                  <line x1="345" y1="200" x2="360" y2="200" stroke="rgba(31, 185, 255, 0.6)" strokeWidth="2" />
                </g>
              </svg>

              {/* Glass reflection efekti */}
              <div 
                className="absolute top-8 left-8 rounded-full opacity-20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
                  width: '160px',
                  height: '80px',
                  filter: 'blur(20px)'
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  // Simple Loading Spinner Component (no context dependencies)
  const LoadingSpinner = () => {
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-gray-200"
            style={{
              borderTopColor: '#1FB9FF',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-2 h-2 bg-cyan-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingSpinner />
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Minimalist entry screen
  if (appState === "brain-entry") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
        {/* Abstract Data Visualization Grid */}
        <AbstractDataGrid />

        {/* Fütüristik Glassmorphism Pusula */}
        <FuturisticCompass />

        {/* Ana içerik - Compass'ın üzerinde */}
        <div className="text-center space-y-16 max-w-4xl mx-auto px-8 relative" style={{ zIndex: 10 }}>
          {/* Ana Başlık - Yeni tasarım */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="space-y-8"
          >
            {/* Başlık - Poppins font ile */}
            <h1 
              className="text-6xl md:text-7xl lg:text-8xl leading-tight tracking-tight"
              style={{ 
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                Potansiyelin
              </span>
              <br />
              <span className="text-white">
                Pusulan Olsun.
              </span>
            </h1>
          </motion.div>

          {/* Eylem Çağrısı Butonu */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex justify-center"
          >
            {/* Ana Buton */}
            <button
              onClick={handleCompassActivation}
              className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-16 py-5 rounded-full font-bold text-xl tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
              style={{ 
                fontFamily: "'Poppins', 'Inter', sans-serif",
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
              
              <span className="relative flex items-center gap-4">
                Keşfe Başla
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  →
                </motion.div>
              </span>
            </button>

            {/* Reduced motion için alternatif buton */}
            {reducedMotion && (
              <Button
                onClick={handleCompassActivation}
                variant="outline"
                className="mt-6 border-gray-300 text-gray-300 hover:bg-gray-800"
              >
                Yetria'ya Devam Et
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Main app with router
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Navigation 
        currentPage={location.pathname}
        authMode={authMode}
        onPageChange={(page: string, options?: { mode?: 'signin' | 'signup' }) => {
          if (page === 'auth') {
            navigate('/auth', { state: options });
            return;
          }
          // Navigate to results page - check if user has completed assessment
          if (page === 'results') {
            // Check if user has completed all 4 stages
            if (completedStages.length >= 4) {
              navigate('/results');
            } else {
              navigate('/assessment-intro');
            }
            return;
          }
          navigate(`/${page}`);
        }}
      />
      
      <ScrollToTop />
      <main className="relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <LandingPage 
              onPageChange={(page: string, options?: { mode?: 'signin' | 'signup' }) => {
                if (page === 'auth') {
                  navigate('/auth', { state: options });
                } else {
                  navigate(`/${page}`);
                }
              }}
            />
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/scenarios" element={
            <ProtectedRoute>
              <StageJourneyPage
                onStartStage={() => navigate('/scenario-flow')}
                onBack={() => navigate('/')}
                completedStages={completedStages}
                currentStage={currentStage}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/scenarios" element={
            <ProtectedRoute>
              <StageJourneyPage
                onStartStage={() => navigate('/scenario-flow')}
                onBack={() => navigate('/')}
                completedStages={completedStages}
                currentStage={currentStage}
                onViewResults={() => navigate('/results')}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/scenario-flow" element={
            <ProtectedRoute>
              <ScenarioFlowPage 
                stageNumber={currentStage}
                onStageComplete={(stageNumber, results) => {
                  setCompletedStages(prev => [...prev, stageNumber]);
                  if (stageNumber < 4) {
                    setCurrentStage(stageNumber + 1);
                    // Navigate back to stage selection
                    navigate('/scenarios');
                  } else {
                    // All stages completed, go to results computed from saved responses
                    navigate('/results');
                  }
                }}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/results" element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Legacy Routes */}
          <Route path="/stage-journey" element={
            <ProtectedRoute>
              <StageJourneyPage
                onStartStage={() => navigate('/scenarios')}
                onBack={() => navigate('/')}
                completedStages={completedStages}
                currentStage={currentStage}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/assessment-intro" element={
            <ProtectedRoute>
              <AssessmentIntro 
                onStartTest={() => navigate('/scenarios')}
                onBack={() => navigate('/')}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/api-test" element={<ApiTest />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
          },
        }}
      />
    </motion.div>
  );
}

function AppContent() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}