import { Vector2D } from "../types";

/**
 * Game Review System - 游戏复盘系统
 * 记录和分析游戏过程，提供改进建议
 */
export class GameReview {
  private gameEvents: Array<{
    timestamp: number;
    type: "kill" | "death" | "damage_taken" | "near_miss" | "perfect_dodge";
    position: Vector2D;
    details: string;
  }> = [];
  
  private criticalMoments: Array<{
    timestamp: number;
    situation: string;
    playerAction: string;
    result: "success" | "failure";
    lesson: string;
  }> = [];
  
  private startTime = Date.now();
  
  /**
   * 记录游戏事件
   */
  public recordEvent(
    type: "kill" | "death" | "damage_taken" | "near_miss" | "perfect_dodge",
    position: Vector2D,
    details: string
  ): void {
    this.gameEvents.push({
      timestamp: Date.now() - this.startTime,
      type,
      position,
      details
    });
    
    // 分析是否为关键时刻
    this.analyzeForCriticalMoment(type, position, details);
  }
  
  /**
   * 分析关键时刻
   */
  private analyzeForCriticalMoment(
    type: string,
    position: Vector2D,
    details: string
  ): void {
    const recentEvents = this.gameEvents.slice(-10);
    
    // 检测连续伤害（被围攻）
    const recentDamage = recentEvents.filter(e => 
      e.type === "damage_taken" && 
      (Date.now() - this.startTime - e.timestamp) < 3000
    ).length;
    
    if (recentDamage >= 3) {
      this.criticalMoments.push({
        timestamp: Date.now() - this.startTime,
        situation: "被多个敌人围攻",
        playerAction: type === "death" ? "未能脱身" : "尝试反击",
        result: type === "death" ? "failure" : "success",
        lesson: "当被围攻时，应优先寻找包围圈薄弱点撤退，而不是硬拼。"
      });
    }
    
    // 检测完美闪避后的反杀
    const recentDodge = recentEvents.find(e => e.type === "perfect_dodge");
    if (recentDodge && type === "kill" && 
        (Date.now() - this.startTime - recentDodge.timestamp) < 2000) {
      this.criticalMoments.push({
        timestamp: Date.now() - this.startTime,
        situation: "完美闪避后反击",
        playerAction: "闪避并立即反击",
        result: "success",
        lesson: "闪避后立即反击是最佳策略，把握好反击时机！"
      });
    }
    
    // 检测在危险位置停留导致的伤害
    if (type === "damage_taken") {
      const stationaryEvents = recentEvents.filter(e => {
        const dx = e.position.x - position.x;
        const dy = e.position.y - position.y;
        return Math.sqrt(dx ** 2 + dy ** 2) < 50;
      }).length;
      
      if (stationaryEvents >= 5) {
        this.criticalMoments.push({
          timestamp: Date.now() - this.startTime,
          situation: "长时间停留在同一位置",
          playerAction: "静止或小范围移动",
          result: "failure",
          lesson: "避免在同一位置停留过久，保持移动可以避免被集火。"
        });
      }
    }
  }
  
  /**
   * 生成游戏复盘报告
   */
  public generateReview(): {
    duration: number;
    totalKills: number;
    totalDeaths: number;
    criticalMoments: typeof this.criticalMoments;
    keyLessons: string[];
    overallPerformance: "excellent" | "good" | "average" | "needs_improvement";
    detailedAnalysis: string;
  } {
    const duration = Date.now() - this.startTime;
    const totalKills = this.gameEvents.filter(e => e.type === "kill").length;
    const totalDeaths = this.gameEvents.filter(e => e.type === "death").length;
    
    // 提取关键教训
    const keyLessons = Array.from(new Set(
      this.criticalMoments
        .filter(m => m.result === "failure")
        .map(m => m.lesson)
    )).slice(0, 5);
    
    // 评估整体表现
    let overallPerformance: "excellent" | "good" | "average" | "needs_improvement";
    const kdRatio = totalDeaths === 0 ? totalKills : totalKills / totalDeaths;
    
    if (kdRatio >= 5) {
      overallPerformance = "excellent";
    } else if (kdRatio >= 2) {
      overallPerformance = "good";
    } else if (kdRatio >= 0.8) {
      overallPerformance = "average";
    } else {
      overallPerformance = "needs_improvement";
    }
    
    // 生成详细分析
    let detailedAnalysis = this.generateDetailedAnalysis(totalKills, totalDeaths, duration);
    
    return {
      duration,
      totalKills,
      totalDeaths,
      criticalMoments: this.criticalMoments,
      keyLessons,
      overallPerformance,
      detailedAnalysis
    };
  }
  
  /**
   * 生成详细分析
   */
  private generateDetailedAnalysis(kills: number, deaths: number, duration: number): string {
    const durationMin = (duration / 1000 / 60).toFixed(1);
    const kdRatio = deaths === 0 ? kills : (kills / deaths).toFixed(2);
    
    let analysis = `游戏时长: ${durationMin}分钟\n`;
    analysis += `击杀: ${kills} | 死亡: ${deaths} | K/D: ${kdRatio}\n\n`;
    
    // 分析死亡原因
    const deathReasons = this.criticalMoments
      .filter(m => m.result === "failure")
      .map(m => m.situation);
    
    if (deathReasons.length > 0) {
      analysis += "主要失误:\n";
      const reasonCounts = new Map<string, number>();
      deathReasons.forEach(reason => {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      });
      
      reasonCounts.forEach((count, reason) => {
        analysis += `- ${reason} (${count}次)\n`;
      });
    }
    
    // 成功案例
    const successMoments = this.criticalMoments
      .filter(m => m.result === "success")
      .slice(-3);
    
    if (successMoments.length > 0) {
      analysis += "\n成功案例:\n";
      successMoments.forEach(moment => {
        analysis += `- ${moment.situation}: ${moment.playerAction}\n`;
      });
    }
    
    return analysis;
  }
  
  /**
   * 重置复盘数据
   */
  public reset(): void {
    this.gameEvents = [];
    this.criticalMoments = [];
    this.startTime = Date.now();
  }
  
  /**
   * 获取最近的关键时刻（用于实时提示）
   */
  public getRecentCriticalMoment(): typeof this.criticalMoments[0] | null {
    if (this.criticalMoments.length === 0) return null;
    const recent = this.criticalMoments[this.criticalMoments.length - 1];
    
    // 只返回最近5秒内的
    if ((Date.now() - this.startTime - recent.timestamp) < 5000) {
      return recent;
    }
    
    return null;
  }
}
