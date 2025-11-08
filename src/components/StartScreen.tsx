import { useState } from "react";
import { Button } from "./ui/button";
import { GameInstructions } from "./GameInstructions";
import { AICoachModal } from "./AICoachModal";
import { MatchHistory } from "./MatchHistory";
import { Brain, History } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const [showAICoach, setShowAICoach] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10 backdrop-blur-sm overflow-y-auto">
        <div className="text-center space-y-8 max-w-4xl px-8 py-12">
          <div className="space-y-4 animate-in fade-in duration-1000">
            <h2 className="text-4xl font-bold text-glow-blue">AI 进化竞技场</h2>
            <p className="text-muted-foreground text-base">
              Liquid Glass 玻璃态界面 • 智能战术系统 • 神经网络AI教练 • 动态难度进化
            </p>
          </div>
          
          <div className="space-y-3 text-left text-sm animate-in fade-in duration-1000 delay-200">
            <p className="text-muted-foreground">🎯 <strong>控制系统:</strong> 鼠标移动精准瞄准 • 点击战术射击 • A键AI辅助瞄准 • Q键完全AI托管</p>
            <p className="text-muted-foreground">🧠 <strong>AI特性:</strong> 智能预瞄系统 • 实时轨迹预测 • 战术协调算法 • 200倍难度上限</p>
            <p className="text-muted-foreground">📊 <strong>实时教练:</strong> 按P键启动AI战术分析面板 • 个性化战斗建议 • 弱点诊断系统</p>
            <p className="text-muted-foreground">🎮 <strong>游戏模式:</strong> 每波最多6个智能敌人 • 全部消灭后进入下一波 • 难度动态调整</p>
          </div>
          
          <div className="flex justify-center gap-4 animate-in fade-in duration-1000 delay-300">
            <GameInstructions />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in duration-1000 delay-400 w-full max-w-3xl mx-auto">
            <Button 
              size="lg" 
              className="liquid-glass text-lg px-8 py-6 border-primary/30 shadow-lg font-semibold flex-1 group"
              onClick={() => setShowAICoach(true)}
            >
              <Brain className="mr-2 h-5 w-5 animate-pulse group-hover:scale-110 transition-transform" />
              AI 战斗教练
            </Button>

            <Button 
              size="lg" 
              className="liquid-glass text-lg px-8 py-6 border-purple-500/30 shadow-lg font-semibold flex-1 group"
              onClick={() => setShowHistory(true)}
            >
              <History className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              战绩历史
            </Button>
            
            <Button 
              size="lg" 
              className="liquid-glass text-lg px-8 py-6 border-red-500/30 shadow-lg font-bold flex-1 group hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]"
              onClick={onStart}
            >
              <span className="group-hover:scale-110 inline-block transition-transform">🚀</span>
              <span className="ml-2">开始游戏</span>
            </Button>
          </div>
        </div>
      </div>
      
      <AICoachModal open={showAICoach} onClose={() => setShowAICoach(false)} />
      <MatchHistory visible={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
};
