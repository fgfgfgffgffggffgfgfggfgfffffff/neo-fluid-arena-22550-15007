import { Skill } from "@/lib/game/Skills";

interface SkillsDisplayProps {
  skills: Skill[];
  getCooldownPercent: (skillId: string) => number;
  getRemainingCooldown: (skillId: string) => number;
  onSkillClick: (skillId: string) => void;
}

export const SkillsDisplay = ({ skills, getCooldownPercent, getRemainingCooldown, onSkillClick }: SkillsDisplayProps) => {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-50">
      {skills.map((skill) => {
        const cooldownPercent = getCooldownPercent(skill.id);
        const isReady = cooldownPercent >= 100;
        const remainingSeconds = getRemainingCooldown(skill.id);

        return (
          <div
            key={skill.id}
            className="relative group"
            onClick={() => isReady && onSkillClick(skill.id)}
          >
            <div
              className={`
                relative w-16 h-16 rounded-xl glassmorphism border-2 
                flex items-center justify-center text-3xl cursor-pointer
                transition-all duration-300 hover:scale-110
                ${isReady 
                  ? 'border-primary/60 hover:border-primary hover:shadow-glow animate-pulse-glow' 
                  : 'border-muted/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <span className="relative z-10">{skill.icon}</span>
              
              {/* 冷却进度环 */}
              {!isReady && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - cooldownPercent / 100)}`}
                    className="transition-all duration-100"
                    style={{ opacity: 0.6 }}
                  />
                </svg>
              )}
              
              {/* 冷却时间显示 */}
              {!isReady && remainingSeconds > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {remainingSeconds}s
                  </span>
                </div>
              )}
            </div>

            {/* 技能名称提示 */}
            <div className="absolute left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="glassmorphism px-3 py-1.5 rounded-lg border border-primary/30 whitespace-nowrap">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
