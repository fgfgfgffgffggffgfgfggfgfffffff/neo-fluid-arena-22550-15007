import { Button } from "./ui/button";
import { GameInstructions } from "./GameInstructions";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10 backdrop-blur-sm">
      <div className="text-center space-y-10 max-w-3xl px-8">
        <div className="space-y-6 animate-in fade-in duration-1000">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-glow-blue">AI进化竞技场</h2>
              <div className="space-y-2 text-left text-sm">
                <p className="text-muted-foreground">🌊 <strong>分波模式:</strong> 每波<strong>10个敌人</strong>，全部击败后<strong>等待2秒</strong>进入下一波</p>
                <p className="text-muted-foreground">🧭 <strong>更清晰:</strong> 取消玩家属性面板与空格键技能，专注移动与射击</p>
                <p className="text-muted-foreground">🎯 <strong>自动瞄准 (A键):</strong> 可选开启，适合快速上手</p>
                <p className="text-muted-foreground">📖 <strong>更多细节:</strong> 点击下方“游戏说明”查看完整AI规则</p>
              </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 animate-in fade-in duration-1000 delay-300">
          <GameInstructions />
        </div>
        
        <Button 
          size="lg" 
          className="text-2xl px-20 py-10 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 animate-in zoom-in duration-1000 delay-500 font-bold"
          onClick={onStart}
        >
          👊 开始游戏
        </Button>
      </div>
    </div>
  );
};
