import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";

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
}

export const AIAnalysisPanel = ({
  visible,
  onClose,
  performanceReport,
  behaviorReport
}: AIAnalysisPanelProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
      <Card className="glass-effect rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--primary))" }}>
              🤖 AI 分析报告
            </h2>
            <p className="text-sm text-muted-foreground">
              基于机器学习的游戏表现分析
            </p>
          </div>

          {/* Performance Stats */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold" style={{ color: "hsl(var(--player-blue))" }}>
              📊 战斗统计
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-effect rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">击杀数</div>
                <div className="text-2xl font-bold text-green-500">{performanceReport.kills}</div>
              </div>
              <div className="glass-effect rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">死亡数</div>
                <div className="text-2xl font-bold text-red-500">{performanceReport.deaths}</div>
              </div>
              <div className="glass-effect rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">K/D 比率</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                  {performanceReport.kdRatio}
                </div>
              </div>
              <div className="glass-effect rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">命中率</div>
                <div className="text-2xl font-bold text-blue-400">
                  {behaviorReport.accuracy}%
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Analysis */}
          <div className="glass-effect rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">当前难度</span>
              <span className="text-lg font-bold" style={{ color: "hsl(var(--primary))" }}>
                {performanceReport.difficulty}x
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (performanceReport.difficulty / 3) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {performanceReport.suggestion}
            </p>
          </div>

          {/* Behavior Analysis */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold" style={{ color: "hsl(var(--player-blue))" }}>
              🎮 行为分析
            </h3>
            <div className="glass-effect rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">游戏风格</div>
              <div className="text-lg font-bold text-purple-400">
                {behaviorReport.playstyle}
              </div>
            </div>
            
            {behaviorReport.recommendations.length > 0 && (
              <div className="glass-effect rounded-xl p-4">
                <div className="text-sm font-medium mb-2">💡 AI 建议</div>
                <ul className="space-y-2">
                  {behaviorReport.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl neon-glow-blue"
          >
            关闭报告
          </Button>
        </div>
      </Card>
    </div>
  );
};
