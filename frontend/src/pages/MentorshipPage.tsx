import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/common/ImageWithFallback";
import { Star, MapPin, Calendar, MessageCircle, Filter, Search, Brain, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface MentorshipPageProps {
  onConnectMentor: (mentorId: string) => void;
  onStartAssessment?: () => void;
}

export function MentorshipPage({ onConnectMentor, onStartAssessment }: MentorshipPageProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: language === 'tr' ? "Tüm Mentorlar" : "All Mentors" },
    { id: "product", label: language === 'tr' ? "Ürün" : "Product" },
    { id: "design", label: language === 'tr' ? "Tasarım" : "Design" },
    { id: "engineering", label: language === 'tr' ? "Mühendislik" : "Engineering" },
    { id: "consulting", label: language === 'tr' ? "Danışmanlık" : "Consulting" },
    { id: "marketing", label: language === 'tr' ? "Pazarlama" : "Marketing" }
  ];

  const mentors = [
    {
      id: "1",
      name: "Sarah Chen",
      title: "Senior Product Manager",
      company: "Stripe",
      location: "San Francisco, CA",
      rating: 4.9,
      sessions: 127,
      specialties: ["Product Strategy", "Career Transitions", "Leadership"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80",
      bio: "10+ years in product management at top tech companies. Passionate about helping early-career professionals navigate product roles.",
      nextAvailable: "This week",
      category: "product",
      relevantSkills: ["analytical", "decision", "teamwork"] // Skills this mentor is best for
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      title: "Design Director",
      company: "Airbnb",
      location: "Remote",
      rating: 4.8,
      sessions: 89,
      specialties: ["UX Design", "Design Systems", "Portfolio Reviews"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bio: "Creative leader with experience building design teams. Helps designers grow their craft and advance their careers.",
      nextAvailable: "Next week",
      category: "design",
      relevantSkills: ["empathy", "analytical", "teamwork"]
    },
    {
      id: "3",
      name: "Elena Popović",
      title: "Principal Consultant",
      company: "McKinsey & Company",
      location: "New York, NY",
      rating: 5.0,
      sessions: 156,
      specialties: ["Strategy", "Problem Solving", "Case Interviews"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
      bio: "Strategy consultant helping professionals break into consulting and develop structured thinking skills.",
      nextAvailable: "Tomorrow",
      category: "consulting",
      relevantSkills: ["analytical", "stress", "decision"]
    },
    {
      id: "4",
      name: "David Kim",
      title: "Software Engineering Manager",
      company: "Google",
      location: "Seattle, WA",
      rating: 4.9,
      sessions: 203,
      specialties: ["Technical Leadership", "Career Growth", "System Design"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      bio: "Engineering leader passionate about helping developers grow into technical leadership roles.",
      nextAvailable: "This week",
      category: "engineering",
      relevantSkills: ["analytical", "technology", "teamwork"]
    },
    {
      id: "5",
      name: "Julia Thompson",
      title: "VP Marketing",
      company: "HubSpot",
      location: "Boston, MA",
      rating: 4.7,
      sessions: 94,
      specialties: ["Growth Marketing", "Brand Strategy", "Team Leadership"],
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      bio: "Marketing executive with expertise in scaling growth teams and developing go-to-market strategies.",
      nextAvailable: "Next week",
      category: "marketing",
      relevantSkills: ["empathy", "teamwork", "resilience"]
    },
    {
      id: "6",
      name: "Ahmed Hassan",
      title: "Senior Data Scientist",
      company: "Meta",
      location: "Menlo Park, CA",
      rating: 4.8,
      sessions: 78,
      specialties: ["Data Science", "Analytics", "Career Pivoting"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bio: "Data science leader helping professionals transition into analytics and data-driven roles.",
      nextAvailable: "This week",
      category: "engineering",
      relevantSkills: ["numerical", "analytical", "technology"]
    },
    {
      id: "7",
      name: "Dr. Lisa Chen",
      title: "Psychologist & Career Coach",
      company: "MindWell Institute",
      location: "Los Angeles, CA",
      rating: 4.9,
      sessions: 142,
      specialties: ["Stress Management", "Work-Life Balance", "Mental Resilience"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      bio: "Licensed psychologist specializing in workplace mental health and helping professionals build resilience.",
      nextAvailable: "This week",
      category: "consulting",
      relevantSkills: ["stress", "resilience", "empathy"]
    },
    {
      id: "8",
      name: "Carlos Martinez",
      title: "Operations Director",
      company: "Tesla",
      location: "Austin, TX",
      rating: 4.8,
      sessions: 98,
      specialties: ["Operations", "Process Optimization", "Quick Decision Making"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bio: "Operations expert who excels at fast-paced environments and helping others make effective decisions under pressure.",
      nextAvailable: "Next week",
      category: "consulting",
      relevantSkills: ["decision", "stress", "teamwork"]
    }
  ];

  // Get personalized mentors based on user's skill assessment
  const getPersonalizedMentors = () => {
    if (!user?.skillScores) return [];

    const skillScores = user.skillScores;
    
    // Find user's top 3 skills
    const topSkills = Object.entries(skillScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill);

    // Score mentors based on how well they match user's top skills
    const scoredMentors = mentors.map(mentor => {
      const relevanceScore = mentor.relevantSkills.reduce((score, skill) => {
        const skillIndex = topSkills.indexOf(skill);
        if (skillIndex !== -1) {
          // Higher score for matching higher-ranked skills
          return score + (3 - skillIndex);
        }
        return score;
      }, 0);

      return { ...mentor, relevanceScore };
    });

    // Sort by relevance score and return top matches
    return scoredMentors
      .filter(mentor => mentor.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6); // Show top 6 most relevant mentors
  };

  const personalizedMentors = user?.assessmentCompleted ? getPersonalizedMentors() : [];
  
  const filteredMentors = selectedFilter === "all" 
    ? (user?.assessmentCompleted ? personalizedMentors : mentors)
    : (user?.assessmentCompleted ? personalizedMentors : mentors).filter(mentor => mentor.category === selectedFilter);

  // If user hasn't completed assessment, show assessment required message
  if (!user?.assessmentCompleted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Assessment Required Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8 max-w-4xl mx-auto"
            >
              {/* Brain Icon */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge className="bg-orange-100 text-orange-700 px-6 py-2 text-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {language === 'tr' ? 'Değerlendirme Gerekli' : 'Assessment Required'}
                  </Badge>
                </div>
                
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  {language === 'tr' ? 'Mentorların Seni Bekliyor!' : 'Your Mentors Are Waiting!'}
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  {language === 'tr' 
                    ? 'Senin için en uygun mentorları belirleyebilmemiz için önce yetkinlik değerlendirmesini tamamlaman gerekiyor. Değerlendirme sadece 5 dakika sürüyor!'
                    : 'To match you with the most suitable mentors, you need to complete your skill assessment first. The assessment takes only 5 minutes!'
                  }
                </p>
              </div>

              <div className="space-y-6">
                <Button 
                  onClick={() => onStartAssessment?.()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-3" />
                  {language === 'tr' ? 'Değerlendirmeye Başla' : 'Start Assessment'}
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>

                <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <span>
                    {language === 'tr' 
                      ? '✨ Tamamen ücretsiz • 🚀 Anında sonuç • 🎯 Kişiselleştirilmiş öneriler'
                      : '✨ Completely free • 🚀 Instant results • 🎯 Personalized recommendations'
                    }
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {language === 'tr' ? 'Kişiselleştirilmiş Eşleşme' : 'Personalized Matching'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'tr' 
                      ? 'Yetkinliklerine göre en uygun mentorlarla eşleşir'
                      : 'Get matched with the most suitable mentors based on your skills'
                    }
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {language === 'tr' ? 'Hedefli Rehberlik' : 'Targeted Guidance'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'tr' 
                      ? 'Gelişim alanlarına odaklı mentorluk desteği'
                      : 'Focused mentoring support for your development areas'
                    }
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {language === 'tr' ? 'Hızlı Başlangıç' : 'Quick Start'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'tr' 
                      ? '5 dakikalık değerlendirme sonrası hemen mentor bul'
                      : 'Find mentors immediately after 5-minute assessment'
                    }
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="space-y-6">
              <div className="flex justify-center mb-4">
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-2 text-lg">
                  <Star className="w-5 h-5 mr-2" />
                  {language === 'tr' ? 'Senin İçin Özel Seçildi' : 'Personally Selected for You'}
                </Badge>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                {language === 'tr' ? 'Yetkinliklerine Özel' : 'Your Skill-Matched'}
                <br />
                <span className="text-gradient">
                  {language === 'tr' ? 'Mentorların' : 'Mentors'}
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {language === 'tr' 
                  ? 'Değerlendirme sonuçlarına göre en uygun mentorlar belirlendi. Bu profesyoneller senin güçlü yönlerini destekleyecek ve gelişim alanlarında rehberlik edecek.'
                  : 'Based on your assessment results, we\'ve matched you with the most suitable mentors. These professionals will support your strengths and guide you in your development areas.'
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'tr' 
                    ? "Uzmanlık, şirket veya rol ile ara..." 
                    : "Search by expertise, company, or role..."
                  }
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg placeholder-gray-400 shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <Filter className="w-5 h-5 mr-3" />
                {language === 'tr' ? 'Gelişmiş Filtreler' : 'Advanced Filters'}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600 font-medium">{language === 'tr' ? 'Mentor' : 'Mentors'}</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600 font-medium">{language === 'tr' ? 'Oturum' : 'Sessions'}</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">4.8★</div>
                <div className="text-gray-600 font-medium">{language === 'tr' ? 'Ortalama' : 'Average'}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full bg-white border-0 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                  {/* Relevance Indicator */}
                  {user?.assessmentCompleted && mentor.relevanceScore && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">
                          {mentor.relevanceScore === 3 && (language === 'tr' ? 'Mükemmel Uyum' : 'Perfect Match')}
                          {mentor.relevanceScore === 2 && (language === 'tr' ? 'Çok Uyumlu' : 'Great Match')}
                          {mentor.relevanceScore === 1 && (language === 'tr' ? 'Uyumlu' : 'Good Match')}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 3 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < mentor.relevanceScore
                                  ? 'text-blue-500 fill-blue-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Profile Header */}
                  <div className="p-8 pb-6">
                    <div className="flex items-start space-x-5 mb-6">
                      <div className="relative">
                        <ImageWithFallback
                          src={mentor.image}
                          alt={mentor.name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{mentor.name}</h3>
                        <p className="text-gray-600 mb-1 font-medium">{mentor.title}</p>
                        <p className="text-blue-600 font-semibold">{mentor.company}</p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm mb-6">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{mentor.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-800">{mentor.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 font-medium">{mentor.sessions} {language === 'tr' ? 'oturum' : 'sessions'}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-700 leading-relaxed mb-6 line-clamp-3">{mentor.bio}</p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {mentor.specialties.map((specialty) => (
                        <Badge 
                          key={specialty} 
                          className="bg-blue-50 text-blue-700 border-0 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-center mb-6 p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-green-700">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {language === 'tr' 
                            ? `Müsait: ${mentor.nextAvailable === 'This week' ? 'Bu hafta' : 
                                         mentor.nextAvailable === 'Next week' ? 'Gelecek hafta' : 
                                         mentor.nextAvailable === 'Tomorrow' ? 'Yarın' : mentor.nextAvailable}`
                            : `Available ${mentor.nextAvailable}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-8 pb-8">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => onConnectMentor(mentor.id)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {language === 'tr' ? 'Bağlan' : 'Connect'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-xl font-semibold transition-all duration-200"
                      >
                        {language === 'tr' ? 'Profil' : 'Profile'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {language === 'tr' ? 'Mentorluk Nasıl Çalışır' : 'How Mentorship Works'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {language === 'tr'
                ? 'Mentorluk platformumuz seni sektör profesyonelleriyle bağlayarak kariyerin hakkında anlamlı konuşmalar yapmanı sağlar.'
                : 'Our mentorship platform connects you with industry professionals for meaningful conversations about your career.'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'tr' ? 'Keşfet ve Bağlan' : 'Browse & Connect'}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'tr'
                  ? 'Mentor profillerini keşfet ve deneyimi hedeflerin ile uyumlu profesyonellere bağlantı istekleri gönder.'
                  : 'Explore mentor profiles and send connection requests to professionals whose experience aligns with your goals.'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'tr' ? 'Oturum Planla' : 'Schedule Sessions'}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'tr'
                  ? 'Hem senin hem de mentorunun uygun olduğu zamanlarda bire bir video görüşmeleri ayarla.'
                  : 'Book one-on-one video calls at times that work for both you and your mentor.'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'tr' ? 'Rehberlik Al' : 'Get Guidance'}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'tr'
                  ? 'Kariyer gelişimini hızlandırmak için kişiselleştirilmiş tavsiyeler, geri bildirimler ve içgörüler al.'
                  : 'Receive personalized advice, feedback, and insights to accelerate your career growth.'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}