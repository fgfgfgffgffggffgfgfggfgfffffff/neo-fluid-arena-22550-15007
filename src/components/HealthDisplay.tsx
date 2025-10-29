import { Progress } from "./ui/progress";

interface HealthDisplayProps {
  health: number;
  maxHealth: number;
}

export const HealthDisplay = ({ health, maxHealth }: HealthDisplayProps) => {
  const healthPercent = (health / maxHealth) * 100;
  
  return (
    <div className="fixed bottom-6 left-6 glass-effect rounded-2xl px-6 py-4 min-w-[200px] pointer-events-none">
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm uppercase tracking-wider" style={{ color: "hsl(var(--player-blue))" }}>
            生命值
          </span>
          <span className="text-lg font-bold" style={{ color: "hsl(var(--player-blue))" }}>
            {healthPercent.toFixed(0)}%
          </span>
        </div>
        <Progress 
          value={healthPercent} 
          className="h-3"
        />
        <div className="text-xs text-center text-muted-foreground">
          {health} / {maxHealth}
        </div>
      </div>
    </div>
  );
};
