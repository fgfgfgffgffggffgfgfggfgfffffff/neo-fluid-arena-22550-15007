import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";
import { PlayerAssistantAI } from "./PlayerAssistantAI";
import { EnemyTacticalAI } from "./EnemyTacticalAI";
import { MovementOptimizer } from "./MovementOptimizer";
import { WaveManager } from "./WaveManager";
import { Vector2D } from "../types";

/**
 * 战斗协调器 - 管理辅助AI和敌人协作
 * 协调所有AI系统，确保战斗流畅且具有策略性
 */
export class CombatCoordinator {
  private assistantAI: PlayerAssistantAI;
  private enemyAI: EnemyTacticalAI;
  private movementOptimizer: MovementOptimizer;
  private waveManager: WaveManager;
  
  private playerShooting = false;
  private playerReloading = false;
  private lastShootTime = 0;
  
  constructor(canvasWidth: number, canvasHeight: number) {
    this.assistantAI = new PlayerAssistantAI();
    this.enemyAI = new EnemyTacticalAI();
    this.movementOptimizer = new MovementOptimizer();
    this.waveManager = new WaveManager(canvasWidth, canvasHeight);
  }
  
  /**
   * 更新战斗状态
   */
  public update(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    deltaTime: number
  ): CombatState {
    const now = Date.now();
    
    // 检测玩家射击状态
    if (now - this.lastShootTime < 200) {
      this.playerShooting = true;
    } else {
      this.playerShooting = false;
    }
    
    // 更新辅助AI
    const assistantState = this.assistantAI.update(
      player,
      enemies,
      deltaTime,
      this.playerShooting
    );
    
    // 更新敌人战术AI
    const enemyState = this.enemyAI.update(player, enemies, deltaTime);
    
    // 限制敌人数量
    const limitedEnemies = this.waveManager.enforceEnemyLimit(enemies);
    
    // 应用移动优化到每个敌人
    const optimizedMovements = new Map<string, Vector2D>();
    for (const enemy of limitedEnemies) {
      const tactic = enemyState.tactics.get(enemy.id);
      if (tactic) {
        const smoothPos = this.movementOptimizer.smoothMove(
          enemy.id,
          enemy.position,
          tactic.target,
          tactic.speedMultiplier * 100,
          deltaTime
        );
        optimizedMovements.set(enemy.id, smoothPos);
      }
    }
    
    return {
      assistant: assistantState,
      enemy: enemyState,
      movements: optimizedMovements,
      waveInfo: {
        currentWave: this.waveManager.getCurrentWave(),
        enemyLimit: 10,
        currentCount: limitedEnemies.length
      }
    };
  }
  
  /**
   * 记录玩家射击
   */
  public recordPlayerShoot(): void {
    this.lastShootTime = Date.now();
    this.playerShooting = true;
  }
  
  /**
   * 设置玩家换弹状态
   */
  public setPlayerReloading(reloading: boolean): void {
    this.playerReloading = reloading;
  }
  
  /**
   * 获取辅助AI
   */
  public getAssistantAI(): PlayerAssistantAI {
    return this.assistantAI;
  }
  
  /**
   * 获取敌人战术AI
   */
  public getEnemyAI(): EnemyTacticalAI {
    return this.enemyAI;
  }
  
  /**
   * 获取移动优化器
   */
  public getMovementOptimizer(): MovementOptimizer {
    return this.movementOptimizer;
  }
  
  /**
   * 获取波次管理器
   */
  public getWaveManager(): WaveManager {
    return this.waveManager;
  }
  
  /**
   * 渲染所有AI特效
   */
  public renderEffects(
    ctx: CanvasRenderingContext2D,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): void {
    // 渲染敌人移动轨迹
    for (const enemy of enemies) {
      if (enemy instanceof AssassinEnemy) {
        this.movementOptimizer.renderTrailEffect(
          ctx,
          enemy.id,
          'hsl(280, 100%, 70%)',
          enemy.radius
        );
      } else if (enemy instanceof EliteEnemy) {
        this.movementOptimizer.renderTrailEffect(
          ctx,
          enemy.id,
          'hsl(0, 100%, 60%)',
          enemy.radius
        );
      } else {
        this.movementOptimizer.renderTrailEffect(
          ctx,
          enemy.id,
          'hsl(45, 100%, 60%)',
          enemy.radius
        );
      }
    }
  }
  
  /**
   * 生成分析报告
   */
  public generateAnalysisReport(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): AnalysisReport {
    const blindSpotThreats = this.assistantAI.detectBlindSpotThreats(player, enemies);
    
    const recommendations: string[] = [];
    
    // 检测盲区威胁
    if (blindSpotThreats.length > 0) {
      recommendations.push(`⚠️ 警告：${blindSpotThreats.length}个敌人在你的盲区！建议转身查看后方。`);
    }
    
    // 检测血量
    if (player.health < 30) {
      recommendations.push(`💊 生命值危险！当前${Math.floor(player.health)}%，建议保持距离并寻找掩体。`);
    } else if (player.health < 60) {
      recommendations.push(`⚠️ 生命值偏低(${Math.floor(player.health)}%)，注意保持安全距离。`);
    }
    
    // 检测包围情况
    const nearbyEnemies = enemies.filter(e => {
      const dx = e.position.x - player.position.x;
      const dy = e.position.y - player.position.y;
      return Math.sqrt(dx * dx + dy * dy) < 200;
    });
    
    if (nearbyEnemies.length >= 5) {
      recommendations.push(`🎯 被多个敌人包围！建议突破包围圈或使用范围攻击。`);
    }
    
    // 辅助AI状态
    const assistMode = this.assistantAI.getMode();
    if (assistMode === "burst") {
      recommendations.push(`🤖 辅助AI已进入高爆发模式，正在全力支援！`);
    }
    
    // 战术建议
    const enemyCount = enemies.length;
    if (enemyCount > 8) {
      recommendations.push(`📊 敌人数量较多(${enemyCount})，建议优先清理残血敌人。`);
    } else if (enemyCount <= 2) {
      recommendations.push(`✅ 敌人数量较少，保持稳定输出即可。`);
    }
    
    return {
      playerHealth: player.health,
      enemyCount: enemies.length,
      nearbyThreats: nearbyEnemies.length,
      blindSpotThreats: blindSpotThreats.length,
      assistantMode: assistMode,
      recommendations
    };
  }
  
  /**
   * 重置协调器
   */
  public reset(): void {
    this.playerShooting = false;
    this.playerReloading = false;
    this.lastShootTime = 0;
    this.waveManager.reset();
  }
}

export interface CombatState {
  assistant: {
    shouldShoot: boolean;
    targetEnemy: (Enemy | EliteEnemy | AssassinEnemy) | null;
    mode: string;
  };
  enemy: {
    formationMode: string;
    aggressionLevel: number;
    tactics: Map<string, any>;
  };
  movements: Map<string, Vector2D>;
  waveInfo: {
    currentWave: number;
    enemyLimit: number;
    currentCount: number;
  };
}

export interface AnalysisReport {
  playerHealth: number;
  enemyCount: number;
  nearbyThreats: number;
  blindSpotThreats: number;
  assistantMode: string;
  recommendations: string[];
}
