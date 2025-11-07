import { X, Target, Activity, Brain, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { PlayerStatsChart } from "./PlayerStatsChart";

interface AIAnalysisPanelProps {
  visible: boolean;
  onClose: () => void;
  performanceReport: {
    kills: number;
    deaths: number;
    kdRatio: number;
    accuracy: number;
    difficulty: number;
    suggestion: string;
  };
  behaviorReport: {
    accuracy: number;
    movementPattern: string;
    playstyle: string;
    recommendations: string[];
  };
  kills: number;
  deaths: number;
  score: number;
  wave: number;
}

export const AIAnalysisPanel = ({
  visible,
  onClose,
  performanceReport,
  behaviorReport,
  kills,
  deaths,
  score,
  wave
}: AIAnalysisPanelProps) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 w-[420px] max-h-[90vh] overflow-y-auto transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      }`}
    >
      <Card className="bg-background/98 backdrop-blur-md border-primary/30 shadow-2xl">
        <CardHeader className="pb-3 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI 战斗教练 (按P打开)
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-primary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5 pt-4">
          {/* Stats Chart - 战斗数据可视化 */}
          <PlayerStatsChart
            kills={kills}
            deaths={deaths}
            accuracy={behaviorReport.accuracy}
            score={score}
            wave={wave}
          />
          {/* Performance Metrics - 不显示精准度和死亡次数 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">战绩统计</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">消灭敌人</div>
                <div className="text-2xl font-bold text-primary">{performanceReport.kills}</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">K/D 比率</div>
                <div className="text-2xl font-bold text-green-400">
                  {performanceReport.kdRatio.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Analysis */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-foreground">行为分析</h3>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  游戏风格
                </span>
                <Badge variant="outline" className="bg-purple-500/20 border-purple-500/30 text-purple-300">
                  {behaviorReport.playstyle}
                </Badge>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-foreground">AI 核心建议</h3>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20">
              <p className="text-sm text-foreground leading-relaxed">{performanceReport.suggestion}</p>
            </div>
          </div>

          {/* Recommendations */}
          {behaviorReport.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-semibold text-foreground">战术改进建议</h3>
              </div>
              <div className="space-y-2">
                {behaviorReport.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="text-sm p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 font-bold mt-0.5">•</span>
                      <span className="text-foreground flex-1">{rec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Enemy Strength Multiplier */}
          <div className="pt-2 border-t border-primary/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">敌人强度倍数</span>
              <Badge 
                variant="outline" 
                className={`font-mono ${
                  performanceReport.difficulty >= 50 ? 'border-red-500/50 text-red-400' :
                  performanceReport.difficulty >= 20 ? 'border-orange-500/50 text-orange-400' :
                  performanceReport.difficulty >= 5 ? 'border-yellow-500/50 text-yellow-400' :
                  'border-green-500/50 text-green-400'
                }`}
              >
                {performanceReport.difficulty.toFixed(1)}x
              </Badge>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground text-center">
              最高可达 100x
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
