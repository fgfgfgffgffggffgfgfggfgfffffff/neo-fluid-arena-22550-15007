import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface PlayerStatsChartProps {
  kills: number;
  deaths: number;
  accuracy: number;
  score: number;
  wave: number;
}

export const PlayerStatsChart = ({ kills, deaths, accuracy, score, wave }: PlayerStatsChartProps) => {
  const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
  const accuracyPercent = Math.round(accuracy);

  return (
    <Card className="glass-effect border-border/50 p-6 space-y-4">
      <h3 className="text-xl font-bold gradient-text">📊 战斗数据统计</h3>
      
      <div className="space-y-4">
        {/* KD Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">K/D 比率</span>
            <span className="text-lg font-bold text-primary">{kdRatio}</span>
          </div>
          <Progress value={Math.min(100, parseFloat(kdRatio) * 20)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>击杀: {kills}</span>
            <span>死亡: {deaths}</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">命中率</span>
            <span className="text-lg font-bold text-accent">{accuracyPercent}%</span>
          </div>
          <Progress value={accuracyPercent} className="h-2" />
        </div>

        {/* Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">总分</span>
            <span className="text-lg font-bold text-secondary">{score}</span>
          </div>
          <Progress value={Math.min(100, score / 50)} className="h-2" />
        </div>

        {/* Wave Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">当前波次</span>
            <span className="text-lg font-bold text-foreground">第 {wave} 波</span>
          </div>
          <Progress value={(wave % 10) * 10} className="h-2" />
        </div>
      </div>

      {/* Performance Rating */}
      <div className="pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">战斗评级</p>
          <p className="text-2xl font-bold">
            {parseFloat(kdRatio) >= 3 && accuracyPercent >= 70 ? (
              <span className="text-primary">🏆 精英</span>
            ) : parseFloat(kdRatio) >= 2 && accuracyPercent >= 50 ? (
              <span className="text-accent">⭐ 优秀</span>
            ) : parseFloat(kdRatio) >= 1 && accuracyPercent >= 30 ? (
              <span className="text-secondary">✓ 良好</span>
            ) : (
              <span className="text-muted-foreground">💪 继续努力</span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
};
