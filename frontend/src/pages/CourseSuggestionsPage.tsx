import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/common/ImageWithFallback";
import { Clock, Users, Star, BookOpen, Play, Award, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

interface CourseSuggestionsPageProps {
  skillScores?: Record<string, number>;
  onEnrollCourse: (courseId: string) => void;
}

export function CourseSuggestionsPage({ skillScores, onEnrollCourse }: CourseSuggestionsPageProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("personalized");
  const [showAllCourses, setShowAllCourses] = useState(false);

  const categories = [
    { id: "personalized", label: t("courses.personalized") || "Kişiye Özel" },
    { id: "leadership", label: t("courses.leadership") || "Liderlik" },
    { id: "communication", label: t("courses.communication") || "İletişim" },
    { id: "analytical", label: t("courses.analytical") || "Analitik Beceriler" },
    { id: "technical", label: t("courses.technical") || "Teknik Beceriler" },
    { id: "career", label: t("courses.career") || "Kariyer Geliştirme" }
  ];

  const courses = [
    {
      id: "1",
      title: t("course.strategic.thinking") || "Ürün Yöneticileri için Stratejik Düşünce",
      provider: "Product School",
      instructor: "Sarah Martinez",
      duration: t("course.6.weeks") || "6 hafta",
      level: "Intermediate",
      rating: 4.8,
      students: 1247,
      price: "$299",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=400&q=80",
      description: t("course.strategic.description") || "Ürün kararları ve pazar konumlandırması hakkında stratejik düşünmeyi öğren.",
      skills: [t("skill.strategic.thinking") || "Stratejik Düşünce", t("skill.product.management") || "Ürün Yönetimi", t("skill.decision.making") || "Karar Verme"],
      category: "personalized",
      match: 92
    },
    {
      id: "2",
      title: t("course.effective.communication") || "Liderler için Etkili İletişim",
      provider: "Harvard Business School Online",
      instructor: "Prof. Amy Chen",
      duration: t("course.4.weeks") || "4 hafta",
      level: "All Levels",
      rating: 4.9,
      students: 3521,
      price: "$450",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      description: t("course.communication.description") || "Profesyonel ortamlarda net, ikna edici iletişim sanatında ustalaş.",
      skills: [t("skill.communication") || "İletişim", t("skill.leadership") || "Liderlik", t("skill.public.speaking") || "Halka Konuşma"],
      category: "communication",
      match: 88
    },
    {
      id: "3",
      title: t("course.data.driven") || "Veri Destekli Karar Verme",
      provider: "Coursera",
      instructor: "Dr. Michael Rodriguez",
      duration: t("course.8.weeks") || "8 hafta",
      level: "Beginner",
      rating: 4.7,
      students: 2156,
      price: "$89",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
      description: t("course.data.description") || "Veri analizi yapmayı ve bilinçli iş kararları vermeyi öğren.",
      skills: [t("skill.analytics") || "Analitik", t("skill.critical.thinking") || "Eleştirel Düşünce", t("skill.problem.solving") || "Problem Çözme"],
      category: "analytical",
      match: 85
    },
    {
      id: "4",
      title: t("course.team.building") || "Yüksek Performanslı Takımlar Oluşturma",
      provider: "LinkedIn Learning",
      instructor: "Jennifer Park",
      duration: t("course.3.weeks") || "3 hafta",
      level: "Intermediate",
      rating: 4.6,
      students: 987,
      price: "$199",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
      description: t("course.team.description") || "Başarılı takımları nasıl yöneteceğinizi, motive edeceğinizi ve geliştireceğinizi keşfedin.",
      skills: [t("skill.team.leadership") || "Takım Liderliği", t("skill.collaboration") || "İşbirliği", t("skill.people.management") || "İnsan Yönetimi"],
      category: "leadership",
      match: 82
    },
    {
      id: "5",
      title: t("course.career.transition") || "Kariyer Geçiş Stratejileri",
      provider: "Career Academy",
      instructor: "David Kim",
      duration: t("course.5.weeks") || "5 hafta",
      level: "All Levels",
      rating: 4.8,
      students: 1634,
      price: "$249",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80",
      description: t("course.career.description") || "Kariyer değişikliklerinde güvenle ve stratejik planlama ile ilerleyin.",
      skills: [t("skill.career.planning") || "Kariyer Planlama", t("skill.networking") || "Networking", t("skill.personal.branding") || "Kişisel Marka"],
      category: "career",
      match: 79
    },
    {
      id: "6",
      title: t("course.python.analytics") || "İş Analitiği için Python",
      provider: "DataCamp",
      instructor: "Elena Popović",
      duration: t("course.10.weeks") || "10 hafta",
      level: "Beginner",
      rating: 4.5,
      students: 892,
      price: "$149",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80",
      description: t("course.python.description") || "Veri analizi ve iş içgörüleri için Python programlamayı öğrenin.",
      skills: [t("skill.python") || "Python", t("skill.data.analysis") || "Veri Analizi", t("skill.technical.skills") || "Teknik Beceriler"],
      category: "technical",
      match: 75
    }
  ];

  // Kişiye özel kurslar (match >= 80) ve tüm kurslar ayrımı
  const personalizedCourses = courses.filter(course => course.match >= 80);
  const allCourses = courses;
  
  const filteredCourses = selectedCategory === "personalized" 
    ? (showAllCourses ? allCourses : personalizedCourses)
    : courses.filter(course => course.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              {t("courses.page.title") || "Kurslar"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("courses.page.description") || "Değerlendirme sonuçlarına dayanarak, güçlerini geliştirmene ve büyüme alanlarını ele almana yardımcı olacak kursları seçtik."}
            </p>
            
            {skillScores && (
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>{t("courses.personalized.recommendations") || "Kişiselleştirilmiş öneriler"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{t("courses.industry.certificates") || "Sektör onaylı sertifikalar"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{t("courses.expert.instructors") || "Uzman eğitmenler"}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 border-b border-gray-200">
        <div className="container">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
                {category.id === "personalized" && skillScores && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {showAllCourses ? allCourses.length : personalizedCourses.length}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container">
          {selectedCategory === "personalized" && skillScores && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {showAllCourses 
                  ? (t("courses.all.courses") || "Tüm Kurslar")
                  : (t("courses.personalized.for.you") || "Senin İçin Özel Kurslar")
                }
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {showAllCourses
                  ? (t("courses.all.description") || "Mevcut tüm kurs seçeneklerini görüntüle ve kendin için en uygun olanları seç.")
                  : (t("courses.personalized.description") || "Bu kurslar özellikle güçlerini tamamlamak ve değerlendirmende belirlenen alanlarda büyümene yardımcı olmak için seçildi.")
                }
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <div className="space-y-4 h-full flex flex-col p-6">
                    <div className="relative">
                      <ImageWithFallback
                        src={course.image}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {course.match && (
                        <div className="absolute top-3 right-3 bg-gray-900 text-white px-2 py-1 rounded-full text-xs font-medium">
                          %{course.match} {t("course.match.label") || "uyum"}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        {course.level === 'Beginner' ? (t("course.level.beginner") || 'Başlangıç') : 
                         course.level === 'Intermediate' ? (t("course.level.intermediate") || 'Orta') : 
                         course.level === 'Advanced' ? (t("course.level.advanced") || 'İleri') : 
                         course.level === 'All Levels' ? (t("course.level.all") || 'Tüm Seviyeler') : course.level
                        }
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.provider} • {course.instructor}</p>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{course.students.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-lg font-semibold text-gray-900">{course.price}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {t("course.preview") || "Önizle"}
                        </Button>
                        <Button
                          onClick={() => onEnrollCourse(course.id)}
                          size="sm"
                          className="text-sm"
                        >
                          {t("course.enroll.now") || "Şimdi Kayıt Ol"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Daha Fazlası Butonu - Sadece kişiselleştirilmiş kategoride göster */}
          {selectedCategory === "personalized" && !showAllCourses && skillScores && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Button
                onClick={() => setShowAllCourses(true)}
                variant="outline"
                size="lg"
                className="px-8 py-4 rounded-full text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <ChevronDown className="w-5 h-5 mr-2" />
                {t("courses.show.more") || "Daha Fazla Kurs Göster"}
                <Badge variant="secondary" className="ml-3">
                  +{allCourses.length - personalizedCourses.length}
                </Badge>
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                {t("courses.show.more.description") || "Tüm mevcut kursları keşfet"}
              </p>
            </motion.div>
          )}
          
          {/* Daha Az Göster Butonu */}
          {selectedCategory === "personalized" && showAllCourses && skillScores && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Button
                onClick={() => setShowAllCourses(false)}
                variant="outline"
                size="lg"
                className="px-8 py-4 rounded-full text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <ChevronUp className="w-5 h-5 mr-2" />
                {t("courses.show.less") || "Daha Az Göster"}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                {t("courses.show.less.description") || "Sadece senin için önerilen kursları göster"}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("courses.learning.path.title") || "Öğrenme Yolunu Oluştur"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("courses.learning.path.description") || "Kariyer hedeflerin ile uyumlu birden fazla kursu birleştirerek yapılandırılmış bir öğrenme yolculuğu oluştur."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("courses.learn.pace.title") || "Kendi Hızında Öğren"}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("courses.learn.pace.description") || "Kurs materyallerine istediğin zaman, istediğin yerden eriş. Programına ve mesleki yükümlülüklerine göre öğren."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("courses.earn.certificates.title") || "Sertifika Kazan"}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("courses.earn.certificates.description") || "LinkedIn profiline ve özgeçmişine ekleyebileceğin sektör onaylı sertifikalar kazanmak için kursları tamamla."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("courses.join.communities.title") || "Topluluklara Katıl"}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t("courses.join.communities.description") || "Kavramları tartışmak ve deneyimleri paylaşmak için diğer öğrenciler ve sektör profesyonelleri ile bağlantı kur."}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}