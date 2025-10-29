import { Vector2D } from "../types";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";

/**
 * 战术分析器 - 分析战场局势并提供战术建议
 */
export class TacticalAnalyzer {
  /**
   * 分析玩家周围的威胁等级
   */
  public static analyzeThreatLevel(
    player: Player,
    enemies: Enemy[],
    assassins: AssassinEnemy[],
    bosses: EliteEnemy[]
  ): {
    level: "low" | "medium" | "high" | "critical";
    nearbyEnemies: number;
    weakPoints: Vector2D[];
  } {
    const detectionRadius = 300;
    let nearbyCount = 0;
    const enemyPositions: Vector2D[] = [];

    // 统计附近敌人
    [...enemies, ...assassins, ...bosses].forEach(enemy => {
      const dx = enemy.position.x - player.position.x;
      const dy = enemy.position.y - player.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      
      if (distance < detectionRadius) {
        nearbyCount++;
        enemyPositions.push(enemy.position);
      }
    });

    // 计算威胁等级
    let level: "low" | "medium" | "high" | "critical";
    if (nearbyCount <= 2) level = "low";
    else if (nearbyCount <= 4) level = "medium";
    else if (nearbyCount <= 6) level = "high";
    else level = "critical";

    // 找出包围圈的薄弱点
    const weakPoints = this.findWeakPoints(player.position, enemyPositions);

    return { level, nearbyEnemies: nearbyCount, weakPoints };
  }

  /**
   * 找出敌人包围圈中的薄弱点
   */
  private static findWeakPoints(playerPos: Vector2D, enemyPositions: Vector2D[]): Vector2D[] {
    if (enemyPositions.length === 0) return [];

    const angles: { angle: number; distance: number }[] = [];
    
    // 计算每个敌人相对玩家的角度
    enemyPositions.forEach(pos => {
      const dx = pos.x - playerPos.x;
      const dy = pos.y - playerPos.y;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      angles.push({ angle, distance });
    });

    // 按角度排序
    angles.sort((a, b) => a.angle - b.angle);

    // 找出角度差最大的区域（薄弱点）
    const weakPoints: Vector2D[] = [];
    for (let i = 0; i < angles.length; i++) {
      const current = angles[i];
      const next = angles[(i + 1) % angles.length];
      
      let angleDiff = next.angle - current.angle;
      if (i === angles.length - 1) {
        angleDiff = (2 * Math.PI + next.angle) - current.angle;
      }

      // 如果角度差大于60度，这是一个薄弱点
      if (Math.abs(angleDiff) > Math.PI / 3) {
        const midAngle = current.angle + angleDiff / 2;
        const escapePoint: Vector2D = {
          x: playerPos.x + Math.cos(midAngle) * 200,
          y: playerPos.y + Math.sin(midAngle) * 200
        };
        weakPoints.push(escapePoint);
      }
    }

    return weakPoints;
  }

  /**
   * 为Boss提供进攻策略建议
   */
  public static suggestAttackStrategy(
    boss: EliteEnemy,
    player: Player,
    enemies: Enemy[],
    otherBosses: EliteEnemy[]
  ): {
    shouldCommand: boolean;
    commandTargets: Enemy[];
    attackAngle: number;
  } {
    const shouldCommand = Math.random() < 0.3; // 30%概率发出指令
    const commandTargets: Enemy[] = [];

    if (shouldCommand && enemies.length > 0) {
      // 选择最近的3个普通敌人
      const sorted = [...enemies].sort((a, b) => {
        const distA = Math.sqrt(
          (a.position.x - boss.position.x) ** 2 + 
          (a.position.y - boss.position.y) ** 2
        );
        const distB = Math.sqrt(
          (b.position.x - boss.position.x) ** 2 + 
          (b.position.y - boss.position.y) ** 2
        );
        return distA - distB;
      });
      
      commandTargets.push(...sorted.slice(0, Math.min(3, sorted.length)));
    }

    // 计算最佳进攻角度
    const dx = player.position.x - boss.position.x;
    const dy = player.position.y - boss.position.y;
    const attackAngle = Math.atan2(dy, dx);

    return { shouldCommand, commandTargets, attackAngle };
  }

  /**
   * 评估编队效率
   */
  public static evaluateFormationEfficiency(bosses: EliteEnemy[]): number {
    if (bosses.length < 2) return 0;

    // 检查编队是否均匀分布
    const angles = bosses
      .filter(b => b.isInFormation)
      .map(b => b.formationIndex * (2 * Math.PI / (bosses.length - 1)));

    let totalDeviation = 0;
    for (let i = 0; i < angles.length - 1; i++) {
      const expectedDiff = 2 * Math.PI / angles.length;
      const actualDiff = angles[i + 1] - angles[i];
      totalDeviation += Math.abs(actualDiff - expectedDiff);
    }

    // 效率值：0-1，越高越好
    return Math.max(0, 1 - (totalDeviation / Math.PI));
  }
}
