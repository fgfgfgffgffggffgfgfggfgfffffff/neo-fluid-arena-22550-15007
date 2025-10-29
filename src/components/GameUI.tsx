import { Button } from "./ui/button";

interface GameUIProps {
  score: number;
  enemiesDestroyed: number;
  gameOver: boolean;
  onRestart: () => void;
  autoAimMode: boolean;
  aiAutoPilot?: boolean;
  defenderSlowPercent: number;
  highScore: number;
  playerHealth: number;
}

export const GameUI = ({ 
  score, 
  enemiesDestroyed, 
  gameOver, 
  onRestart, 
  autoAimMode,
  aiAutoPilot = false,
  defenderSlowPercent,
  highScore,
  playerHealth,
}: GameUIProps) => {
  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="space-y-3">
          <div className="glass-effect rounded-2xl px-6 py-4 space-y-1">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">分数</div>
            <div className="text-3xl font-bold text-glow-blue" style={{ color: "hsl(var(--player-blue))" }}>
              {score}
            </div>
            <div className="text-xs text-muted-foreground">
              最高: {highScore}
            </div>
          </div>
        </div>
        
        {/* Center HUD - Abilities and Status */}
        <div className="space-y-2">
          
          {/* AI Auto-pilot Status */}
          <div className={`glass-effect rounded-2xl px-8 py-3 min-w-[220px] ${aiAutoPilot ? 'border border-green-500/50' : ''}`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider text-center mb-1">
              AI完全托管 (按Q切换)
            </div>
            <div className="text-sm text-center font-mono" style={{ 
              color: aiAutoPilot ? "hsl(142, 76%, 36%)" : "hsl(var(--muted-foreground))"
            }}>
              {aiAutoPilot ? "🤖 开启 (AI控制移动)" : "❌ 关闭"}
            </div>
          </div>
          
          {/* Auto-Aim Status */}
          <div className={`glass-effect rounded-2xl px-8 py-3 min-w-[220px] ${autoAimMode ? 'border border-primary/50' : ''}`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider text-center mb-1">
              自动瞄准 (按A切换)
            </div>
            <div className="text-sm text-center font-mono" style={{ 
              color: autoAimMode ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
            }}>
              {autoAimMode ? "🎯 开启 (20%伤害)" : "❌ 关闭"}
            </div>
          </div>
          
          {/* Defender Slow */}
          {defenderSlowPercent > 0 && (
            <div className="glass-effect rounded-2xl px-8 py-3 min-w-[220px] border border-yellow-500/50">
              <div className="text-xs text-yellow-500 uppercase tracking-wider text-center mb-1">
                防御者牵制
              </div>
              <div className="text-sm text-center font-mono text-yellow-500">
                🛡️ 减速 {defenderSlowPercent.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
        
        <div className="glass-effect rounded-2xl px-6 py-4 space-y-1">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">Eliminated</div>
          <div className="text-3xl font-bold text-glow-red" style={{ color: "hsl(var(--accent))" }}>
            {enemiesDestroyed}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!gameOver && score === 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-effect rounded-2xl px-8 py-4 pointer-events-none">
          <p className="text-sm text-foreground/80 text-center">
            <span className="text-glow-blue font-semibold" style={{ color: "hsl(var(--player-blue))" }}>
              移动鼠标
            </span>
            {" "}进行瞄准 • {" "}
            <span className="text-glow-blue font-semibold" style={{ color: "hsl(var(--player-blue))" }}>
              点击
            </span>
            {" "}进行射击
          </p>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm pointer-events-auto">
          <div className="glass-effect rounded-3xl p-12 space-y-6 text-center max-w-md">
            <h2 className="text-5xl font-bold text-glow-red" style={{ color: "hsl(var(--accent))" }}>
              游戏结束
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  最终得分
                </div>
                <div className="text-4xl font-bold text-glow-blue" style={{ color: "hsl(var(--player-blue))" }}>
                  {score}
                </div>
              </div>
              {score === highScore && score > 0 && (
                <div className="text-yellow-500 font-bold text-xl animate-pulse">
                  🏆 新纪录！🏆
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  最高分数
                </div>
                <div className="text-2xl font-bold text-yellow-500">
                  {highScore}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  消灭敌人
                </div>
                <div className="text-3xl font-bold" style={{ color: "hsl(var(--accent))" }}>
                  {enemiesDestroyed}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onRestart}
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6 rounded-xl neon-glow-blue transition-all"
              >
                再来一局
              </Button>
              <Button
                onClick={() => window.location.reload()}
                size="lg"
                variant="outline"
                className="flex-1 font-semibold text-lg py-6 rounded-xl transition-all"
              >
                返回主界面
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
