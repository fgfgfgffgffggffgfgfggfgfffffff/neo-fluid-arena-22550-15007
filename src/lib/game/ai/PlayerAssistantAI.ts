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
   * 更新辅助 AI 状态（改进的自瞄系统）
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
    
    // 选择目标
    let targetEnemy = this.selectTarget(player, enemies);
    
    if (!targetEnemy) {
      return { shouldShoot: false, targetEnemy: null, mode: "normal" };
    }

    // 计算到目标的距离和角度
    const dx = targetEnemy.position.x - player.position.x;
    const dy = targetEnemy.position.y - player.position.y;
    const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
    const angleToTarget = Math.atan2(dy, dx);
    
    // 计算玩家当前朝向（根据移动方向）
    const playerVel = player.velocity;
    const playerDx = playerVel.x || 0;
    const playerDy = playerVel.y || 0;
    const playerAngle = Math.atan2(playerDy, playerDx);
    const angleDiff = Math.abs(angleToTarget - playerAngle);

    // 检查是否已经瞄准目标 (角度差小于0.15弧度，约8.6度)
    const isAiming = angleDiff < 0.15 || distanceToTarget < 100;
    
    // 检查射击路径是否清晰
    const hasLineOfSight = this.checkLineOfSight(player, targetEnemy, enemies);
    
    // 判断模式
    const nearbyEnemyCount = enemies.filter(e => {
      const ex = e.position.x - player.position.x;
      const ey = e.position.y - player.position.y;
      return Math.sqrt(ex * ex + ey * ey) < 200;
    }).length;

    if (player.health < 20) {
      this.assistMode = "burst";
      this.shootingFrequency = 500;
    } else if (nearbyEnemyCount > 8) {
      this.assistMode = "burst";
      this.shootingFrequency = 667;
    } else if (nearbyEnemyCount < 3) {
      this.assistMode = "normal";
      this.shootingFrequency = 1430;
    } else {
      this.assistMode = "normal";
      this.shootingFrequency = 1000;
    }

    // 射击决策：只有在瞄准后才射击
    let shouldShoot = false;
    
    if (isAiming && hasLineOfSight) {
      // 已经瞄准且有视线，可以射击
      if (this.assistMode === "burst") {
        shouldShoot = now % 300 < 150; // 高频射击
      } else {
        shouldShoot = true;
      }
    } else if (!hasLineOfSight && distanceToTarget < 350) {
      // 无法直接射击但目标较近，尝试预瞄射击
      const predictedPos = this.predictEnemyPosition(targetEnemy, 0.5);
      const canHitPredicted = this.checkLineOfSight(player, 
        { position: { x: predictedPos.x, y: predictedPos.y } } as any, 
        enemies
      );
      shouldShoot = canHitPredicted;
    }

    // 更新玩家射击时间
    if (!playerShooting) {
      this.lastPlayerShootTime = now;
    }

    return {
      shouldShoot,
      targetEnemy,
      mode: this.assistMode
    };
  }

  /**
   * 检查射击路径是否清晰
   */
  private checkLineOfSight(
    player: Player,
    target: { position: { x: number; y: number } },
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[]
  ): boolean {
    const dx = target.position.x - player.position.x;
    const dy = target.position.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 450; // 射程限制
  }

  /**
   * 预测敌人位置
   */
  private predictEnemyPosition(
    enemy: Enemy | EliteEnemy | AssassinEnemy,
    timeAhead: number
  ): { x: number; y: number } {
    const vx = (enemy as any).velocityX || 0;
    const vy = (enemy as any).velocityY || 0;
    return {
      x: enemy.position.x + vx * timeAhead * 60, // 假设60fps
      y: enemy.position.y + vy * timeAhead * 60
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
