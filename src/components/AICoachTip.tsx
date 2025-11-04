import { useEffect, useState } from "react";
import { Brain, AlertTriangle, TrendingUp, Shield, Target } from "lucide-react";

interface AICoachTipProps {
  message: string;
  type: "positive" | "warning" | "info" | "critical";
  onDismiss: () => void;
}

export const AICoachTip = ({ message, type, onDismiss }: AICoachTipProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setVisible(true), 50);
    
    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getTypeStyles = () => {
    switch (type) {
      case "positive":
        return {
          border: "border-green-500/30",
          bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/10",
          icon: <TrendingUp className="h-4 w-4 text-green-400" />,
          glow: "shadow-green-500/20"
        };
      case "warning":
        return {
          border: "border-yellow-500/30",
          bg: "bg-gradient-to-r from-yellow-500/20 to-orange-500/10",
          icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
          glow: "shadow-yellow-500/20"
        };
      case "critical":
        return {
          border: "border-red-500/30",
          bg: "bg-gradient-to-r from-red-500/20 to-pink-500/10",
          icon: <Shield className="h-4 w-4 text-red-400" />,
          glow: "shadow-red-500/20"
        };
      default:
        return {
          border: "border-blue-500/30",
          bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/10",
          icon: <Target className="h-4 w-4 text-blue-400" />,
          glow: "shadow-blue-500/20"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
      style={{ maxWidth: "500px", width: "90%" }}
    >
      <div
        className={`backdrop-blur-md ${styles.bg} ${styles.border} border rounded-2xl p-4 shadow-2xl ${styles.glow}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {styles.icon}
              <span className="text-xs font-semibold text-foreground/80">AI 教练提示</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};