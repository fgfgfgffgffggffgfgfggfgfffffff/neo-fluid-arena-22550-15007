import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface PlayerStatsProps {
  health: number;
  maxHealth: number;
  speed: number;
  baseSpeed: number;
  abilityCooldownPercent: number;
  defenderSlowPercent: number;
  autoAimMode: boolean;
  position: { x: number; y: number };
}

export const PlayerStats = ({
  health,
  maxHealth,
  speed,
  baseSpeed,
  abilityCooldownPercent,
  defenderSlowPercent,
  autoAimMode,
  position,
}: PlayerStatsProps) => {
  const healthPercent = (health / maxHealth) * 100;
  const speedPercent = (speed / baseSpeed) * 100;

  return (
    <Card className="fixed top-4 left-4 p-3 bg-background/80 backdrop-blur-sm border-primary/20 w-64">
      <div className="space-y-2 text-xs">
        {/* Health */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-primary font-mono">HP</span>
            <span className="text-primary/80 font-mono">{health}/{maxHealth}</span>
          </div>
          <Progress value={healthPercent} className="h-1.5" />
        </div>

        {/* Speed */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-blue-400 font-mono">SPEED</span>
            <span className="text-blue-400/80 font-mono">{speedPercent.toFixed(0)}%</span>
          </div>
          <Progress value={speedPercent} className="h-1.5" />
        </div>

        {/* Ability Cooldown */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-purple-400 font-mono">ABILITY</span>
            <span className="text-purple-400/80 font-mono">
              {abilityCooldownPercent > 0 ? `${(100 - abilityCooldownPercent).toFixed(0)}%` : "READY"}
            </span>
          </div>
          <Progress value={100 - abilityCooldownPercent} className="h-1.5" />
        </div>

        {/* Status */}
        <div className="flex gap-2 pt-1 flex-wrap">
          {autoAimMode && (
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px] font-mono border border-cyan-500/30">
              AUTO-AIM
            </span>
          )}
          {defenderSlowPercent > 0 && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-mono border border-yellow-500/30">
              SLOW {defenderSlowPercent}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
