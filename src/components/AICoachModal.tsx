import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, Target, TrendingUp, AlertTriangle, Shield, Activity } from "lucide-react";
import { GlobalStats } from "@/lib/game/GlobalStats";

interface AICoachModalProps {
  open: boolean;
  onClose: () => void;
}

export const AICoachModal = ({ open, onClose }: AICoachModalProps) => {
  const stats = GlobalStats.getStats();
  const globalKD = GlobalStats.getGlobalKD();
  const globalAccuracy = GlobalStats.getGlobalAccuracy();
  const avgScore = GlobalStats.getAverageScore();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/98 backdrop-blur-md border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Brain className="h-7 w-7 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
              AI 战斗教练系统
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Global Stats */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                全局统计数据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                  <div className="text-xs text-muted-foreground mb-1">全局 K/D</div>
                  <div className="text-2xl font-bold text-green-400">{globalKD.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <div className="text-xs text-muted-foreground mb-1">平均精准度</div>
                  <div className="text-2xl font-bold text-blue-400">{globalAccuracy.toFixed(1)}%</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                  <div className="text-xs text-muted-foreground mb-1">最高分数</div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.bestScore}</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <div className="text-xs text-muted-foreground mb-1">游戏局数</div>
                  <div className="text-2xl font-bold text-purple-400">{stats.gamesPlayed}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Danger Analysis */}
          <Card className="border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                实时危险分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/20">
                <p className="text-sm text-foreground leading-relaxed">
                  • <strong>敌人包围检测:</strong> AI会实时监测周围敌人数量，当被3个以上敌人包围时会发出警告
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20">
                <p className="text-sm text-foreground leading-relaxed">
                  • <strong>生命值预警:</strong> 当生命值低于30%时，AI会建议更谨慎的游戏策略
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <p className="text-sm text-foreground leading-relaxed">
                  • <strong>威胁优先级:</strong> AI会根据敌人类型、距离和攻击模式，动态评估最危险的目标
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tactical Suggestions */}
          <Card className="border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-400" />
                战术建议系统
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
                <h4 className="font-semibold text-sm mb-2 text-blue-300">走位优化</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI会分析你的移动模式，建议最优的走位路线，避免被包围或陷入死角
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
                <h4 className="font-semibold text-sm mb-2 text-green-300">攻击时机</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  识别敌人攻击间隙和硬直期，提示最佳反击时机，提高输出效率
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20">
                <h4 className="font-semibold text-sm mb-2 text-purple-300">资源管理</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  根据当前局势，建议是否使用自动瞄准（A键）或AI托管（Q键）功能
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Training */}
          <Card className="border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                个性化训练与弱点诊断
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {globalAccuracy < 40 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20">
                  <h4 className="font-semibold text-sm mb-2 text-orange-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    精准度提升训练
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    你的全局精准度为 {globalAccuracy.toFixed(1)}%，低于平均水平。建议：
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• 使用自动瞄准（A键）熟悉敌人移动模式</li>
                    <li>• 预判敌人移动方向，提前瞄准</li>
                    <li>• 保持适当距离，避免近战混战</li>
                  </ul>
                </div>
              )}
              
              {globalKD < 1.0 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/5 border border-red-500/20">
                  <h4 className="font-semibold text-sm mb-2 text-red-300 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    生存能力强化
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    你的K/D比率为 {globalKD.toFixed(2)}，说明生存能力需要提升。建议：
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• 时刻观察周围环境，避免被包围</li>
                    <li>• 保持移动，不要长时间停留在一个位置</li>
                    <li>• 优先击杀近距离的高威胁敌人</li>
                    <li>• 使用AI托管（Q键）观察AI的走位策略</li>
                  </ul>
                </div>
              )}
              
              {globalAccuracy >= 50 && globalKD >= 2.0 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
                  <h4 className="font-semibold text-sm mb-2 text-green-300 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    高手进阶挑战
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    优秀！你的表现已经超越大多数玩家。进阶目标：
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• 挑战更高难度，AI会自动提升敌人强度</li>
                    <li>• 尝试不使用自动瞄准完成游戏</li>
                    <li>• 练习预判敌人团队战术，提前应对</li>
                  </ul>
                </div>
              )}
              
              {stats.gamesPlayed === 0 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
                  <h4 className="font-semibold text-sm mb-2 text-blue-300">新手引导</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    欢迎来到AI进化竞技场！开始第一局游戏后，AI教练会根据你的表现提供个性化建议。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In-game Coach Reminder */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              💡 <strong>提示:</strong> 游戏中按 <Badge variant="outline" className="mx-1 font-mono">P</Badge> 键打开局内AI教练，
              AI会每5秒自动分析你的操作并给出实时建议
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};