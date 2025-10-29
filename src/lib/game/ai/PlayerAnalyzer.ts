import { Player } from "../entities/Player";
import { Vector2D } from "../types";

/**
 * Player Analyzer - 玩家行为分析系统
 * 分析玩家的游戏风格和行为模式
 */
export class PlayerAnalyzer {
  private movementHistory: Vector2D[] = [];
  private maxHistoryLength = 300;
  
  private behaviorStats = {
    avgMovementSpeed: 0,
    movementPattern: "balanced" as "aggressive" | "defensive" | "balanced" | "evasive",
    preferredDistance: 0, // 玩家喜欢的战斗距离
    retreatFrequency: 0, // 撤退频率
    circlingTendency: 0, // 绕圈倾向
    campingTendency: 0, // 蹲守倾向
  };
  
  private shotsFired = 0;
  private shotsHit = 0;
  private lastAnalysisTime = Date.now();
  
  /**
   * 记录玩家位置
   */
  public recordPosition(position: Vector2D): void {
    this.movementHistory.unshift({ ...position });
    if (this.movementHistory.length > this.maxHistoryLength) {
      this.movementHistory.pop();
    }
  }
  
  /**
   * 记录射击
   */
  public recordShot(hit: boolean): void {
    this.shotsFired++;
    if (hit) {
      this.shotsHit++;
    }
  }
  
  /**
   * 分析玩家行为模式
   */
  public analyze(): void {
    if (this.movementHistory.length < 50) return;
    
    // 计算平均移动速度
    let totalSpeed = 0;
    for (let i = 0; i < this.movementHistory.length - 1; i++) {
      const dx = this.movementHistory[i].x - this.movementHistory[i + 1].x;
      const dy = this.movementHistory[i].y - this.movementHistory[i + 1].y;
      const speed = Math.sqrt(dx ** 2 + dy ** 2);
      totalSpeed += speed;
    }
    this.behaviorStats.avgMovementSpeed = totalSpeed / (this.movementHistory.length - 1);
    
    // 分析移动模式
    this.analyzeMovementPattern();
    
    // 分析战斗距离偏好
    this.analyzePreferredDistance();
    
    // 分析绕圈和蹲守倾向
    this.analyzeMovementTendencies();
    
    this.lastAnalysisTime = Date.now();
  }
  
  /**
   * 分析移动模式
   */
  private analyzeMovementPattern(): void {
    const speed = this.behaviorStats.avgMovementSpeed;
    const camping = this.behaviorStats.campingTendency;
    
    if (camping > 0.7) {
      this.behaviorStats.movementPattern = "defensive";
    } else if (speed > 2 && this.behaviorStats.circlingTendency > 0.5) {
      this.behaviorStats.movementPattern = "evasive";
    } else if (speed > 3) {
      this.behaviorStats.movementPattern = "aggressive";
    } else {
      this.behaviorStats.movementPattern = "balanced";
    }
  }
  
  /**
   * 分析战斗距离偏好
   */
  private analyzePreferredDistance(): void {
    // 假设玩家在屏幕中心附近战斗
    // 分析玩家相对于屏幕中心的平均距离
    const centerX = 800; // 假设宽度
    const centerY = 600; // 假设高度
    
    let totalDistance = 0;
    this.movementHistory.forEach(pos => {
      const dx = pos.x - centerX;
      const dy = pos.y - centerY;
      totalDistance += Math.sqrt(dx ** 2 + dy ** 2);
    });
    
    this.behaviorStats.preferredDistance = totalDistance / this.movementHistory.length;
  }
  
  /**
   * 分析移动倾向
   */
  private analyzeMovementTendencies(): void {
    if (this.movementHistory.length < 100) return;
    
    // 分析绕圈倾向（检查是否有循环运动）
    const recentMoves = this.movementHistory.slice(0, 100);
    let circularScore = 0;
    
    // 简化的圆周运动检测
    const centerX = recentMoves.reduce((sum, p) => sum + p.x, 0) / recentMoves.length;
    const centerY = recentMoves.reduce((sum, p) => sum + p.y, 0) / recentMoves.length;
    
    const radii = recentMoves.map(p => 
      Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
    );
    const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
    const radiusVariance = radii.reduce((sum, r) => sum + Math.abs(r - avgRadius), 0) / radii.length;
    
    if (radiusVariance < avgRadius * 0.3) {
      circularScore = 0.8;
    }
    
    this.behaviorStats.circlingTendency = circularScore;
    
    // 分析蹲守倾向（长时间待在小范围内）
    const maxDistance = Math.max(...recentMoves.map((p, i) => {
      if (i === 0) return 0;
      const dx = p.x - recentMoves[0].x;
      const dy = p.y - recentMoves[0].y;
      return Math.sqrt(dx ** 2 + dy ** 2);
    }));
    
    this.behaviorStats.campingTendency = maxDistance < 100 ? 0.9 : 
                                         maxDistance < 200 ? 0.5 : 0.1;
  }
  
  /**
   * 获取玩家行为报告
   */
  public getBehaviorReport(): {
    accuracy: number;
    movementPattern: string;
    playstyle: string;
    recommendations: string[];
  } {
    const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) * 100 : 0;
    
    const recommendations: string[] = [];
    
    // 根据行为模式给出建议
    if (this.behaviorStats.movementPattern === "defensive" && this.behaviorStats.campingTendency > 0.7) {
      recommendations.push("你倾向于防守，但长时间蹲守会被包围。建议适当移动。");
    }
    
    if (accuracy < 40) {
      recommendations.push("命中率较低，建议开启自动瞄准（按A键）或练习跟踪移动目标。");
    }
    
    if (this.behaviorStats.movementPattern === "aggressive" && accuracy > 60) {
      recommendations.push("激进且准确的打法！继续保持这种节奏。");
    }
    
    if (this.behaviorStats.circlingTendency > 0.6) {
      recommendations.push("你喜欢绕圈战斗，这是很好的策略。注意不要陷入敌人包围。");
    }
    
    let playstyle = "";
    switch (this.behaviorStats.movementPattern) {
      case "aggressive":
        playstyle = "激进型 - 主动出击";
        break;
      case "defensive":
        playstyle = "防守型 - 稳扎稳打";
        break;
      case "evasive":
        playstyle = "闪避型 - 灵活走位";
        break;
      default:
        playstyle = "平衡型 - 攻守兼备";
    }
    
    return {
      accuracy: parseFloat(accuracy.toFixed(1)),
      movementPattern: this.behaviorStats.movementPattern,
      playstyle,
      recommendations
    };
  }
  
  /**
   * 重置分析数据
   */
  public reset(): void {
    this.movementHistory = [];
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.behaviorStats = {
      avgMovementSpeed: 0,
      movementPattern: "balanced",
      preferredDistance: 0,
      retreatFrequency: 0,
      circlingTendency: 0,
      campingTendency: 0,
    };
  }
}
