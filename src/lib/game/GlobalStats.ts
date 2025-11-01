/**
 * 全局统计系统 - 跨局数据追踪
 */
export interface SessionStats {
  kills: number;
  deaths: number;
  totalShots: number;
  totalHits: number;
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
}

export class GlobalStats {
  private static STORAGE_KEY = 'ai-arena-global-stats';
  
  /**
   * 获取全局统计数据
   */
  public static getStats(): SessionStats {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getDefaultStats();
      }
    }
    return this.getDefaultStats();
  }
  
  /**
   * 保存游戏会话数据
   */
  public static saveGameSession(sessionData: {
    kills: number;
    deaths: number;
    shots: number;
    hits: number;
    score: number;
  }): void {
    const stats = this.getStats();
    
    stats.kills += sessionData.kills;
    stats.deaths += sessionData.deaths;
    stats.totalShots += sessionData.shots;
    stats.totalHits += sessionData.hits;
    stats.gamesPlayed += 1;
    stats.totalScore += sessionData.score;
    stats.bestScore = Math.max(stats.bestScore, sessionData.score);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }
  
  /**
   * 获取全局KD比率（基于死亡局数）
   */
  public static getGlobalKD(): number {
    const stats = this.getStats();
    return stats.deaths === 0 ? stats.kills : stats.kills / stats.deaths;
  }
  
  /**
   * 获取全局平均精准度
   */
  public static getGlobalAccuracy(): number {
    const stats = this.getStats();
    return stats.totalShots === 0 ? 0 : (stats.totalHits / stats.totalShots) * 100;
  }
  
  /**
   * 获取平均得分
   */
  public static getAverageScore(): number {
    const stats = this.getStats();
    return stats.gamesPlayed === 0 ? 0 : stats.totalScore / stats.gamesPlayed;
  }
  
  /**
   * 重置统计数据
   */
  public static reset(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.getDefaultStats()));
  }
  
  private static getDefaultStats(): SessionStats {
    return {
      kills: 0,
      deaths: 0,
      totalShots: 0,
      totalHits: 0,
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0
    };
  }
}
