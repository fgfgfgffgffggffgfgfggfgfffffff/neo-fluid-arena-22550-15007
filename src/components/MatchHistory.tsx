import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { History, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface MatchEntry {
  id: string;
  player_name: string;
  score: number;
  kills: number;
  deaths?: number;
  waves: number;
  accuracy: number;
  kd_ratio?: number;
  playstyle?: string;
  game_duration?: number;
  created_at: string;
}

interface MatchHistoryProps {
  visible: boolean;
  onClose: () => void;
}

export const MatchHistory = ({ visible, onClose }: MatchHistoryProps) => {
  const [entries, setEntries] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchMatchHistory();
    }
  }, [visible]);

  const fetchMatchHistory = async () => {
    setLoading(true);
    try {
      // 尝试从match_history表获取数据，如果失败则使用空数组
      const { data } = await supabase
        .from("match_history" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setEntries((data as any) || []);
    } catch (error) {
      console.error("获取战绩历史失败:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <Card className="liquid-glass border-2 border-primary/30 p-6 max-w-4xl w-full mx-4 animate-scale-in max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold gradient-text">战绩历史记录</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="liquid-glass hover:bg-primary/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">暂无战绩记录</div>
        ) : (
          <ScrollArea className="h-[calc(85vh-120px)]">
            <div className="space-y-3 pr-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="liquid-glass p-4 rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-primary">{entry.player_name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">分数: </span>
                          <span className="text-primary font-bold">{entry.score}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">K/D: </span>
                          <span className={(entry.kd_ratio || 0) >= 2 ? "text-green-400 font-bold" : "text-foreground"}>
                            {(entry.kd_ratio || 0).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">击杀: </span>
                          <span className="text-foreground">{entry.kills}/{entry.deaths || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">波次: </span>
                          <span className="text-foreground">{entry.waves}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">命中: </span>
                          <span className={entry.accuracy >= 50 ? "text-blue-400" : "text-foreground"}>
                            {(entry.accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">时长: </span>
                          <span className="text-foreground">{formatDuration(entry.game_duration)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">风格: </span>
                          <span className="text-purple-400">{entry.playstyle || '未知'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
};
