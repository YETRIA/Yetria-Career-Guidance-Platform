import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';

import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Lock,
  Users,
  Bell,
  Shield,
  Download,
  LogOut,
  Trash2,
  Edit,
  FileText
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const { language } = useLanguage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    about: (user as any)?.about || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      tr: {
        'profile.title': 'Profilim',
        'profile.subtitle': 'Hesap bilgilerinizi ve tercihlerinizi yönetin',
        'profile.edit': 'Düzenle',
        'profile.save': 'Kaydet',
        'profile.cancel': 'İptal',
        'profile.info.title': 'Kişisel Bilgiler',
        'profile.form.name': 'Ad Soyad',
        'profile.form.email': 'E-posta',
        'profile.form.about': 'Hakkımda',
        'profile.joined': 'Katılım Tarihi',
        'profile.password.title': 'Şifre Güvenliği',
        'profile.password.current': 'Mevcut Şifre',
        'profile.password.new': 'Yeni Şifre',
        'profile.password.confirm': 'Yeni Şifre Tekrar',
        'profile.password.update': 'Şifreyi Güncelle',
        'profile.mentorship.title': 'Mentorluk Taleplerim',
        'profile.mentorship.mentor': 'Mentor Adı',
        'profile.mentorship.date': 'Tarih',
        'profile.mentorship.status': 'Durum',
        'profile.mentorship.pending': 'İnceleniyor',
        'profile.mentorship.accepted': 'Kabul Edildi',
        'profile.mentorship.rejected': 'Reddedildi',
        'profile.settings.title': 'Ayarlar',
        'profile.settings.notifications': 'Bildirimler',
        'profile.settings.notifications.desc': 'Kurs önerileri ve mentor güncellemeleri',
        'profile.settings.privacy': 'Gizlilik',
        'profile.settings.privacy.desc': 'Profilinizi diğer kullanıcılara gizli kalsın',
        'profile.actions.title': 'Hesap İşlemleri',
        'profile.actions.export': 'Verilerimi İndir',
        'profile.actions.export.desc': 'Değerlendirme sonuçlarınızı ve verilerinizi indirin',
        'profile.actions.logout': 'Çıkış Yap',
        'profile.actions.logout.desc': 'Hesabınızdan güvenli şekilde çıkış yapın',
        'profile.actions.delete': 'Hesabı Kalıcı Olarak Sil',
        'profıle.actions.delete.desc': 'Bu işlem geri alınamaz',
      },
      en: {
        'profile.title': 'My Profile',
        'profile.subtitle': 'Manage your account information and preferences',
        'profile.edit': 'Edit',
        'profile.save': 'Save',
        'profile.cancel': 'Cancel',
        'profile.info.title': 'Personal Information',
        'profile.form.name': 'Full Name',
        'profile.form.email': 'Email',
        'profile.form.about': 'About Me',
        'profile.joined': 'Joined',
        'profile.password.title': 'Password Security',
        'profile.password.current': 'Current Password',
        'profile.password.new': 'New Password',
        'profile.password.confirm': 'Confirm New Password',
        'profile.password.update': 'Update Password',
        'profile.mentorship.title': 'My Mentorship Requests',
        'profile.mentorship.mentor': 'Mentor Name',
        'profile.mentorship.date': 'Date',
        'profile.mentorship.status': 'Status',
        'profile.mentorship.pending': 'Under Review',
        'profile.mentorship.accepted': 'Accepted',
        'profile.mentorship.rejected': 'Rejected',
        'profile.settings.title': 'Settings',
        'profile.settings.notifications': 'Notifications',
        'profile.settings.notifications.desc': 'Course suggestions and mentor updates',
        'profile.settings.privacy': 'Privacy',
        'profile.settings.privacy.desc': 'Keep your profile private from other users',
        'profile.actions.title': 'Account Actions',
        'profile.actions.export': 'Download My Data',
        'profile.actions.export.desc': 'Download your assessment results and data',
        'profile.actions.logout': 'Sign Out',
        'profile.actions.logout.desc': 'Securely sign out of your account',
        'profile.actions.delete': 'Permanently Delete Account',
        'profile.actions.delete.desc': 'This action cannot be undone',
      }
    };
    return translations[language]?.[key] || key;
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editForm.name,
      email: editForm.email,
      about: editForm.about
    });
    setIsEditingProfile(false);
    toast.success('Profil bilgileri güncellendi!');
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      about: user?.about || ''
    });
    setIsEditingProfile(false);
  };

  const handlePasswordUpdate = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }

    // Simulate password update
    toast.success('Şifre başarıyla güncellendi!');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleDataExport = () => {
    toast.info('Verileriniz hazırlanıyor, e-posta ile gönderilecek.');
  };

  const handleDeleteAccount = () => {
    // Show confirmation dialog
    if (window.confirm('Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir. Devam etmek istediğinizden emin misiniz?')) {
      toast.error('Hesap silme işlemi henüz aktif değil. Destek ile iletişime geçin.');
    }
  };

  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);

  // fetch user's mentorship requests
  useEffect(() => {
    console.log('DEBUG: Fetching mentorship requests...');
    apiService.listMyMentorshipRequests()
      .then((list: any) => {
        console.log('DEBUG: Got mentorship requests:', list);
        setMentorshipRequests(Array.isArray(list) ? list : []);
      })
      .catch((error: any) => {
        console.error('DEBUG: Error fetching mentorship requests:', error);
        setMentorshipRequests([]);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    
    // Check for different status variations
    if (statusLower.includes('kabul') || statusLower.includes('accepted') || statusLower.includes('aktif')) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">{status || t('profile.mentorship.accepted')}</Badge>;
    } else if (statusLower.includes('bekl') || statusLower.includes('pending') || statusLower.includes('onay') || statusLower.includes('gönderildi')) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{status || t('profile.mentorship.pending')}</Badge>;
    } else if (statusLower.includes('red') || statusLower.includes('rejected') || statusLower.includes('iptal')) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">{status || t('profile.mentorship.rejected')}</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{status || 'Bilinmiyor'}</Badge>;
    }
  };

  // Abstract Data Visualization Grid - Same as LandingPage
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
                  animate={{ 
                    pathLength: [0, 1, 0.8],
                    opacity: [0, 0.15, 0.05, 0.15]
                  }}
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
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Abstract Data Visualization Grid */}
      <AbstractDataGrid />

      <div className="container py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-cyan-100 mb-4">
              {t('profile.title')}
            </h1>
            <p className="text-xl text-cyan-200/80">
              {t('profile.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <Card className="p-8 backdrop-blur-lg border border-white/20 rounded-3xl" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                      boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-cyan-100 flex items-center gap-3">
                    <User className="w-6 h-6 text-cyan-300" />
                    {t('profile.info.title')}
                  </h2>
                  {!isEditingProfile ? (
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      variant="outline"
                      className="rounded-xl border-cyan-300/50 hover:bg-cyan-500/20 hover:border-cyan-300"
                      style={{ 
                        color: '#ffffff !important',
                        fontSize: '14px'
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" style={{ color: '#67e8f9' }} />
                      <span style={{ color: '#ffffff !important' }}>
                        {t('profile.edit') || 'Profili Düzenle'}
                      </span>
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700"
                      >
                        {t('profile.save')}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="rounded-xl border-gray-400/50 text-gray-300 hover:bg-gray-500/20 hover:text-gray-200 hover:border-gray-400"
                      >
                        {t('profile.cancel')}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.form.name')}
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-2 rounded-xl border-cyan-300/30 bg-white/10 text-white placeholder:text-gray-400 focus:border-cyan-300 focus:ring-cyan-300"
                      />
                    ) : (
                      <p className="mt-2 text-lg text-cyan-100 font-medium">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.form.email')}
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-2 rounded-xl border-cyan-300/30 bg-white/10 text-white placeholder:text-gray-400 focus:border-cyan-300 focus:ring-cyan-300"
                      />
                    ) : (
                      <p className="mt-2 text-lg text-cyan-100 font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-300" />
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.form.about')}
                    </Label>
                    {isEditingProfile ? (
                      <textarea
                        value={editForm.about}
                        onChange={(e) => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                        placeholder="Kendiniz hakkında birkaç cümle yazın..."
                        className="mt-2 w-full p-3 rounded-xl border border-cyan-300/30 bg-white/10 text-white placeholder:text-gray-400 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 resize-none"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-2">
                        {user.about || editForm.about ? (
                          <p className="text-lg text-cyan-100 font-medium flex items-start gap-2">
                            <FileText className="w-4 h-4 text-cyan-300 mt-1 flex-shrink-0" />
                            <span>{user.about || editForm.about}</span>
                          </p>
                        ) : (
                          <p className="text-lg text-gray-400 italic flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            Henüz hakkınızda bilgi eklenmemiş
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.joined')}
                    </Label>
                    <p className="mt-2 text-lg text-cyan-100 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-300" />
                      {new Date((user as any).createdAt || user.createdat || Date.now()).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Mentorship Requests Card */}
              <Card className="p-8 backdrop-blur-lg border border-white/20 rounded-3xl" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                      boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}>
                <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-cyan-300" />
                  {t('profile.mentorship.title')}
                </h2>

                <div className="space-y-4">
                  {mentorshipRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 text-cyan-300/50" />
                      <p className="text-cyan-200/70 text-lg">Henüz mentorluk talebiniz yok.</p>
                      <p className="text-cyan-200/50 text-sm mt-2">
                        Değerlendirme sonuçlarınızdan size uygun mentorları keşfedebilirsiniz.
                      </p>
                    </div>
                  ) : mentorshipRequests.map((request) => (
                    <div key={request.mentorshiprequestid} className="p-5 rounded-xl border border-cyan-300/30 bg-white/5 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        {/* Mentor Photo/Avatar */}
                        <div className="flex-shrink-0">
                          {request.mentor_photourl ? (
                            <img 
                              src={request.mentor_photourl} 
                              alt={request.mentor_name || 'Mentor'}
                              className="w-16 h-16 rounded-full object-cover border-2 border-cyan-300/30"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Mentor Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-cyan-100 mb-1 truncate">
                            {request.mentor_name || 'Mentor'}
                          </h3>
                          
                          {request.mentor_title && (
                            <p className="text-sm text-cyan-200/80 mb-1">
                              {request.mentor_title}
                              {request.mentor_company && ` • ${request.mentor_company}`}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2 text-sm text-cyan-200/60">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(request.createdat || Date.now()).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {getStatusBadge(request.status_name || 'Beklemede')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Password Security Card */}
              <Card className="p-8 backdrop-blur-lg border border-white/20 rounded-3xl" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                      boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}>
                <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-cyan-300" />
                  {t('profile.password.title')}
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.password.current')}
                    </Label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="mt-2 rounded-xl border-cyan-300/30 bg-white/10 text-white placeholder:text-gray-400 focus:border-cyan-300 focus:ring-cyan-300"
                    />
                  </div>

                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.password.new')}
                    </Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="mt-2 rounded-xl border-cyan-300/30 bg-white/10 text-white placeholder:text-gray-400 focus:border-cyan-300 focus:ring-cyan-300"
                    />
                  </div>

                  <div>
                    <Label className="text-cyan-200 font-semibold">
                      {t('profile.password.confirm')}
                    </Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-2 rounded-xl border-cyan-300/30 bg-white/10 text-white placeholder:text-gray-400 focus:border-cyan-300 focus:ring-cyan-300"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordUpdate}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/25"
                  >
                    {t('profile.password.update')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Settings Card */}
              <Card className="p-6 backdrop-blur-lg border border-white/20 rounded-3xl" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                      boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}>
                <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-300" />
                  {t('profile.settings.title')}
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-cyan-300" />
                        <span className="text-cyan-100">{t('profile.settings.notifications')}</span>
                      </div>
                      <p className="text-sm text-cyan-200/70">{t('profile.settings.notifications.desc')}</p>
                    </div>
                    <Switch 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-cyan-300" />
                        <span className="text-cyan-100">{t('profile.settings.privacy')}</span>
                      </div>
                      <p className="text-sm text-cyan-200/70">{t('profile.settings.privacy.desc')}</p>
                    </div>
                    <Switch 
                      checked={privacyEnabled}
                      onCheckedChange={setPrivacyEnabled}
                    />
                  </div>
                </div>
              </Card>

              {/* Account Actions Card */}
              <Card className="p-6 backdrop-blur-lg border border-white/20 rounded-3xl" 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                      boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}>
                <h3 className="text-xl font-bold text-cyan-100 mb-4">
                  {t('profile.actions.title')}
                </h3>

                <div className="space-y-4">
                  <Button
                    onClick={handleDataExport}
                    variant="outline"
                    className="w-full justify-start rounded-xl border-cyan-300/40 hover:bg-cyan-500/20 hover:border-cyan-300 py-3 px-4"
                    style={{ 
                      color: '#ffffff !important',
                      fontSize: '14px'
                    }}
                  >
                    <Download className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: '#67e8f9' }} />
                    <span 
                      className="font-semibold truncate" 
                      style={{ 
                        color: '#ffffff !important',
                        fontSize: '14px'
                      }}
                    >
                      Verilerimi İndir
                    </span>
                  </Button>

                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full justify-start rounded-xl border-orange-400/40 hover:bg-orange-500/20 hover:border-orange-400 py-3 px-4"
                    style={{ 
                      color: '#ffffff !important',
                      fontSize: '14px'
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: '#fdba74' }} />
                    <span 
                      className="font-semibold truncate" 
                      style={{ 
                        color: '#ffffff !important',
                        fontSize: '14px'
                      }}
                    >
                      Çıkış Yap
                    </span>
                  </Button>

                  <div className="relative">
                    <Button
                      onClick={handleDeleteAccount}
                      variant="outline"
                      className="w-full justify-start rounded-xl border-red-400/40 hover:bg-red-500/20 hover:border-red-400 py-3 px-4"
                      style={{ 
                        color: '#ffffff !important',
                        fontSize: '14px'
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: '#fca5a5' }} />
                      <span 
                        className="font-semibold truncate" 
                        style={{ 
                          color: '#ffffff !important',
                          fontSize: '14px'
                        }}
                      >
                        Hesabımı Sil
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}