import { Brain, Heart, Shield, Users, Zap, Clock, Cpu, Calculator } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface SkillIconProps {
  skill: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function SkillIcon({ skill, className = "", size = "md" }: SkillIconProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const skillConfig = {
    "analytical": {
      icon: Brain,
      label: "Analytical Thinking",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "#1FB9FF",
      lightBg: "#F0F9FF"
    },
    "empathy": {
      icon: Heart,
      label: "Empathy",
      gradient: "from-orange-500 to-orange-600",
      bgColor: "#FF8E4D",
      lightBg: "#FFF7ED"
    },
    "stress": {
      icon: Shield,
      label: "Stress Management", 
      gradient: "from-purple-500 to-purple-600",
      bgColor: "#7C6BFF",
      lightBg: "#FAF5FF"
    },
    "teamwork": {
      icon: Users,
      label: "Teamwork",
      gradient: "from-cyan-500 to-cyan-600",
      bgColor: "#2AA9FF",
      lightBg: "#F0F9FF"
    },
    "resilience": {
      icon: Zap,
      label: "Emotional Resilience",
      gradient: "from-amber-500 to-amber-600",
      bgColor: "#F6B44B",
      lightBg: "#FFFBEB"
    },
    "decision": {
      icon: Clock,
      label: "Fast Decision-Making",
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "#5C2BFF",
      lightBg: "#F5F3FF"
    },
    "technology": {
      icon: Cpu,
      label: "Technology Adaptation",
      gradient: "from-sky-500 to-sky-600",
      bgColor: "#12C2FF",
      lightBg: "#F0F9FF"
    },
    "numerical": {
      icon: Calculator,
      label: "Numerical Intelligence",
      gradient: "from-rose-500 to-rose-600",
      bgColor: "#FFA063",
      lightBg: "#FFF7ED"
    }
  };

  const config = skillConfig[skill as keyof typeof skillConfig];
  
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div 
      className={`${sizes[size]} rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover-lift ${className}`}
      style={{ 
        background: `linear-gradient(135deg, ${config.bgColor}, ${config.bgColor}dd)`,
        boxShadow: `0 4px 12px ${config.bgColor}33`
      }}
    >
      <Icon className={`${iconSizes[size]} text-white`} />
    </div>
  );
}

// Animated skill icon with floating effect
export function AnimatedSkillIcon({ skill, className = "", size = "md", delay = 0 }: SkillIconProps & { delay?: number }) {
  return (
    <div 
      className="animate-float hover-scale"
      style={{ animationDelay: `${delay}s` }}
    >
      <SkillIcon skill={skill} className={className} size={size} />
    </div>
  );
}

// Skill icon with label and background
export function SkillIconWithLabel({ skill, className = "", size = "md" }: SkillIconProps) {
  const { t } = useLanguage();
  
  const skillConfig = {
    "analytical": { bgColor: "#1FB9FF", lightBg: "#F0F9FF" },
    "empathy": { bgColor: "#FF8E4D", lightBg: "#FFF7ED" },
    "stress": { bgColor: "#7C6BFF", lightBg: "#FAF5FF" },
    "teamwork": { bgColor: "#2AA9FF", lightBg: "#F0F9FF" },
    "resilience": { bgColor: "#F6B44B", lightBg: "#FFFBEB" },
    "decision": { bgColor: "#5C2BFF", lightBg: "#F5F3FF" },
    "technology": { bgColor: "#12C2FF", lightBg: "#F0F9FF" },
    "numerical": { bgColor: "#FFA063", lightBg: "#FFF7ED" }
  };

  const config = skillConfig[skill as keyof typeof skillConfig];

  return (
    <div 
      className={`modern-card text-center hover-lift cursor-pointer transition-all duration-200 ${className}`}
      style={{ background: config?.lightBg }}
    >
      <div className="flex flex-col items-center gap-4">
        <SkillIcon skill={skill} size={size} />
        <div>
          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
            {t(`skill.${skill}`)}
          </h4>
        </div>
      </div>
    </div>
  );
}

// Interactive skill icon for selection
export function SelectableSkillIcon({ 
  skill, 
  selected = false, 
  onClick, 
  className = "", 
  size = "md" 
}: SkillIconProps & { 
  selected?: boolean;
  onClick?: () => void;
}) {
  const skillConfig = {
    "analytical": { bgColor: "#1FB9FF", lightBg: "#F0F9FF" },
    "empathy": { bgColor: "#FF8E4D", lightBg: "#FFF7ED" },
    "stress": { bgColor: "#7C6BFF", lightBg: "#FAF5FF" },
    "teamwork": { bgColor: "#2AA9FF", lightBg: "#F0F9FF" },
    "resilience": { bgColor: "#F6B44B", lightBg: "#FFFBEB" },
    "decision": { bgColor: "#5C2BFF", lightBg: "#F5F3FF" },
    "technology": { bgColor: "#12C2FF", lightBg: "#F0F9FF" },
    "numerical": { bgColor: "#FFA063", lightBg: "#FFF7ED" }
  };

  const config = skillConfig[skill as keyof typeof skillConfig];

  return (
    <button
      onClick={onClick}
      className={`modern-card-selectable p-4 rounded-2xl transition-all duration-200 hover:scale-105 focus-modern group ${
        selected ? 'selected' : ''
      } ${className}`}
      style={{ 
        background: selected ? config?.lightBg : 'white',
        borderColor: selected ? config?.bgColor : '#E6EAF2'
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <SkillIcon skill={skill} size={size} />
        {selected && (
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config?.bgColor }}
          />
        )}
      </div>
    </button>
  );
}

// Skill icon grid component with staggered animations
export function SkillIconGrid({ skills, className = "" }: { skills: string[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
      {skills.map((skill, index) => (
        <AnimatedSkillIcon 
          key={skill} 
          skill={skill} 
          delay={index * 0.1}
          size="lg"
          className="justify-self-center"
        />
      ))}
    </div>
  );
}

// Skill progress component
export function SkillProgress({ 
  skill, 
  score, 
  className = "" 
}: { 
  skill: string; 
  score: number; 
  className?: string;
}) {
  const { t, language } = useLanguage();
  
  const skillConfig = {
    "analytical": { bgColor: "#1FB9FF" },
    "empathy": { bgColor: "#FF8E4D" },
    "stress": { bgColor: "#7C6BFF" },
    "teamwork": { bgColor: "#2AA9FF" },
    "resilience": { bgColor: "#F6B44B" },
    "decision": { bgColor: "#5C2BFF" },
    "technology": { bgColor: "#12C2FF" },
    "numerical": { bgColor: "#FFA063" }
  };

  const config = skillConfig[skill as keyof typeof skillConfig];

  return (
    <div className={`modern-card hover-lift ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkillIcon skill={skill} size="md" />
          <div>
            <h4 className="font-semibold text-gray-900">{t(`skill.${skill}`)}</h4>
            <p className="text-sm text-gray-500">
              {language === 'tr' ? 'Güç Seviyesi' : 'Strength Level'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-500">/ 100</div>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${score}%`,
            background: `linear-gradient(90deg, ${config?.bgColor}, ${config?.bgColor}dd)`
          }}
        />
      </div>
    </div>
  );
}