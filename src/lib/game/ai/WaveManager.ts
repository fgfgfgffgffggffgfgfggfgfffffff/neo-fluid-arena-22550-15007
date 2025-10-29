import { Vector2D } from "../types";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";

/**
 * 波次管理器 - 限制敌人数量，管理刷新
 * 确保每波最多10个敌人，超过则清除多余的
 */
export class WaveManager {
  private maxEnemiesPerWave = 6;
  private currentWave = 1;
  private enemiesSpawned = 0;
  private waveInProgress = false;
  private spawnPoints: Vector2D[] = [];
  
  constructor(canvasWidth: number, canvasHeight: number) {
    // 初始化刷新点（8个方位）
    this.initializeSpawnPoints(canvasWidth, canvasHeight);
  }
  
  /**
   * 初始化刷新点
   */
  private initializeSpawnPoints(width: number, height: number): void {
    const margin = 50;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - margin;
    
    // 8个方向的刷新点
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.spawnPoints.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
  }
  
  /**
   * 开始新波次
   */
  public startWave(): void {
    this.waveInProgress = true;
    this.enemiesSpawned = 0;
  }
  
  /**
   * 结束波次
   */
  public endWave(): void {
    this.waveInProgress = false;
    this.currentWave++;
  }
  
  /**
   * 检查是否可以生成更多敌人
   */
  public canSpawnMore(
    currentEnemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): boolean {
    return currentEnemies.length < this.maxEnemiesPerWave;
  }
  
  /**
   * 限制敌人数量（清除多余的）
   */
  public enforceEnemyLimit(
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): (Enemy | EliteEnemy | AssassinEnemy)[] {
    if (enemies.length <= this.maxEnemiesPerWave) {
      return enemies;
    }
    
    // 保留距离玩家最近的10个敌人
    const sorted = [...enemies].sort((a, b) => {
      const distA = Math.sqrt(a.position.x ** 2 + a.position.y ** 2);
      const distB = Math.sqrt(b.position.x ** 2 + b.position.y ** 2);
      return distA - distB;
    });
    
    return sorted.slice(0, this.maxEnemiesPerWave);
  }
  
  /**
   * 获取最佳刷新点
   */
  public getBestSpawnPoint(
    playerPos: Vector2D,
    existingEnemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): Vector2D {
    // 找到距离玩家最远且周围敌人最少的刷新点
    let bestPoint = this.spawnPoints[0];
    let bestScore = -Infinity;
    
    for (const point of this.spawnPoints) {
      // 计算到玩家的距离（越远越好）
      const dx = point.x - playerPos.x;
      const dy = point.y - playerPos.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);
      
      // 计算周围敌人数量（越少越好）
      const nearbyEnemies = existingEnemies.filter(e => {
        const ex = e.position.x - point.x;
        const ey = e.position.y - point.y;
        return Math.sqrt(ex * ex + ey * ey) < 150;
      }).length;
      
      // 综合评分
      const score = distToPlayer - nearbyEnemies * 100;
      
      if (score > bestScore) {
        bestScore = score;
        bestPoint = point;
      }
    }
    
    return bestPoint;
  }
  
  /**
   * 计算波次难度系数
   */
  public getDifficultyMultiplier(): number {
    return 1 + (this.currentWave - 1) * 0.1; // 每波增加10%难度
  }
  
  /**
   * 获取当前波次应该生成的敌人数量
   */
  public getEnemiesForWave(): number {
    const baseEnemies = Math.min(3 + this.currentWave, this.maxEnemiesPerWave);
    return baseEnemies;
  }
  
  /**
   * 获取当前波次
   */
  public getCurrentWave(): number {
    return this.currentWave;
  }
  
  /**
   * 是否正在波次中
   */
  public isWaveInProgress(): boolean {
    return this.waveInProgress;
  }
  
  /**
   * 增加已生成敌人计数
   */
  public incrementSpawnCount(): void {
    this.enemiesSpawned++;
  }
  
  /**
   * 获取已生成敌人数量
   */
  public getSpawnedCount(): number {
    return this.enemiesSpawned;
  }
  
  /**
   * 重置管理器
   */
  public reset(): void {
    this.currentWave = 1;
    this.enemiesSpawned = 0;
    this.waveInProgress = false;
  }
}
