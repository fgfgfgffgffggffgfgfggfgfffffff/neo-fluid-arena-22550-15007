import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";
import { Vector2D } from "../types";
import { Bullet } from "../entities/Bullet";

/**
 * 玩家辅助 AI - 主动支援、覆盖短板
 * 实现核心辅助功能，成为玩家的战斗搭档
 */
export class PlayerAssistantAI {
  private lastPlayerShootTime = 0;
  private assistMode: "normal" | "burst" | "cover" = "normal";
  private shootingFrequency = 1000; // ms between shots
  
  /**
   * 计算AI控制的玩家移动目标（完全托管模式）
   */
  public calculatePlayerMovement(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    bullets: any[],
    canvasWidth: number,
    canvasHeight: number
  ): Vector2D {
    if (enemies.length === 0) {
      // 没有敌人时，移动到中心
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    }
    
    // 找到最近的威胁
    const nearestEnemy = this.selectTarget(player, enemies);
    if (!nearestEnemy) {
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    }
    
    // 计算与最近敌人的距离
    const dx = nearestEnemy.position.x - player.position.x;
    const dy = nearestEnemy.position.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 理想距离：保持在中等距离（既不太近也不太远）
    const idealDistance = 250;
    const tooClose = 150;
    const tooFar = 400;
    
    let targetX = player.position.x;
    let targetY = player.position.y;
    
    // 如果太近，后退
    if (distance < tooClose) {
      targetX = player.position.x - (dx / distance) * 100;
      targetY = player.position.y - (dy / distance) * 100;
    }
    // 如果太远，前进
    else if (distance > tooFar) {
      targetX = player.position.x + (dx / distance) * 100;
      targetY = player.position.y + (dy / distance) * 100;
    }
    // 保持理想距离，横向移动躲避
    else {
      // 横向移动（垂直于敌人方向）
      const perpX = -dy / distance;
      const perpY = dx / distance;
      targetX = player.position.x + perpX * 80;
      targetY = player.position.y + perpY * 80;
    }
    
    // 躲避敌人子弹
    for (const bullet of bullets) {
      const bDx = bullet.position.x - player.position.x;
      const bDy = bullet.position.y - player.position.y;
      const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
      
      if (bDist < 100) {
        // 垂直于子弹方向躲避
        const perpX = -bDy / bDist;
        const perpY = bDx / bDist;
        targetX += perpX * 50;
        targetY += perpY * 50;
      }
    }
    
    // 避免被多个敌人包围
    const nearbyEnemies = enemies.filter(e => {
      const edx = e.position.x - player.position.x;
      const edy = e.position.y - player.position.y;
      return Math.sqrt(edx * edx + edy * edy) < 200;
    });
    
    if (nearbyEnemies.length >= 3) {
      // 找到包围圈的缺口并向那个方向移动
      let avgX = 0, avgY = 0;
      for (const e of nearbyEnemies) {
        avgX += e.position.x;
        avgY += e.position.y;
      }
      avgX /= nearbyEnemies.length;
      avgY /= nearbyEnemies.length;
      
      // 远离包围圈中心
      const escapeX = player.position.x - avgX;
      const escapeY = player.position.y - avgY;
      const escapeDist = Math.sqrt(escapeX * escapeX + escapeY * escapeY);
      
      if (escapeDist > 0) {
        targetX = player.position.x + (escapeX / escapeDist) * 120;
        targetY = player.position.y + (escapeY / escapeDist) * 120;
      }
    }
    
    // 保持在边界内
    const padding = 50;
    targetX = Math.max(padding, Math.min(canvasWidth - padding, targetX));
    targetY = Math.max(padding, Math.min(canvasHeight - padding, targetY));
    
    return { x: targetX, y: targetY };
  }
  
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
