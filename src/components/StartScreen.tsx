import { useState } from "react";
import { Button } from "./ui/button";
import { GameInstructions } from "./GameInstructions";
import { AICoachModal } from "./AICoachModal";
import { Brain } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const [showAICoach, setShowAICoach] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10 backdrop-blur-sm overflow-y-auto">
        <div className="text-center space-y-8 max-w-4xl px-8 py-12">
          <div className="space-y-4 animate-in fade-in duration-1000">
            <h2 className="text-3xl font-bold text-glow-blue">AI进化竞技场</h2>
            <p className="text-muted-foreground text-sm">
              智能战术系统 • 实时AI教练 • 动态难度调整
            </p>
          </div>
          
          <div className="space-y-3 text-left text-sm animate-in fade-in duration-1000 delay-200">
            <p className="text-muted-foreground">🎮 <strong>控制:</strong> 鼠标移动瞄准 • 点击射击 • A键自动瞄准 • Q键AI托管</p>
            <p className="text-muted-foreground">🌊 <strong>模式:</strong> 每波最多6个敌人，击败后进入下一波</p>
            <p className="text-muted-foreground">📊 <strong>AI教练:</strong> 按P键查看实时战术分析和个性化建议</p>
          </div>
          
          <div className="flex justify-center gap-4 animate-in fade-in duration-1000 delay-300">
            <GameInstructions />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in duration-1000 delay-400">
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary/20 to-purple-500/20 hover:from-primary/30 hover:to-purple-500/30 border-primary/30 shadow-lg hover:shadow-primary/30 transition-all duration-300 font-semibold"
              onClick={() => setShowAICoach(true)}
            >
              <Brain className="mr-2 h-5 w-5 animate-pulse" />
              AI教练功能
            </Button>
            
            <Button 
              size="lg" 
              className="text-2xl px-16 py-8 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 font-bold"
              onClick={onStart}
            >
              🚀 开始游戏
            </Button>
          </div>
        </div>
      </div>
      
      <AICoachModal open={showAICoach} onClose={() => setShowAICoach(false)} />
    </>
  );
};
