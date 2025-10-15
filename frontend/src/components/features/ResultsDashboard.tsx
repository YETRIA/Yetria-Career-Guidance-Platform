import { ImageWithFallback } from "../common/ImageWithFallback";
import { Users, Target, TrendingUp, Brain, Heart, Shield, Clock, Star, CheckCircle2, Cpu, Calculator, Compass, ExternalLink, ArrowUp, ArrowDown, Minus, ChevronRight, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService";

interface ResultsDashboardProps {
  results: {
    skillScores: Record<string, number>;
    responses?: Record<string, any>;
  };
  onEnrollCourse: (courseId: string, courseUrl?: string) => void;
}

export function ResultsDashboard({ results, onEnrollCourse }: ResultsDashboardProps) {
  const { skillScores } = results;
  const compatibility = (results as any).responses?.compatibility as Array<{ meslek: string; uyum: number }> | undefined;
  
  // Mentorluk modal state'leri
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [mentorshipModalStep, setMentorshipModalStep] = useState<'profile' | 'form' | 'success'>('profile');
  const [mentorshipForm, setMentorshipForm] = useState({
    supportTopic: '',
    message: ''
  });

  // Course recommendations state
  const [courseRecommendations, setCourseRecommendations] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch course recommendations based on improvement areas
  useEffect(() => {
    const fetchCourseRecommendations = async () => {
      const improvementAreasForFetch = skillsData.filter(skill => skill.score < skill.groupAverage);
      if (improvementAreasForFetch.length === 0) return;
      
      setCoursesLoading(true);
      try {
        const competencyKeywords = improvementAreasForFetch.map(area => area.key);
        const recommendations = await apiService.getCourseRecommendations(competencyKeywords, 7);
        setCourseRecommendations(recommendations);
      } catch (error) {
        console.error('Error fetching course recommendations:', error);
        // Fallback to hardcoded suggestions if API fails
        setCourseRecommendations([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourseRecommendations();
  }, [skillScores]);

  // Skills data with group averages
  const skillsData = [
    { key: "numerical", label: "Sayısal Zeka", icon: Calculator, score: skillScores?.numerical ?? 0, groupAverage: 4.0 },
    { key: "analytical", label: "Analitik Düşünme", icon: Brain, score: skillScores?.analytical ?? 0, groupAverage: 4.2 },
    { key: "stress_management", label: "Stres Yönetimi", icon: Shield, score: skillScores?.stress_management ?? 0, groupAverage: 3.5 },
    { key: "empathy", label: "Empati", icon: Heart, score: skillScores?.empathy ?? 0, groupAverage: 3.8 },
    { key: "teamwork", label: "Takım Çalışması", icon: Users, score: skillScores?.teamwork ?? 0, groupAverage: 3.7 },
    { key: "decision_making", label: "Hızlı Karar Alma", icon: Target, score: skillScores?.decision_making ?? 0, groupAverage: 3.9 },
    { key: "resilience", label: "Duygusal Dayanıklılık", icon: TrendingUp, score: skillScores?.resilience ?? 0, groupAverage: 3.6 },
    { key: "technology", label: "Teknoloji Adaptasyonu", icon: Cpu, score: skillScores?.technology ?? 0, groupAverage: 4.1 }
  ];

  // radar chart removed

  // Calculate strong skills and improvement areas
  const strongSkills = skillsData.filter(skill => skill.score >= skill.groupAverage);
  const improvementAreas = skillsData.filter(skill => skill.score < skill.groupAverage);

  // Career matching calculation (fallback if model compatibility not provided)
  const calculateCareerMatch = () => {
    const scores = skillScores || {};
    const normalizeScore = (score: number) => Math.min(Math.max(score, 0), 5) / 5;

    const doctorWeights = { empathy: 0.25, stress_management: 0.20, decision_making: 0.20, resilience: 0.15, analytical: 0.10, teamwork: 0.10 };
    const engineerWeights = { analytical: 0.25, numerical: 0.20, technology: 0.20, decision_making: 0.15, resilience: 0.10, teamwork: 0.10 };

    let doctorScore = 0, engineerScore = 0;
    Object.entries(doctorWeights).forEach(([skill, weight]) => {
      if (scores[skill] !== undefined) doctorScore += normalizeScore(scores[skill]) * weight;
    });
    Object.entries(engineerWeights).forEach(([skill, weight]) => {
      if (scores[skill] !== undefined) engineerScore += normalizeScore(scores[skill]) * weight;
    });

    return { 
      doctorMatch: Math.min(Math.max(Math.round(doctorScore * 100), 40), 95),
      engineerMatch: Math.min(Math.max(Math.round(engineerScore * 100), 40), 95)
    };
  };

  // Prefer model probabilities if available
  let engineerMatch = undefined as number | undefined;
  let doctorMatch = undefined as number | undefined;
  if (compatibility && compatibility.length) {
    const find = (name: string) => {
      const item = compatibility.find(c => c.meslek.toLowerCase().includes(name));
      return item ? Math.round(Number(item.uyum)) : undefined;
    };
    engineerMatch = find('bilgisayar');
    doctorMatch = find('doktor');
  }
  if (engineerMatch === undefined || doctorMatch === undefined) {
    const fb = calculateCareerMatch();
    doctorMatch = doctorMatch ?? fb.doctorMatch;
    engineerMatch = engineerMatch ?? fb.engineerMatch;
  }

  // Career suggestions (MUST match occupation table titles exactly!)
  const suggestedCareers = [
    {
      title: "Doktor",  // Veritabanındaki "Doktor" ile tam eşleşmeli
      match: doctorMatch!,
      description: "İnsanlara yardım etme tutkunu ve empati yeteneğin ile hastalıkları teşhis et, tedavi et ve hayat kurtar.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80",
      skills: ["Empati", "Stres Yönetimi", "Hızlı Karar Alma", "Duygusal Dayanıklılık"],
      keyStrengths: ["İnsan odaklı yaklaşım", "Kritik karar alma", "Yüksek sorumluluklarla başa çıkma"]
    },
    {
      title: "Bilgisayar Mühendisi",  // Veritabanındaki "Bilgisayar Mühendisi" ile tam eşleşmeli
      match: engineerMatch!,
      description: "Analitik düşünce ve teknoloji tutkun ile yazılımlar geliştir, sistemler tasarla ve dijital dünyayı şekillendir.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
      skills: ["Analitik Düşünme", "Sayısal Zeka", "Teknoloji Adaptasyonu", "Problem Çözme"],
      keyStrengths: ["Sistematik yaklaşım", "Teknolojik yenilikçilik", "Mantıklı problem çözme"]
    }
  ].sort((a, b) => b.match - a.match);

  // Course suggestions - use API data if available, fallback to hardcoded
  const courseSuggestions = courseRecommendations.length > 0 ? 
    courseRecommendations.map(course => ({
      id: course.courseid.toString(),
      title: course.title,
      provider: course.provider || 'Online Platform',
      duration: course.durationtext || '4 hafta',
      skill: 'Gelişim Alanı',
      gap: '0.0',
      match: 95,
      description: course.description || 'Bu kurs gelişim alanlarınızı destekleyecek.',
      image: course.imageurl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
      courseurl: course.courseurl
    })) :
    improvementAreas.map(area => ({
      id: area.key,
      title: `${area.label} Geliştirme`,
      provider: 'Yetria Academy',
      duration: '4 hafta',
      skill: area.label,
      gap: (area.groupAverage - area.score).toFixed(1),
      match: 90,
      description: `${area.label} yeteneğini geliştir ve kariyerinde daha başarılı ol.`,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
      courseurl: undefined
    })).slice(0, 7);

  // Mentor data
  const [recommendedMentors, setRecommendedMentors] = useState<any[]>([]);

  useEffect(() => {
    const topCareer = (results as any).winningCareer || (suggestedCareers[0]?.title);
    if (!topCareer) return;
    apiService.getRecommendedMentors(topCareer)
      .then((list) => {
        setRecommendedMentors(list || []);
      })
      .catch((error) => {
        console.error('Error fetching mentors:', error);
        setRecommendedMentors([]);
      });
  }, []);

  // Map mentor data from backend (only use real database mentors)
  const mentorData = recommendedMentors.map((m: any) => ({
    id: m.mentorprofileid,
    name: m.username || 'Mentor',
    title: m.title || '',
    company: m.company || '',
    image: m.photourl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
    tags: (m.supporttopics || '').split(',').map((s: string) => s.trim()).filter(Boolean).map((t: string) => t.startsWith('#') ? t : `#${t}`),
    motto: m.quote || '',
    bio: m.bio || '',
    supportTopics: (m.supporttopics || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  }));

  // Mentorluk modal fonksiyonları
  const handleMentorClick = (mentor: any) => {
    setSelectedMentor(mentor);
    setMentorshipModalStep('profile');
  };

  const handleMentorshipRequest = () => {
    setMentorshipModalStep('form');
  };

  const handleSubmitRequest = async () => {
    try {
      if (!selectedMentor) return;
      const mentorId = selectedMentor.mentorprofileid || selectedMentor.id;
      await apiService.createMentorshipRequest(Number(mentorId));
      setMentorshipModalStep('success');
    } catch (e) {
      setMentorshipModalStep('success');
    }
  };

  const handleCloseModal = () => {
    setSelectedMentor(null);
    setMentorshipModalStep('profile');
    setMentorshipForm({ supportTopic: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 mb-20"
          >
            <div className="space-y-6">
              {/* Compass Icon */}
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center backdrop-blur-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                  border: '1px solid rgba(31, 185, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15)'
                }}
              >
                <Compass className="w-10 h-10 text-cyan-300" />
              </div>
              
              {/* Title */}
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Keşif Tamamlandı: İşte{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                  Potansiyel Haritan
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Yanıtlarınla kendi yolunu aydınlattın. Şimdi güçlü yönlerini, bu güçlerle parlayabileceğin kariyerleri ve gelişim rotanı görme zamanı.
              </p>
            </div>
          </motion.div>

          {/* Career Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {suggestedCareers.map((career, index) => (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div 
                  className="h-full rounded-2xl overflow-hidden backdrop-blur-lg transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15)'
                  }}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={career.image}
                      alt={career.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <div 
                        className="px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-white">%{career.match}</span>
                        <span className="text-xs text-gray-200">uyumlu</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white leading-tight">{career.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{career.description}</p>
                    </div>
                    

                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Skills Comparison Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto mb-20"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">
                Bilgisayar Mühendisliği meslek grubundaki bireylerin ortalama yetkinlik puanları
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Senin skorların ile yetkin mühendislerin ortalaması arasındaki 
                karşılaştırma.
              </p>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skillsData.map((skill, index) => {
                const difference = skill.score - skill.groupAverage;
                const isHigher = difference > 0;
                const isEqual = Math.abs(difference) < 0.1;
                
                return (
                  <motion.div
                    key={skill.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div 
                      className="p-6 rounded-2xl backdrop-blur-lg h-full transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15)'
                      }}
                    >
                      {/* Skill Icon and Name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: isHigher ? 'rgba(34, 197, 94, 0.2)' : isEqual ? 'rgba(156, 163, 175, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                            border: `1px solid ${isHigher ? 'rgba(34, 197, 94, 0.3)' : isEqual ? 'rgba(156, 163, 175, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`
                          }}
                        >
                          <skill.icon 
                            className={`w-5 h-5 ${isHigher ? 'text-green-400' : isEqual ? 'text-gray-400' : 'text-orange-400'}`} 
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm leading-tight">
                            {skill.label}
                          </h3>
                        </div>
                      </div>

                      {/* Your Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Sen</span>
                          <span className="text-white font-bold text-lg">
                            {skill.score.toFixed(1)}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(31, 185, 255, 0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-700 ease-out"
                            style={{ width: `${Math.min((skill.score / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Group Average */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Grup Ort.</span>
                          <span className="text-gray-400 font-bold text-lg">
                            {skill.groupAverage.toFixed(1)}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(156, 163, 175, 0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-700 ease-out"
                            style={{ width: `${Math.min((skill.groupAverage / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Comparison */}
                      <div className="flex items-center justify-center gap-2 py-2">
                        {isEqual ? (
                          <>
                            <Minus className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-sm font-medium">
                              {Math.abs(difference).toFixed(1)} puan ortalamada
                            </span>
                          </>
                        ) : isHigher ? (
                          <>
                            <ArrowUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">
                              +{difference.toFixed(1)} puan üzerinde
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400 text-sm font-medium">
                              {difference.toFixed(1)} puan altında
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>


          </motion.div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
            {/* Strong Skills */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div 
                className="p-8 rounded-2xl backdrop-blur-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm" 
                      style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Güçlü Yönlerin</h3>
                      <p className="text-sm text-green-400 font-medium">{strongSkills.length} yetkinlikte grup ortalamasının üzerinde</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {strongSkills.map((skill) => (
                      <div 
                        key={skill.key} 
                        className="flex items-center justify-between py-3 px-4 rounded-lg backdrop-blur-sm" 
                        style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                      >
                        <span className="font-medium text-white">{skill.label}</span>
                        <span className="text-lg font-bold text-green-400">{skill.score.toFixed(1)}</span>
                      </div>
                    ))}
                    {strongSkills.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        Henüz grup ortalamasının üzerinde bir yetkinliğin yok. Geliştirme alanlarına odaklan!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Improvement Areas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div 
                className="p-8 rounded-2xl backdrop-blur-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(249, 115, 22, 0.03) 100%)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  boxShadow: '0 8px 32px rgba(249, 115, 22, 0.1)'
                }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm" 
                      style={{ background: 'rgba(249, 115, 22, 0.2)', border: '1px solid rgba(249, 115, 22, 0.3)' }}
                    >
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Gelişim Alanların</h3>
                      <p className="text-sm text-orange-400 font-medium">{improvementAreas.length} yetkinlikte gelişim fırsatı</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {improvementAreas.map((skill) => (
                      <div 
                        key={skill.key} 
                        className="flex items-center justify-between py-3 px-4 rounded-lg backdrop-blur-sm" 
                        style={{ background: 'rgba(249, 115, 22, 0.1)' }}
                      >
                        <span className="font-medium text-white">{skill.label}</span>
                        <span className="text-lg font-bold text-orange-400">{skill.score.toFixed(1)}</span>
                      </div>
                    ))}
                    {improvementAreas.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        Harika! Tüm yetkinliklerde grup ortalamasının üzerinde performans gösteriyorsun.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mentorluk Paneli - YENİ BÖLÜM */}
          <div className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">
                Yol Haritanı Aydınlatacak Mentorlar
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Sana özel önerilen kariyer yolunda, deneyimleriyle sana rehberlik edebilecek profesyonellerle tanış.
              </p>
            </div>

            {/* Mentor Kartları - Yatay Kaydırılabilir */}
            {mentorData.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Users className="w-16 h-16 mx-auto mb-4 text-cyan-300/50" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Henüz Mentor Bulunmuyor
                  </h3>
                  <p className="text-gray-300">
                    Kariyer alanınıza uygun mentorlar sisteme eklendikçe burada görünecekler.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pb-6">
                <div className="flex gap-8 min-w-max px-4">
                  {mentorData.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-80"
                  >
                    <div 
                      className="h-full rounded-2xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15)'
                      }}
                    >
                      <div className="p-6 space-y-6">
                        {/* Üst Alan - Profil ve Bilgiler */}
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={mentor.image}
                              alt={mentor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white leading-tight mb-1">{mentor.name}</h3>
                            <p className="text-gray-300 text-sm font-medium">{mentor.title}</p>
                            <p className="text-gray-400 text-sm">{mentor.company}</p>
                          </div>
                        </div>

                        {/* Uzmanlık Etiketleri */}
                        <div>
                          <p className="text-gray-300 text-sm font-medium mb-3">Uzmanlık Alanları</p>
                          <div className="flex flex-wrap gap-2">
                            {(mentor.tags as string[]).map((tag: string, tagIndex: number) => (
                              <span
                                key={String(tagIndex)}
                                className="px-3 py-1 text-xs font-medium rounded-full"
                                style={{
                                  background: 'rgba(31, 185, 255, 0.2)',
                                  color: '#7DD3FC',
                                  border: '1px solid rgba(31, 185, 255, 0.3)'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Motto */}
                        {mentor.motto && (
                          <div>
                            <p className="text-gray-300 text-sm italic leading-relaxed">
                              "{mentor.motto}"
                            </p>
                          </div>
                        )}

                        {/* Bio/Hakkında */}
                        {mentor.bio && (
                          <div>
                            <p className="text-gray-300 text-sm font-medium mb-2">Hakkında</p>
                            <p className="text-gray-300 text-sm leading-relaxed" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {mentor.bio}
                            </p>
                          </div>
                        )}

                        {/* Profili Görüntüle Butonu */}
                        <button
                          onClick={() => handleMentorClick(mentor)}
                          className="w-full border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400/10 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <span>Profili Görüntüle</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Course Suggestions */}
          {courseSuggestions.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Gelişim Alanların İçin Özel Kurs Önerileri
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Geliştirilmesi gereken yetkinliklerin için seçilmiş kurslar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courseSuggestions.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div 
                      className="h-full rounded-2xl overflow-hidden backdrop-blur-lg transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(31, 185, 255, 0.03) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15)'
                      }}
                    >
                      <div className="relative">
                        <ImageWithFallback
                          src={course.image}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-white leading-tight">{course.title}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-300">
                            <span className="font-medium">{course.provider}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {course.duration}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{course.description}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            if ((course as any).courseurl) {
                              window.open((course as any).courseurl, '_blank');
                            } else {
                              onEnrollCourse(course.id);
                            }
                          }}
                          className="w-full border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400/10 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <span>{(course as any).courseurl ? 'Kursa Git' : 'Kursu İncele'}</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mentorluk Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 50 }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl backdrop-blur-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(31, 185, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(31, 185, 255, 0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">
                  {mentorshipModalStep === 'profile' && 'Mentor Profili'}
                  {mentorshipModalStep === 'form' && 'Talep Detayları'}
                  {mentorshipModalStep === 'success' && 'Talep Gönderildi'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Mentor Profili Aşaması */}
                {mentorshipModalStep === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-6">
                      {/* Sol Sütun - Profil Fotoğrafı */}
                      <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={selectedMentor.image}
                          alt={selectedMentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Sağ Sütun - Bilgiler */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{selectedMentor.name}</h3>
                          <p className="text-lg text-gray-300 font-medium">{selectedMentor.title}</p>
                          <p className="text-gray-400">{selectedMentor.company}</p>
                        </div>

                        {/* Etiketler */}
                        <div className="flex flex-wrap gap-2">
                          {selectedMentor.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-sm font-medium rounded-full"
                              style={{
                                background: 'rgba(31, 185, 255, 0.2)',
                                color: '#7DD3FC',
                                border: '1px solid rgba(31, 185, 255, 0.3)'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Detaylı Biyografi */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Hakkında</h4>
                      <p className="text-gray-300 leading-relaxed">{selectedMentor.bio}</p>
                    </div>

                    {/* Destek Konuları */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Destek Konuları</h4>
                      <div className="space-y-2">
                        {(selectedMentor.supportTopics as string[]).map((topic: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mentorluk Talebi Butonu */}
                    <button
                      onClick={handleMentorshipRequest}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                    >
                      Mentorluk Talebi Gönder
                    </button>
                  </motion.div>
                )}

                {/* Talep Formu Aşaması */}
                {mentorshipModalStep === 'form' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Destek Konusu Dropdown */}
                      <div>
                        <label className="block text-white font-medium mb-2">Destek Konusu</label>
                        <select
                          value={mentorshipForm.supportTopic}
                          onChange={(e) => setMentorshipForm({ ...mentorshipForm, supportTopic: e.target.value })}
                          className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none transition-colors"
                        >
                          <option value="">Bir konu seçin</option>
                          {selectedMentor.supportTopics.map((topic: string, index: number) => (
                            <option key={index} value={topic} className="bg-gray-800 text-white">
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Mesaj Alanı */}
                      <div>
                        <label className="block text-white font-medium mb-2">Mesajınız</label>
                        <p className="text-gray-400 text-sm mb-3">
                          Kendinizi kısaca tanıtın ve bu mentordan neden destek almak istediğinizi belirtin. (Maks. 500 karakter)
                        </p>
                        <textarea
                          value={mentorshipForm.message}
                          onChange={(e) => setMentorshipForm({ ...mentorshipForm, message: e.target.value.slice(0, 500) })}
                          placeholder="Merhaba, ben..."
                          rows={6}
                          className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-cyan-400 focus:outline-none transition-colors resize-none"
                        />
                        <div className="text-right text-sm text-gray-400 mt-2">
                          {mentorshipForm.message.length}/500
                        </div>
                      </div>
                    </div>

                    {/* Gönder Butonu */}
                    <button
                      onClick={handleSubmitRequest}
                      disabled={!mentorshipForm.supportTopic || !mentorshipForm.message.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Talebi Gönder
                    </button>
                  </motion.div>
                )}

                {/* Başarı Aşaması */}
                {mentorshipModalStep === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    {/* Başarı İkonu */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '2px solid rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </motion.div>

                    {/* Başlık */}
                    <h3 className="text-2xl font-bold text-white">Talep Başarıyla Gönderildi!</h3>

                    {/* Açıklama */}
                    <p className="text-gray-300 leading-relaxed max-w-md mx-auto">
                      Talebiniz, incelenmek üzere YETRIA ekibine ulaştı. Onay sürecinin ardından sana e-posta ile bilgilendirme yapacağız.
                    </p>

                    {/* Kapatma Butonu */}
                    <button
                      onClick={handleCloseModal}
                      className="border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400/10 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Paneli Kapat
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}