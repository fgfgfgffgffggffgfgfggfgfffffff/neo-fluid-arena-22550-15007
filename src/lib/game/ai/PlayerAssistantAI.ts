import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";
import { Vector2D } from "../types";

/**
 * 玩家辅助 AI - 主动支援、覆盖短板
 * 实现核心辅助功能，成为玩家的战斗搭档
 */
export class PlayerAssistantAI {
  private lastPlayerShootTime = 0;
  private assistMode: "normal" | "burst" | "cover" = "normal";
  private shootingFrequency = 1000; // ms between shots
  
  /**
   * 更新辅助 AI 状态
   */
  public update(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    deltaTime: number,
    playerShooting: boolean
  ): {
    shouldShoot: boolean;
    targetEnemy: (Enemy | EliteEnemy | AssassinEnemy) | null;
    mode: string;
  } {
    const now = Date.now();
    
    // 规则1: 玩家停止射击≥2秒时，主动骚扰射击
    if (!playerShooting) {
      this.lastPlayerShootTime = now;
    }
    const timeSinceLastShot = now - this.lastPlayerShootTime;
    
    // 规则7: 玩家血量<20%时，切换高爆发模式
    if (player.health < 20) {
      this.assistMode = "burst";
      this.shootingFrequency = 500; // 射击频率加倍
    }
    // 规则3: 同波敌人>8个时射击频率+50%，<3个时-30%
    else if (enemies.length > 8) {
      this.assistMode = "burst";
      this.shootingFrequency = 667; // +50%频率
    } else if (enemies.length < 3) {
      this.assistMode = "normal";
      this.shootingFrequency = 1430; // -30%频率
    } else {
      this.assistMode = "normal";
      this.shootingFrequency = 1000;
    }
    
    // 规则4: 玩家在掩体后时，辅助AI掩护射击
    const playerExposure = this.calculatePlayerExposure(player, enemies);
    if (playerExposure < 0.2) {
      this.assistMode = "cover";
    }
    
    // 选择目标
    let targetEnemy = this.selectTarget(player, enemies);
    
    // 规则5: 优先攻击正在攻击玩家的敌人
    const attackingPlayer = enemies.filter(e => {
      const dx = e.position.x - player.position.x;
      const dy = e.position.y - player.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < 150;
    });
    
    if (attackingPlayer.length > 0) {
      targetEnemy = attackingPlayer[0];
    }
    
    // 规则12: 同屏敌人>10个时，优先攻击残血敌
    if (enemies.length > 10) {
      const lowHealthEnemies = enemies.filter(e => e.health < e.health * 0.3);
      if (lowHealthEnemies.length > 0) {
        targetEnemy = lowHealthEnemies[0];
      }
    }
    
    const shouldShoot = timeSinceLastShot > 2000 && targetEnemy !== null;
    
    return {
      shouldShoot,
      targetEnemy,
      mode: this.assistMode
    };
  }
  
  /**
   * 计算玩家暴露程度
   */
  private calculatePlayerExposure(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): number {
    const nearbyEnemies = enemies.filter(e => {
      const dx = e.position.x - player.position.x;
      const dy = e.position.y - player.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < 200;
    });
    
    if (nearbyEnemies.length === 0) return 1.0;
    
    // 简化计算：周围敌人越多，暴露程度越高
    return Math.min(1.0, nearbyEnemies.length * 0.2);
  }
  
  /**
   * 选择攻击目标
   */
  private selectTarget(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): (Enemy | EliteEnemy | AssassinEnemy) | null {
    if (enemies.length === 0) return null;
    
    // 找到距离玩家最近的敌人
    let closest: (Enemy | EliteEnemy | AssassinEnemy) | null = null;
    let minDist = Infinity;
    
    for (const enemy of enemies) {
      const dx = enemy.position.x - player.position.x;
      const dy = enemy.position.y - player.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    }
    
    return closest;
  }
  
  /**
   * 检测玩家视野盲区的威胁
   */
  public detectBlindSpotThreats(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): (Enemy | EliteEnemy | AssassinEnemy)[] {
    const threats: (Enemy | EliteEnemy | AssassinEnemy)[] = [];
    
    for (const enemy of enemies) {
      const dx = enemy.position.x - player.position.x;
      const dy = enemy.position.y - player.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 规则2: 敌人从盲区靠近<5米时警示
      if (dist < 100) { // 5米 = 100像素
        const angle = Math.atan2(dy, dx);
        // 简化：假设玩家视野是前方180度
        const isBehind = Math.abs(angle) > Math.PI / 2;
        
        if (isBehind) {
          threats.push(enemy);
        }
      }
    }
    
    return threats;
  }
  
  /**
   * 获取射击频率（毫秒）
   */
  public getShootingFrequency(): number {
    return this.shootingFrequency;
  }
  
  /**
   * 获取当前模式
   */
  public getMode(): string {
    return this.assistMode;
  }
}
