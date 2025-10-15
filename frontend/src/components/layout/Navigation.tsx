import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { BarChart3, Users, Menu, X, User, LogOut, UserPlus, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from 'react';

import yetriaLogo from '../../assets/9b118325c4af60b812861110c62e687e43bb5a41.png';
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

interface NavigationProps {
  currentPage: string;
  authMode?: 'signin' | 'signup';
  onPageChange: (page: string, options?: { mode?: 'signin' | 'signup' }) => void;
}

// Modern Yetria Logo Component
const YetriaLogo = ({ className }: { className?: string }) => (
  <motion.div 
    className={`flex items-center gap-3 ${className}`}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <img 
        src={yetriaLogo} 
        alt="Yetria - Career Discovery Platform" 
        className="h-16 w-auto object-contain max-h-16"
      />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse" />
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold tracking-wide text-gray-900 leading-none">
        YETRIA
      </span>
    </div>
  </motion.div>
);

export function Navigation({ currentPage, authMode: propAuthMode, onPageChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState(currentPage);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(propAuthMode || 'signin');
  const { t } = useLanguage();
  const { user, isAuthenticated, signOut } = useAuth();

  // Update active page when currentPage prop changes
  React.useEffect(() => {
    // Only update if currentPage is not auth (to avoid overriding our local state)
    if (currentPage !== '/auth') {
      setActivePage(currentPage);
    }
  }, [currentPage]);

  // Update auth mode when prop changes
  React.useEffect(() => {
    if (propAuthMode) {
      setAuthMode(propAuthMode);
    }
  }, [propAuthMode]);

  // Navigation items based on authentication status (removed courses and mentorship)
  const navItems = isAuthenticated ? [
    { 
      id: "about", 
      label: "Hakkımızda", 
      icon: Users, 
      badge: null,
      gradient: "from-gray-500 to-gray-600" 
    },
    { 
      id: "results", 
      label: t("nav.results"), 
      icon: BarChart3, 
      badge: null,
      gradient: "from-purple-500 to-purple-600" 
    },
  ] : [
    { 
      id: "about", 
      label: "Hakkımızda", 
      icon: Users, 
      badge: null,
      gradient: "from-gray-500 to-gray-600" 
    }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="container">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <motion.button
            onClick={() => onPageChange(isAuthenticated ? "landing" : "landing")}
            className="focus-modern transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <YetriaLogo />
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center gap-2 h-12 px-6 font-semibold transition-all duration-200 relative ${
                      isActive 
                        ? `text-white bg-gradient-to-r ${item.gradient} shadow-lg` 
                        : `text-gray-600 hover:text-gray-900 hover:bg-gray-50`
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-float' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              );
            })}
            
            {/* Auth Buttons for Non-Authenticated Users */}
            {!isAuthenticated && (
              <div className="flex items-center gap-3 ml-6 pl-6 border-l border-gray-200">
                <motion.div 
                  whileHover={{ y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange("auth", { mode: "signin" })}
                    className="flex items-center gap-2 h-12 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">Giriş Yap</span>
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => onPageChange("auth", { mode: "signup" })}
                    className="btn-primary h-12 px-6 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span className="font-medium">Üye Ol</span>
                  </Button>
                </motion.div>
              </div>
            )}
            
            {/* User Menu for Authenticated Users */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 ml-6 pl-6 border-l border-gray-200">
                <motion.div 
                  whileHover={{ y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange("profile")}
                    className={`flex items-center gap-2 h-12 px-4 font-semibold transition-all duration-200 ${
                      currentPage === "profile" 
                        ? `text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg` 
                        : `text-gray-600 hover:text-gray-900 hover:bg-gray-50`
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span>{user?.name?.split(' ')[0] || 'Profil'}</span>
                  </Button>
                </motion.div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        whileHover={{ y: -2 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={signOut}
                          className="flex items-center gap-2 h-12 px-4 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Çıkış Yap</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {!isAuthenticated && (
              <motion.button
                onClick={() => {
                  setActivePage("auth");
                  setAuthMode("signup");
                  onPageChange("auth", { mode: "signup" });
                }}
                className="btn-primary h-10 px-4 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Üye Ol
              </motion.button>
            )}
            
            {isAuthenticated && (
              <motion.button
                onClick={() => {
                  setActivePage("profile");
                  onPageChange("profile");
                }}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="w-5 h-5 text-gray-600" />
              </motion.button>
            )}
            
            <motion.button
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100"
          >
            <div className="container py-6">
              <div className="space-y-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActivePage(item.id);
                        onPageChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full modern-card flex items-center gap-4 p-4 rounded-xl transition-all duration-200 focus-modern ${
                        isActive 
                          ? `text-white bg-gradient-to-r ${item.gradient} shadow-lg` 
                          : `text-gray-600 hover:text-gray-900 hover:bg-gray-50`
                      }`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">{item.label}</div>
                        <div className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.id === 'landing' && (isAuthenticated ? t('dashboard') || 'Anasayfa' : t('start.your.journey') || 'Yolculuğuna başla')}
                          {item.id === 'results' && (t('view.insights') || 'Sonuçlarını gör')}
                          {item.id === 'mentorship' && (t('find.guidance') || 'Rehberlik bul')}
                        </div>
                      </div>
                      {item.badge && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-1">
                          {item.badge}
                        </Badge>
                      )}
                    </motion.button>
                  );
                })}
                
                {/* Mobile Auth Buttons for Non-Authenticated Users */}
                {!isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-6"></div>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActivePage("auth");
                        setAuthMode("signin");
                        onPageChange("auth", { mode: "signin" });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full modern-card flex items-center gap-4 p-4 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 focus-modern"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <LogIn className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">Giriş Yap</div>
                        <div className="text-sm text-gray-500">
                          Hesabınıza giriş yapın
                        </div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActivePage("auth");
                        setAuthMode("signup");
                        onPageChange("auth", { mode: "signup" });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full modern-card flex items-center gap-4 p-4 rounded-xl text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg transition-all duration-200 focus-modern"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">Üye Ol</div>
                        <div className="text-sm text-white/80">
                          Hemen ücretsiz kayıt olun
                        </div>
                      </div>
                    </motion.button>
                  </>
                )}
                
                {/* Mobile User Menu for Authenticated Users */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-6"></div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onPageChange("profile");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full modern-card flex items-center gap-4 p-4 rounded-xl transition-all duration-200 focus-modern ${
                        currentPage === "profile" 
                          ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">{user?.name || 'Profil'}</div>
                        <div className={`text-sm ${currentPage === "profile" ? 'text-white/80' : 'text-gray-500'}`}>
                          {t('profile.settings') || 'Profil ayarları'}
                        </div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full modern-card flex items-center gap-4 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 focus-modern"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <LogOut className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">{t('sign.out') || 'Çıkış Yap'}</div>
                        <div className="text-sm text-red-400">
                          {t('sign.out.desc') || 'Hesabınızdan çıkış yapın'}
                        </div>
                      </div>
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}