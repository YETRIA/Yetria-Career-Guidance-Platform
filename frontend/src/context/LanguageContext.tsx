import React, { createContext, useContext } from 'react';

interface LanguageContextType {
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Türkçe çeviri metinleri
const translations = {
  // Navigation
  'nav.home': 'Anasayfa',
  'nav.assessment': 'Değerlendirme',
  'nav.results': 'Sonuçlar',
  'nav.mentors': 'Mentorlar',
  'nav.learning': 'Kurslar',
  'nav.progress': 'İlerleme',
  'nav.level': 'Seviye',
  'nav.discovery.journey': 'Keşif Yolculuğun',

  // Landing Page
  'landing.title': 'Kariyer Yolunu',
  'landing.title.discover': 'Keşfet',
  'landing.subtitle': 'Eğlenceli, interaktif senaryolar aracılığıyla benzersiz güçlerini ortaya çıkar. Mentorlarla bağlantı kur ve sana mükemmel kariyer yolunu bul.',
  'landing.start.discovery': 'Keşfe Başla',
  'landing.see.how.works': 'Nasıl Çalışır?',
  'landing.free.assessment': 'Bilim destekli değerlendirme',
  'landing.career.experts': 'Kariyer uzmanları tarafından geliştirildi',
  'landing.personalized.insights': 'Kişiselleştirilmiş içgörüler',
  'landing.free.start': 'Başlamak ücretsiz',

  // Story Panels
  'story.scenarios.title': 'Gerçek Dünya Senaryoları',
  'story.scenarios.subtitle': 'Sıkıcı sorular değil',
  'story.scenarios.description': 'Doğal tepkilerini ve karar verme tarzını ortaya çıkaran ilgi çekici iş yeri durumlarını yanıtla.',
  'story.strengths.title': 'Süper Güçlerini Keşfet',
  'story.strengths.subtitle': '8 temel güç haritalandı',
  'story.strengths.description': 'Benzersiz beceri kombinasyonunu gör ve bunların modern iş yerinde nasıl kariyer başarısına dönüştüğünü öğren.',
  'story.mentors.title': 'Sektör Uzmanlarıyla Bağlantı Kur',
  'story.mentors.subtitle': '1000+ mentor rehberlik için hazır',
  'story.mentors.description': 'Güçlerini anlayan ve kariyer gelişimini hızlandırabilecek profesyonellerle eşleştirilme.',

  // Skills Section
  'skills.discover.title': 'Keşfet',
  'skills.core.strengths': '8 Temel Gücün',
  'skills.description': 'Günümüz iş yerinde en önemli olan sekiz temel alanda nasıl düşündüğünü, hissettiğini ve problem çözdüğünü analiz ediyoruz.',

  // Stats Section
  'stats.title': 'Kariyer Keşif Hareketine Katıl',
  'stats.subtitle': 'Binlerce genç profesyonel zaten yolunu buldu. Senin yolculuğun burada başlıyor.',
  'stats.career.paths': 'Kariyer Yolu Keşfedildi',
  'stats.find.direction': 'Yönünü Buluyor',
  'stats.expert.mentors': 'Uzman Mentor',
  'stats.user.rating': 'Kullanıcı Puanı',

  // CTA Section
  'cta.title': 'Yolunu Keşfetmeye Hazır mısın?',
  'cta.subtitle': 'Netlik, güven ve heyecan verici kariyer fırsatları bulan binlerce genç profesyonele katıl.',
  'cta.start.journey': 'Yolculuğuna Başla',
  'cta.learn.more': 'Daha Fazla Öğren',
  'cta.free.assessment': '✨ Ücretsiz değerlendirme',
  'cta.instant.results': '🚀 Anında sonuçlar',
  'cta.expert.mentors': '🤝 Uzman mentorlar',

  // Brain Entry
  'brain.entry.hint': 'Girmek için beyne tıkla',
  'brain.continue': 'Yetria\'ya Devam Et',

  // 8 Core Skills
  'skill.numerical.intelligence': 'Sayısal Zeka',
  'skill.analytical.thinking': 'Analitik Düşünme',
  'skill.stress.management': 'Stres Yönetimi',
  'skill.empathy': 'Empati',
  'skill.teamwork': 'Takım Çalışması',
  'skill.decision.making.quick': 'Hızlı ve Soğukkanlı Karar Alma',
  'skill.resilience': 'Duygusal Dayanıklılık',
  'skill.technology.adaptation': 'Teknoloji Adaptasyonu',

  // Skill Descriptions
  'skill.numerical.description': 'Matematiksel işlemler ve sayısal veri analizi yeteneğin.',
  'skill.analytical.description': 'Karmaşık problemleri parçalara ayırma ve sistematik düşünme yeteneğin.',
  'skill.stress.management.description': 'Stresli durumlarla başa çıkma ve sakin kalma yeteneğin.',
  'skill.empathy.description': 'Başkalarının duygularını anlama ve hissetme yeteneğin.',
  'skill.teamwork.description': 'Grup içinde etkili çalışma ve işbirliği becerin.',
  'skill.decision.making.description': 'Baskı altında hızlı ve doğru kararlar verme yeteneğin.',
  'skill.resilience.description': 'Zorluklardan hızla toparlanma ve uyum sağlama yeteneğin.',
  'skill.technology.description': 'Yeni teknolojileri öğrenme ve uygulamaya koyma yeteneğin.',

  // Skill Status
  'skill.strong': 'Güçlü',
  'skill.development': 'Geliştirme',

  // Results Page
  'results.page.title': 'Değerlendirme Sonuçların',
  'results.page.description': 'Yanıtlarına dayanarak, benzersiz güçlerini belirledi ve en çok başarılı olacağın kariyerlere eşleştirdik.',
  'results.profession.comparison.title': 'Yazılım Mühendisliği meslek grubundaki bireylerin ortalama yetkinlik puanları:',
  'results.profession.comparison.description': 'Senin skorların ile yazılım mühendisleri arasındaki profesyonellerin ortalama puanları aşağıda karşılaştırılıyor.',
  'results.your.score': 'Sen',
  'results.group.average': 'Grup Ort.',
  'results.explanation.title': 'Detaylı Analiz',
  'results.analysis.description': 'Yazılım mühendisleri ile karşılaştırmalı yetkinlik analizin ve gelişim önerilerimiz.',
  'results.strong.skills.title': 'Güçlü Yönlerin',
  'results.improvement.areas.title': 'Gelişim Alanların',
  'results.your.label': 'Sen',
  'results.group.label': 'Yazılım Müh.',
  'results.personalized.courses.title': 'Gelişim Alanlarına Özel Kurs Önerileri',
  'results.personalized.courses.description': 'Grup ortalamasının altında kalan becerilerini geliştirmek için özel olarak seçilen kurslar.',
  'results.view.course': 'Kursu İncele',
  'results.career.suggestions.title': 'Güçlerinle Uyumlu Kariyerler',
  'results.career.suggestions.description': 'Yetkinlik profiline dayanarak, bu kariyerler doğal yeteneklerin ve tercihlerinle en iyi eşleşmeyi sunuyor.',
  'results.match': 'uyum',
  'results.learn.more': 'Daha Fazla Öğren',
  'results.next.steps.title': 'Gelişim Yolculuğuna Hazır mısın?',
  'results.next.steps.description': 'Gelişim alanlarında seni destekleyecek mentorlarla tanış ve kişiselleştirilmiş öğrenme deneyimini keşfet.',
  'results.find.mentor': 'Mentor Bul',
  'results.explore.learning': 'Kursları Keşfet',

  // Career Suggestions
  'career.software.engineering': 'Yazılım Mühendisliği',
  'career.software.engineering.description': 'Analitik düşünce ve teknoloji adaptasyonu ile yazılım geliştirmeyi yönlendir.',
  'career.data.science': 'Veri Bilimi',
  'career.data.science.description': 'Sayısal zeka ve analitik düşünce ile büyük verileri anlamlı içgörülere dönüştür.',
  'career.product.management': 'Ürün Yöneticiliği',
  'career.product.management.description': 'Takım çalışması ve empati ile kullanıcı odaklı ürünler geliştir.',

  // Toast Messages
  'assessment.started.title': 'Değerlendirme başladı! Güçlerini keşfedelim.',
  'assessment.completed.title': 'Değerlendirme tamamlandı! İşte kişiselleştirilmiş sonuçların.',
  'career.explore.title': 'Kariyer alanı hakkında detaylı bilgi açılıyor...',
  'career.explore.description': 'Bu normalde detaylı kariyer sayfasına yönlendirecekti.',
  'mentor.find.title': 'Sana mükemmel mentoru bulalım!',
  'mentor.connect.title': 'Bağlantı isteği gönderildi!',
  'mentor.connect.description': 'Mentor bilgilendirilecek ve yakında sana ulaşacak.',
  'courses.view.title': 'İşte gelişim alanlarına uygun kurslar!',
  'course.enroll.title': 'Kurs kaydı başlatıldı!',
  'course.enroll.description': 'Sonraki adımlar ve kurs erişimi için e-posta alacaksın.',

  // Common
  'step': 'Adım',
  'start.your.journey': 'Yolculuğuna başla',
  'discover.strengths': 'Güçlerini keşfet',
  'view.insights': 'İçgörüleri gör',
  'find.guidance': 'Rehberlik bul',
  'learn.grow': 'Öğren ve büyü',

  // Courses Page
  'courses.page.title': 'Kurslar',
  'courses.page.description': 'Değerlendirme sonuçlarına dayanarak, güçlerini geliştirmene ve büyüme alanlarını ele almana yardımcı olacak kursları seçtik.',
  'courses.personalized': 'Kişiye Özel',
  'courses.leadership': 'Liderlik',
  'courses.communication': 'İletişim',
  'courses.analytical': 'Analitik Beceriler',
  'courses.technical': 'Teknik Beceriler',
  'courses.career': 'Kariyer Geliştirme',
  'courses.personalized.recommendations': 'Kişiselleştirilmiş öneriler',
  'courses.industry.certificates': 'Sektör onaylı sertifikalar',
  'courses.expert.instructors': 'Uzman eğitmenler',
  'courses.personalized.for.you': 'Senin İçin Özel Kurslar',
  'courses.all.courses': 'Tüm Kurslar',
  'courses.personalized.description': 'Bu kurslar özellikle güçlerini tamamlamak ve değerlendirmende belirlenen alanlarda büyümene yardımcı olmak için seçildi.',
  'courses.all.description': 'Mevcut tüm kurs seçeneklerini görüntüle ve kendin için en uygun olanları seç.',
  'courses.show.more': 'Daha Fazla Kurs Göster',
  'courses.show.more.description': 'Tüm mevcut kursları keşfet',
  'courses.show.less': 'Daha Az Göster',
  'courses.show.less.description': 'Sadece senin için önerilen kursları göster',

  // Learning Path Section
  'courses.learning.path.title': 'Öğrenme Yolunu Oluştur',
  'courses.learning.path.description': 'Kariyer hedeflerin ile uyumlu birden fazla kursu birleştirerek yapılandırılmış bir öğrenme yolculuğu oluştur.',
  'courses.learn.pace.title': 'Kendi Hızında Öğren',
  'courses.learn.pace.description': 'Kurs materyallerine istediğin zaman, istediğin yerden eriş. Programına ve mesleki yükümlülüklerine göre öğren.',
  'courses.earn.certificates.title': 'Sertifika Kazan',
  'courses.earn.certificates.description': 'LinkedIn profiline ve özgeçmişine ekleyebileceğin sektör onaylı sertifikalar kazanmak için kursları tamamla.',
  'courses.join.communities.title': 'Topluluklara Katıl',
  'courses.join.communities.description': 'Kavramları tartışmak ve deneyimleri paylaşmak için diğer öğrenciler ve sektör profesyonelleri ile bağlantı kur.',

  // Course Details
  'course.strategic.thinking': 'Ürün Yöneticileri için Stratejik Düşünce',
  'course.strategic.description': 'Ürün kararları ve pazar konumlandırması hakkında stratejik düşünmeyi öğren.',
  'course.effective.communication': 'Liderler için Etkili İletişim',
  'course.communication.description': 'Profesyonel ortamlarda net, ikna edici iletişim sanatında ustalaş.',
  'course.data.driven': 'Veri Destekli Karar Verme',
  'course.data.description': 'Veri analizi yapmayı ve bilinçli iş kararları vermeyi öğren.',
  'course.team.building': 'Yüksek Performanslı Takımlar Oluşturma',
  'course.team.description': 'Başarılı takımları nasıl yönetece��inizi, motive edeceğinizi ve geliştireceğinizi keşfedin.',
  'course.career.transition': 'Kariyer Geçiş Stratejileri',
  'course.career.description': 'Kariyer değişikliklerinde güvenle ve stratejik planlama ile ilerleyin.',
  'course.python.analytics': 'İş Analitiği için Python',
  'course.python.description': 'Veri analizi ve iş içgörüleri için Python programlamayı öğrenin.',

  // Course Durations
  'course.3.weeks': '3 hafta',
  'course.4.weeks': '4 hafta',
  'course.5.weeks': '5 hafta',
  'course.6.weeks': '6 hafta',
  'course.8.weeks': '8 hafta',
  'course.10.weeks': '10 hafta',

  // Course Levels
  'course.level.beginner': 'Başlangıç',
  'course.level.intermediate': 'Orta',
  'course.level.advanced': 'İleri',
  'course.level.all': 'Tüm Seviyeler',

  // Course Actions
  'course.match.label': 'uyum',
  'course.preview': 'Önizle',
  'course.enroll.now': 'Şimdi Kayıt Ol',

  // Skills for Courses
  'skill.strategic.thinking': 'Stratejik Düşünce',
  'skill.product.management': 'Ürün Yönetimi',
  'skill.decision.making': 'Karar Verme',
  'skill.communication': 'İletişim',
  'skill.leadership': 'Liderlik',
  'skill.public.speaking': 'Halka Konuşma',
  'skill.analytics': 'Analitik',
  'skill.critical.thinking': 'Eleştirel Düşünce',
  'skill.problem.solving': 'Problem Çözme',
  'skill.team.leadership': 'Takım Liderliği',
  'skill.collaboration': 'İşbirliği',
  'skill.people.management': 'İnsan Yönetimi',
  'skill.career.planning': 'Kariyer Planlama',
  'skill.networking': 'Networking',
  'skill.personal.branding': 'Kişisel Marka',
  'skill.python': 'Python',
  'skill.data.analysis': 'Veri Analizi',
  'skill.technical.skills': 'Teknik Beceriler',

  // Authentication
  'auth.required': 'Bu sayfaya erişmek için giriş yapmalısınız.',
  'dashboard': 'Dashboard',
  'sign.out': 'Çıkış Yap',
  'sign.out.desc': 'Hesabınızdan çıkış yapın',
  'profile.settings': 'Profil ayarları'
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = React.useState<'tr' | 'en'>('tr');

  const t = (key: string): string => {
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};