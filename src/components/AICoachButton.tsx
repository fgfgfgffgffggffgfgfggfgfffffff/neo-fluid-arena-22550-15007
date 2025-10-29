import { Button } from "./ui/button";
import { Brain } from "lucide-react";

interface AICoachButtonProps {
  onClick: () => void;
}

export const AICoachButton = ({ onClick }: AICoachButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 pointer-events-auto">
      <Button
        onClick={onClick}
        className="glass-effect rounded-full p-4 w-16 h-16 flex items-center justify-center border-2 border-primary/50 hover:border-primary transition-all neon-glow-blue"
        title="查看AI分析报告"
      >
        <Brain className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
      </Button>
    </div>
  );
};
