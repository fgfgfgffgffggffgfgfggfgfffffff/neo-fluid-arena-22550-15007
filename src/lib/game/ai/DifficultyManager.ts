import { Player } from "../entities/Player";

/**
 * Dynamic Difficulty Manager - 动态难度调整系统
 * 根据玩家表现实时调整游戏难度
 */
export class DifficultyManager {
  private playerPerformance: {
    kills: number;
    deaths: number;
    accuracy: number; // 射击命中率
    survivalTime: number;
    avgReactionTime: number;
    healthLost: number; // 战局内损失的生命值
    totalDamage: number; // 总伤害承受量
  } = {
    kills: 0,
    deaths: 0,
    accuracy: 0,
    survivalTime: 0,
    avgReactionTime: 0,
    healthLost: 0,
    totalDamage: 0
  };
  
  private performanceHistory: Array<{
    timestamp: number;
    kills: number;
    deaths: number;
    accuracy: number;
  }> = [];
  
  private currentDifficulty = 1.0; // 1.0 = normal
  private minDifficulty = 0.3;
  private maxDifficulty = 3.0;
  
  /**
   * 记录玩家击杀
   */
  public recordKill(): void {
    this.playerPerformance.kills++;
    this.updateDifficulty();
  }
  
  /**
   * 记录玩家死亡
   */
  public recordDeath(): void {
    this.playerPerformance.deaths++;
    this.performanceHistory.push({
      timestamp: Date.now(),
      kills: this.playerPerformance.kills,
      deaths: this.playerPerformance.deaths,
      accuracy: this.playerPerformance.accuracy
    });
    this.updateDifficulty();
  }
  
  /**
   * 更新射击准确率
   */
  public updateAccuracy(hits: number, total: number): void {
    if (total > 0) {
      this.playerPerformance.accuracy = hits / total;
      this.updateDifficulty();
    }
  }
  
  /**
   * 更新生存时间
   */
  public updateSurvivalTime(time: number): void {
    this.playerPerformance.survivalTime = time;
  }
  
  /**
   * 记录玩家受到伤害
   */
  public recordDamage(damage: number): void {
    this.playerPerformance.totalDamage += damage;
  }
  
  /**
   * 记录玩家生命值损失（用于战局KD计算）
   */
  public recordHealthLoss(healthLost: number): void {
    this.playerPerformance.healthLost += healthLost;
  }
  
  /**
   * 动态调整难度
   */
  private updateDifficulty(): void {
    const { kills, deaths, accuracy } = this.playerPerformance;
    
    // 计算战局内KD（基于生命值比例 + 击杀数）
    const sessionKD = this.getSessionKD();
    
    // 分析近期表现（最近5次）
    const recentPerformance = this.performanceHistory.slice(-5);
    let recentDeaths = 0;
    if (recentPerformance.length > 0) {
      recentDeaths = recentPerformance[recentPerformance.length - 1].deaths - 
                     (recentPerformance[0]?.deaths || 0);
    }
    
    // 难度调整逻辑
    let targetDifficulty = 1.0;
    
    // 玩家表现很好 -> 增加难度
    if (sessionKD > 3 && accuracy > 0.7) {
      targetDifficulty = 1.5;
    } else if (sessionKD > 5) {
      targetDifficulty = 2.0;
    } else if (sessionKD > 8) {
      targetDifficulty = 2.5;
    }
    
    // 玩家表现不好 -> 降低难度
    if (sessionKD < 0.5) {
      targetDifficulty = 0.7;
    } else if (recentDeaths >= 3) {
      targetDifficulty = 0.5;
    } else if (recentDeaths >= 5) {
      targetDifficulty = 0.3;
    }
    
    // 平滑过渡到目标难度
    const adjustSpeed = 0.1;
    this.currentDifficulty += (targetDifficulty - this.currentDifficulty) * adjustSpeed;
    this.currentDifficulty = Math.max(this.minDifficulty, Math.min(this.maxDifficulty, this.currentDifficulty));
  }
  
  /**
   * 获取战局内KD（基于生命值比例和击杀数）
   */
  public getSessionKD(): number {
    // 战局KD = 击杀数 / (死亡次数 + 生命值损失比例)
    const healthLossRatio = this.playerPerformance.healthLost / 100; // 假设最大生命100
    const effectiveDeaths = this.playerPerformance.deaths + healthLossRatio;
    return effectiveDeaths === 0 ? this.playerPerformance.kills : this.playerPerformance.kills / effectiveDeaths;
  }
  
  /**
   * 获取当前难度
   */
  public getDifficulty(): number {
    return this.currentDifficulty;
  }
  
  /**
   * 获取难度建议的敌人数量
   */
  public getRecommendedEnemyCount(baseCount: number): number {
    return Math.floor(baseCount * this.currentDifficulty);
  }
  
  /**
   * 获取难度建议的敌人速度倍率
   */
  public getSpeedMultiplier(): number {
    return 0.8 + (this.currentDifficulty * 0.4); // 0.8x to 2.0x
  }
  
  /**
   * 获取难度建议的敌人生命值倍率
   */
  public getHealthMultiplier(): number {
    return 0.7 + (this.currentDifficulty * 0.6); // 0.7x to 2.5x
  }
  
  /**
   * 获取玩家表现报告
   */
  public getPerformanceReport(): {
    kills: number;
    deaths: number;
    kdRatio: number;
    accuracy: number;
    difficulty: number;
    suggestion: string;
  } {
    const kdRatio = this.getSessionKD();
    
    let suggestion = "";
    
    if (this.currentDifficulty < 0.5) {
      suggestion = "难度已降低。建议练习走位和瞄准技巧。";
    } else if (this.currentDifficulty > 1.8) {
      suggestion = "难度很高！你的表现非常出色。";
    } else if (this.playerPerformance.accuracy < 0.5) {
      suggestion = "命中率偏低，建议使用自动瞄准辅助（按A键）。";
    } else {
      suggestion = "保持当前节奏，继续加油！";
    }
    
    return {
      kills: this.playerPerformance.kills,
      deaths: this.playerPerformance.deaths,
      kdRatio: parseFloat(kdRatio.toFixed(2)),
      accuracy: parseFloat((this.playerPerformance.accuracy * 100).toFixed(1)),
      difficulty: parseFloat(this.currentDifficulty.toFixed(2)),
      suggestion
    };
  }
  
  /**
   * 重置统计数据
   */
  public reset(): void {
    this.playerPerformance = {
      kills: 0,
      deaths: 0,
      accuracy: 0,
      survivalTime: 0,
      avgReactionTime: 0,
      healthLost: 0,
      totalDamage: 0
    };
    this.performanceHistory = [];
    this.currentDifficulty = 1.0;
  }
}
