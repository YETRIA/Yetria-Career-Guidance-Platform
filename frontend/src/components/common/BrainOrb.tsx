import { useState, useRef, useEffect } from "react";
import { Brain, Zap, Users, Target, Heart, TrendingUp, Cpu, Calculator, Shield, Clock, Play, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext";

interface BrainOrbProps {
  size?: "S" | "M" | "L";
  variant?: "Idle" | "Hover" | "Grow" | "Pulse" | "Burst";
  theme?: "Light" | "Dark";
  reducedMotion?: boolean;
  onClick?: () => void;
  onSkillNodeClick?: (skill: string) => void;
  onStartAssessment?: () => void;
  showStartButton?: boolean;
  className?: string;
  "aria-label"?: string;
  tabIndex?: number;
}

interface SkillNode {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  position: { x: number; y: number };
  color: string;
}

const skillNodes: SkillNode[] = [
  {
    id: "analytical",
    label: "Analytical Thinking",
    icon: Brain,
    position: { x: -120, y: -80 },
    color: "#1FB9FF"
  },
  {
    id: "empathy",
    label: "Empathy",
    icon: Heart,
    position: { x: 120, y: -80 },
    color: "#FF8E4D"
  },
  {
    id: "stress",
    label: "Stress Management",
    icon: Shield,
    position: { x: 140, y: 0 },
    color: "#7C6BFF"
  },
  {
    id: "teamwork",
    label: "Teamwork",
    icon: Users,
    position: { x: 120, y: 80 },
    color: "#2AA9FF"
  },
  {
    id: "resilience",
    label: "Emotional Resilience",
    icon: Zap,
    position: { x: -120, y: 80 },
    color: "#F6B44B"
  },
  {
    id: "decision",
    label: "Fast Decision-Making",
    icon: Clock,
    position: { x: -140, y: 0 },
    color: "#5C2BFF"
  },
  {
    id: "technology",
    label: "Technology Adaptation",
    icon: Cpu,
    position: { x: 0, y: -120 },
    color: "#12C2FF"
  },
  {
    id: "numerical",
    label: "Numerical Intelligence",
    icon: Calculator,
    position: { x: 0, y: 120 },
    color: "#FFA063"
  }
];

export function BrainOrb({ 
  size = "M", 
  variant = "Idle", 
  theme = "Light", 
  reducedMotion = false,
  onClick,
  onSkillNodeClick,
  onStartAssessment,
  showStartButton = false,
  className = "",
  "aria-label": ariaLabel = "Interactive brain - click to explore",
  tabIndex = 0
}: BrainOrbProps) {
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [showSkillNodes, setShowSkillNodes] = useState(false);
  const [burstNodes, setBurstNodes] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  // Safely get language context, fallback to default if not available
  let t: (key: string) => string;
  try {
    const { t: translateFn } = useLanguage();
    t = translateFn;
  } catch (error) {
    // Fallback function when used outside LanguageProvider
    t = (key: string) => {
      const fallbacks: Record<string, string> = {
        "landing.start.discovery": "Start Discovery"
      };
      return fallbacks[key] || key;
    };
  }

  const sizes = {
    S: { width: 120, height: 120, scale: 0.8 },
    M: { width: 180, height: 180, scale: 1 },
    L: { width: 240, height: 240, scale: 1.2 }
  };

  const orbSize = sizes[size];

  useEffect(() => {
    setCurrentVariant(variant);
    if (variant === "Grow") {
      setShowSkillNodes(true);
    } else if (variant === "Idle") {
      setShowSkillNodes(false);
    }
  }, [variant]);

  const handleOrbClick = () => {
    if (!reducedMotion) {
      setCurrentVariant("Grow");
      setShowSkillNodes(true);
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOrbClick();
    }
  };

  const handleSkillNodeClick = (skillId: string) => {
    if (!reducedMotion) {
      setBurstNodes(prev => [...prev, skillId]);
      setTimeout(() => {
        setBurstNodes(prev => prev.filter(id => id !== skillId));
      }, 600);
    }
    onSkillNodeClick?.(skillId);
  };

  const getOrbScale = () => {
    if (reducedMotion) return isFocused ? 1.05 : 1;
    
    switch (currentVariant) {
      case "Hover":
        return 1.06;
      case "Grow":
        return 1.22;
      case "Pulse":
        return 1;
      default:
        return 1;
    }
  };

  const getOrbClasses = () => {
    const baseClasses = `
      relative rounded-full transition-all duration-300 ease-out
      ${theme === "Dark" 
        ? "bg-gradient-to-br from-blue-600 to-purple-600" 
        : "bg-gradient-to-br from-blue-500 to-blue-600"
      }
      ${!reducedMotion && currentVariant === "Idle" ? "animate-brain-glow" : ""}
      ${!reducedMotion && currentVariant === "Pulse" ? "animate-pulse" : ""}
      ${isFocused ? "ring-4 ring-blue-300 ring-opacity-50" : ""}
    `;
    
    return baseClasses;
  };

  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: orbSize.width * 1.8, height: orbSize.height * 1.8 }}
    >
      {/* Main Brain Orb */}
      <motion.div
        ref={orbRef}
        role="button"
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-expanded={showSkillNodes}
        aria-describedby={showSkillNodes ? "skill-nodes-description" : undefined}
        className={`${getOrbClasses()} cursor-pointer focus:outline-none`}
        style={{
          width: orbSize.width,
          height: orbSize.height,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: getOrbScale(),
          rotate: reducedMotion ? 0 : (currentVariant === "Grow" ? 5 : 0)
        }}
        transition={{ 
          duration: reducedMotion ? 0.2 : 0.3, 
          ease: "easeOut" 
        }}
        onClick={handleOrbClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        whileHover={!reducedMotion ? { scale: getOrbScale() * 1.02 } : {}}
        whileTap={!reducedMotion ? { scale: getOrbScale() * 0.98 } : {}}
      >
        {/* Brain Icon - hidden when showing start button */}
        {!showStartButton && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain 
              className={`text-white ${
                size === "S" ? "w-12 h-12" : 
                size === "M" ? "w-16 h-16" : 
                "w-20 h-20"
              }`} 
              aria-hidden="true"
            />
          </div>
        )}

        {/* Start Assessment Button - appears in center when showStartButton is true */}
        {showStartButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onStartAssessment?.();
              }}
              className="bg-white/95 hover:bg-white text-primary hover:text-primary/90 px-4 py-2 rounded-full shadow-lg hover:shadow-xl font-semibold text-sm transition-all duration-200 backdrop-blur-sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {t("landing.start.discovery")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Synapse Particles - Only if not reduced motion and not in Grow state */}
        {!reducedMotion && currentVariant !== "Grow" && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/80 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transformOrigin: `${orbSize.width / 2}px 0px`,
                }}
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5
                }}
                aria-hidden="true"
              />
            ))}
          </>
        )}

        {/* Glow Effect */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            theme === "Dark" 
              ? "shadow-[0_0_40px_rgba(18,194,255,0.4)]" 
              : "shadow-[0_0_40px_rgba(31,185,255,0.3)]"
          } ${isFocused ? "shadow-[0_0_60px_rgba(31,185,255,0.5)]" : ""}`}
          aria-hidden="true"
        />
      </motion.div>

      {/* Hidden description for screen readers */}
      {showSkillNodes && (
        <div id="skill-nodes-description" className="sr-only">
          Brain has expanded to reveal 8 skill areas: {skillNodes.map(node => node.label).join(", ")}. 
          These represent your core competencies that can be explored.
        </div>
      )}

      {/* Skill Nodes */}
      <AnimatePresence>
        {showSkillNodes && (
          <>
            {skillNodes.map((node, index) => {
              const Icon = node.icon;
              const isBursting = burstNodes.includes(node.id);
              
              return (
                <motion.div
                  key={node.id}
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) translate(${node.position.x * orbSize.scale}px, ${node.position.y * orbSize.scale}px)`,
                  }}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: 0,
                    y: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  transition={{ 
                    duration: reducedMotion ? 0.2 : 0.4, 
                    delay: reducedMotion ? 0 : index * 0.1,
                    ease: "backOut"
                  }}
                >
                  <motion.button
                    className="relative w-12 h-12 rounded-full shadow-lg cursor-pointer transition-all duration-200 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 flex items-center justify-center"
                    style={{ backgroundColor: node.color }}
                    onClick={() => handleSkillNodeClick(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSkillNodeClick(node.id);
                      }
                    }}
                    aria-label={`${node.label} skill node`}
                    whileHover={!reducedMotion ? { 
                      scale: 1.1,
                      y: -2
                    } : {}}
                    whileTap={!reducedMotion ? { scale: 0.95 } : {}}
                  >
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    
                    {/* Burst Effect */}
                    {isBursting && !reducedMotion && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        aria-hidden="true"
                      />
                    )}
                  </motion.button>
                  
                  {/* Skill Label Tooltip */}
                  <motion.div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 rounded-md shadow-md text-xs font-medium whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none ${
                      theme === "Dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                    }`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 0, y: 0 }}
                    whileHover={{ opacity: 1 }}
                    role="tooltip"
                  >
                    {node.label}
                  </motion.div>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Connection Lines (when nodes are visible) */}
      {showSkillNodes && !reducedMotion && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
          aria-hidden="true"
        >
          {skillNodes.map((node, index) => (
            <motion.line
              key={`line-${node.id}`}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${node.position.x * orbSize.scale}px)`}
              y2={`calc(50% + ${node.position.y * orbSize.scale}px)`}
              stroke={node.color}
              strokeWidth="2"
              strokeOpacity="0.3"
              strokeDasharray="4,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

// Convenient wrapper components for common use cases
export function IdleBrainOrb(props: Omit<BrainOrbProps, "variant">) {
  return <BrainOrb {...props} variant="Idle" />;
}

export function GrowBrainOrb(props: Omit<BrainOrbProps, "variant">) {
  return <BrainOrb {...props} variant="Grow" />;
}

export function PulseBrainOrb(props: Omit<BrainOrbProps, "variant">) {
  return <BrainOrb {...props} variant="Pulse" />;
}