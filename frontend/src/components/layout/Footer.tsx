import { motion } from 'motion/react';
import { Mail, Linkedin, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onPageChange?: (page: string, options?: { mode?: 'signin' | 'signup' }) => void;
}

export function Footer({ onPageChange }: FooterProps) {
  const { language } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      tr: {
        'footer.slogan': 'Potansiyelini veriyle keşfet.',
        'footer.quick.access': 'Hızlı Erişim',
        'footer.about': 'Hakkımızda',
        'footer.signin': 'Giriş Yap',
        'footer.signup': 'Üye Ol',
        'footer.contact': 'Bize Ulaşın',
        'footer.privacy': 'Gizlilik Politikası',
        'footer.terms': 'Kullanım Koşulları',
        'footer.copyright': '© 2025 YETRIA. Tüm hakları saklıdır.',
      },
      en: {
        'footer.slogan': 'Discover your potential with data.',
        'footer.quick.access': 'Quick Access',
        'footer.about': 'About Us',
        'footer.signin': 'Sign In',
        'footer.signup': 'Sign Up',
        'footer.contact': 'Contact Us',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.copyright': '© 2025 YETRIA. All rights reserved.',
      }
    };
    return translations[language]?.[key] || key;
  };

  const handleLinkClick = (page: string, options?: { mode?: 'signin' | 'signup' }) => {
    if (onPageChange) {
      onPageChange(page, options);
    }
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:yetria01@gmail.com';
  };

  const handleSocialClick = (platform: string) => {
    // Placeholder - gerçek sosyal medya linklerini buraya ekleyebilirsiniz
    console.log(`${platform} sosyal medya linki tıklandı`);
  };

  return (
    <footer className="relative mt-32">
      {/* Ana Footer Container */}
      <div className="relative backdrop-blur-lg border-t border-white/10" 
           style={{
             background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.95) 0%, rgba(30, 41, 91, 0.9) 50%, rgba(88, 28, 135, 0.85) 100%)',
           }}>
        
        <div className="container py-16">
          {/* Ana İçerik - 3 Sütun */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            
            {/* Sol Sütun - Marka Kimliği */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Logo */}
              <div className="space-y-4">
                <h3 
                  className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent"
                  style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
                >
                  YETRIA
                </h3>
                
                {/* Slogan */}
                <p 
                  className="text-lg text-white/90 leading-relaxed max-w-sm"
                  style={{ color: '#ffffff !important' }}
                >
                  {t('footer.slogan')}
                </p>
              </div>
            </motion.div>

            {/* Orta Sütun - Hızlı Erişim */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h4 
                className="text-xl font-semibold text-white mb-6"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  color: '#ffffff !important'
                }}
              >
                {t('footer.quick.access')}
              </h4>
              
              <nav className="space-y-4">
                <button
                  onClick={() => handleLinkClick('about')}
                  className="block text-white/80 hover:text-cyan-300 transition-colors duration-200 text-left"
                  style={{ color: '#ffffff !important' }}
                >
                  {t('footer.about')}
                </button>
                
                <button
                  onClick={() => handleLinkClick('auth', { mode: 'signin' })}
                  className="block text-white/80 hover:text-cyan-300 transition-colors duration-200 text-left"
                  style={{ color: '#ffffff !important' }}
                >
                  {t('footer.signin')}
                </button>
                
                <button
                  onClick={() => handleLinkClick('auth', { mode: 'signup' })}
                  className="block text-white/80 hover:text-cyan-300 transition-colors duration-200 text-left"
                  style={{ color: '#ffffff !important' }}
                >
                  {t('footer.signup')}
                </button>
              </nav>
            </motion.div>

            {/* Sağ Sütun - İletişim ve Yasal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <h4 
                className="text-xl font-semibold text-white mb-6"
                style={{ 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  color: '#ffffff !important'
                }}
              >
                {t('footer.contact')}
              </h4>
              
              <div className="space-y-6">
                {/* Email */}
                <button
                  onClick={handleEmailClick}
                  className="flex items-center gap-3 text-white/80 hover:text-cyan-300 transition-colors duration-200 group"
                  style={{ color: '#ffffff !important' }}
                >
                  <Mail className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <span className="hover:underline">yetria01@gmail.com</span>
                </button>
                
                {/* Yasal Linkler */}
                <div className="space-y-3 pt-4">
                  <button 
                    className="block text-sm text-white/70 hover:text-cyan-300 transition-colors duration-200 text-left"
                    style={{ color: '#ffffff !important', fontSize: '14px' }}
                  >
                    {t('footer.privacy')}
                  </button>
                  
                  <button 
                    className="block text-sm text-white/70 hover:text-cyan-300 transition-colors duration-200 text-left"
                    style={{ color: '#ffffff !important', fontSize: '14px' }}
                  >
                    {t('footer.terms')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Ayırıcı Çizgi */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-12"
          />

          {/* Alt Bilgi Şeridi */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center gap-6"
          >
            {/* Copyright */}
            <p 
              className="text-white/70 text-sm"
              style={{ color: '#ffffff !important', fontSize: '14px' }}
            >
              {t('footer.copyright')}
            </p>

            {/* Sosyal Medya İkonları */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleSocialClick('linkedin')}
                className="text-white/70 hover:text-cyan-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handleSocialClick('instagram')}
                className="text-white/70 hover:text-cyan-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Dekoratif Arka Plan Efekti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-5"
            style={{
              background: 'radial-gradient(circle, rgba(31, 185, 255, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          />
          <div 
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-5"
            style={{
              background: 'radial-gradient(circle, rgba(124, 107, 255, 0.3) 0%, transparent 70%)',
              filter: 'blur(30px)'
            }}
          />
        </div>
      </div>
    </footer>
  );
}