import { GlobalStats } from "@/lib/game/GlobalStats";
import { Card } from "./ui/card";

export const StatsDisplay = () => {
  const stats = GlobalStats.getStats();
  const globalKD = GlobalStats.getGlobalKD();
  const globalAccuracy = GlobalStats.getGlobalAccuracy();
  const avgScore = GlobalStats.getAverageScore();
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-primary">🎯 AI 教练系统</h3>
        <p className="text-sm text-muted-foreground">
          实时战术分析 • 个性化建议 • 行为预测
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-background/60 backdrop-blur-md border-primary/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            全局 K/D
          </div>
          <div className="text-2xl font-bold text-primary">
            {globalKD.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.kills} 击杀 / {stats.deaths} 死亡
          </div>
        </Card>
        
        <Card className="p-4 bg-background/60 backdrop-blur-md border-blue-500/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            平均精准度
          </div>
          <div className="text-2xl font-bold text-blue-500">
            {globalAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.totalHits} / {stats.totalShots} 命中
          </div>
        </Card>
        
        <Card className="p-4 bg-background/60 backdrop-blur-md border-yellow-500/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            最高分数
          </div>
          <div className="text-2xl font-bold text-yellow-500">
            {stats.bestScore}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            平均: {avgScore.toFixed(0)}
          </div>
        </Card>
        
        <Card className="p-4 bg-background/60 backdrop-blur-md border-green-500/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            游戏局数
          </div>
          <div className="text-2xl font-bold text-green-500">
            {stats.gamesPlayed}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            总得分: {stats.totalScore}
          </div>
        </Card>
      </div>
      
      <Card className="p-4 bg-primary/5 backdrop-blur-md border-primary/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🤖</div>
          <div className="flex-1 space-y-1">
            <div className="font-semibold text-sm">AI 教练功能</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 实时威胁分析和战术建议</li>
              <li>• 动态走位引导和攻击时机提示</li>
              <li>• 个性化训练和弱点诊断（按P键查看）</li>
              <li>• AI自动托管功能（按Q键开启）</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
