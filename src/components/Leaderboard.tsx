import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Trophy, X } from "lucide-react";
import { Button } from "./ui/button";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  kills: number;
  waves: number;
  accuracy: number;
  created_at: string;
}

interface LeaderboardProps {
  visible: boolean;
  onClose: () => void;
}

export const Leaderboard = ({ visible, onClose }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchLeaderboard();
    }
  }, [visible]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("获取排行榜失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <Card className="glassmorphism border-2 border-primary/30 p-6 max-w-2xl w-full mx-4 animate-scale-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary animate-bounce-subtle" />
            <h2 className="text-3xl font-bold gradient-text">全域排行榜</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">暂无记录</div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`
                  glassmorphism p-4 rounded-lg border transition-all duration-300 hover:scale-102 hover:border-primary/50
                  ${index === 0 ? 'border-yellow-500/50 shadow-glow' : 
                    index === 1 ? 'border-gray-400/50' : 
                    index === 2 ? 'border-orange-600/50' : 
                    'border-primary/20'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    text-2xl font-bold w-8 text-center
                    ${index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-600' : 
                      'text-muted-foreground'}
                  `}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{entry.player_name}</div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>分数: <span className="text-primary font-bold">{entry.score}</span></span>
                      <span>击杀: {entry.kills}</span>
                      <span>波次: {entry.waves}</span>
                      <span>命中率: {(entry.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
