import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, Compass } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return URL from location state; default to home
  // useMemo prevents unnecessary re-renders
  const from = useMemo(() => location.state?.from?.pathname || '/', [location.state?.from?.pathname]);
  const [mode, setMode] = useState<'signin' | 'signup'>(location.state?.mode || 'signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { signUp, signIn, isAuthenticated, authStatus, authError, clearAuthError } = useAuth();
  const { language } = useLanguage();

  // Check for reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion.matches);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔵 isAuthenticated changed to TRUE - navigating...');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Mode initial value already set from location.state, no need for useEffect
  // This was causing infinite re-renders and clearing generalError!
  // But we DO need to react to changes when navigating to the same /auth route with a different mode
  useEffect(() => {
    const nextMode = location.state?.mode as 'signin' | 'signup' | undefined;
    if (nextMode && nextMode !== mode) {
      setMode(nextMode);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
      clearAuthError();
    }
  }, [location.state?.mode]);


  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      tr: {
        'auth.signin.title': 'Giriş Yap',
        'auth.signin.subtitle': 'Kariyer keşif yolculuğuna devam et',
        'auth.signup.title': 'Hesap Oluştur',
        'auth.signup.subtitle': 'Kariyer keşif yolculuğuna başla',
        'auth.form.name': 'Ad Soyad',
        'auth.form.name.placeholder': 'Adınız ve soyadınız',
        'auth.form.email': 'E-posta',
        'auth.form.email.placeholder': 'ornek@email.com',
        'auth.form.password': 'Şifre',
        'auth.form.password.placeholder': 'En az 6 karakter',
        'auth.form.confirm.password': 'Şifre Tekrarı',
        'auth.form.confirm.password.placeholder': 'Şifrenizi tekrar girin',
        'auth.signin.button': 'Giriş Yap',
        'auth.signup.button': 'Hesap Oluştur',
        'auth.switch.signup': 'Hesabın yok mu?',
        'auth.switch.signup.link': 'Hesap oluştur',
        'auth.switch.signin': 'Zaten hesabın var mı?',
        'auth.switch.signin.link': 'Giriş yap',
        'auth.error.name.required': 'Ad soyad gerekli',
        'auth.error.email.required': 'E-posta gerekli',
        'auth.error.email.invalid': 'Geçersiz e-posta adresi',
        'auth.error.password.required': 'Şifre gerekli',
        'auth.error.password.min': 'Şifre en az 6 karakter olmalı',
        'auth.error.password.match': 'Şifreler eşleşmiyor',
        'auth.back': 'Geri'
      },
      en: {
        'auth.signin.title': 'Sign In',
        'auth.signin.subtitle': 'Continue your career discovery journey',
        'auth.signup.title': 'Create Account',
        'auth.signup.subtitle': 'Start your career discovery journey',
        'auth.form.name': 'Full Name',
        'auth.form.name.placeholder': 'Your full name',
        'auth.form.email': 'Email',
        'auth.form.email.placeholder': 'example@email.com',
        'auth.form.password': 'Password',
        'auth.form.password.placeholder': 'At least 6 characters',
        'auth.form.confirm.password': 'Confirm Password',
        'auth.form.confirm.password.placeholder': 'Re-enter your password',
        'auth.signin.button': 'Sign In',
        'auth.signup.button': 'Create Account',
        'auth.switch.signup': "Don't have an account?",
        'auth.switch.signup.link': 'Sign up',
        'auth.switch.signin': 'Already have an account?',
        'auth.switch.signin.link': 'Sign in',
        'auth.error.name.required': 'Full name is required',
        'auth.error.email.required': 'Email is required',
        'auth.error.email.invalid': 'Invalid email address',
        'auth.error.password.required': 'Password is required',
        'auth.error.password.min': 'Password must be at least 6 characters',
        'auth.error.password.match': 'Passwords do not match',
        'auth.back': 'Back'
      }
    };
    return translations[language]?.[key] || key;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = t('auth.error.name.required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.error.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.error.email.invalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.error.password.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.error.password.min');
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.error.password.match');
    }

    setErrors(newErrors);
    // Don't clear general error on validation - let auth errors show
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    clearAuthError();

    try {
      if (mode === 'signup') {
        await signUp(
          formData.name,
          formData.email,
          formData.password,
          undefined, // age
          1, // usertypeid
          undefined // educationlevelid
        );
      } else {
        await signIn(formData.email, formData.password);
      }

      // If we reach here, auth was successful
      // Navigation will happen automatically via isAuthenticated useEffect
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('🔴 Auth error caught:', error);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Don't clear general error when user starts typing - let them see the error
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    clearAuthError();
  };

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

  // Debug render
  console.log('🟣 RENDER - isSubmitting:', isSubmitting);
  console.log('🟣 RENDER - isAuthenticated:', isAuthenticated);
  console.log('🟣 RENDER - authStatus:', authStatus);
  console.log('🟣 RENDER - authError:', authError);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      
      {/* Abstract Data Visualization Grid */}
      <AbstractDataGrid />
      
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">{t('auth.back')}</span>
      </motion.button>

      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            {/* YETRIA Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <Compass className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h1 
              className="text-4xl md:text-5xl text-white mb-4 tracking-tight"
              style={{ 
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              {mode === 'signin' ? t('auth.signin.title') : t('auth.signup.title')}
            </h1>
            <p 
              className="text-white/80 text-lg"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400
              }}
            >
              {mode === 'signin' ? t('auth.signin.subtitle') : t('auth.signup.subtitle')}
            </p>
          </motion.div>

          {/* Error Message - Outside form for better visibility */}
          <AnimatePresence mode="wait">
            {authError && authError.trim() !== '' && (
              <motion.div
                key="error-message"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div 
                  className="bg-red-600/95 backdrop-blur-sm border-2 border-red-400 rounded-xl p-4 text-white text-base font-bold shadow-2xl"
                  style={{ 
                    boxShadow: '0 10px 40px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-300 text-2xl">⚠️</span>
                    <span className="flex-1">{authError}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Glassmorphism Form Card */}
            <div
              className="relative backdrop-blur-lg border border-white/20 rounded-2xl p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                boxShadow: `
                  0 8px 32px rgba(31, 185, 255, 0.15), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name field (only for signup) */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/90">
                      {t('auth.form.name')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={t('auth.form.name.placeholder')}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`pl-12 py-3 rounded-xl border-2 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 ${
                          errors.name ? 'border-red-400' : 'border-white/20'
                        } focus:border-cyan-400 transition-colors`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-300 text-sm">{errors.name}</p>
                    )}
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">
                    {t('auth.form.email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.form.email.placeholder')}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-12 py-3 rounded-xl border-2 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 ${
                        errors.email ? 'border-red-400' : 'border-white/20'
                      } focus:border-cyan-400 transition-colors`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">
                    {t('auth.form.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.form.password.placeholder')}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-12 pr-12 py-3 rounded-xl border-2 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 ${
                        errors.password ? 'border-red-400' : 'border-white/20'
                      } focus:border-cyan-400 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password field (only for signup) */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/90">
                      {t('auth.form.confirm.password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('auth.form.confirm.password.placeholder')}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-12 pr-12 py-3 rounded-xl border-2 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 ${
                          errors.confirmPassword ? 'border-red-400' : 'border-white/20'
                        } focus:border-cyan-400 transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Submit button - Ana sayfadaki "Hemen Başla" butonu stili */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-lg tracking-wide transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ 
                    fontFamily: "'Poppins', 'Inter', sans-serif",
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                  
                  <span className="relative flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {mode === 'signin' ? t('auth.signin.button') : t('auth.signup.button')}
                      </>
                    ) : (
                      <>
                        {mode === 'signin' ? t('auth.signin.button') : t('auth.signup.button')}
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </>
                    )}
                  </span>
                </button>

                {/* Switch mode */}
                <div className="text-center pt-4">
                  <p className="text-white/80">
                    {mode === 'signin' ? t('auth.switch.signup') : t('auth.switch.signin')}{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                      onFocus={clearAuthError}
                      onMouseDown={clearAuthError}
                    >
                      {mode === 'signin' ? t('auth.switch.signup.link') : t('auth.switch.signin.link')}
                    </button>
                  </p>
                </div>
              </form>

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
        </div>
      </div>
    </div>
  );
}