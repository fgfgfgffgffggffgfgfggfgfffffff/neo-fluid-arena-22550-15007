import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";
import { Player } from "../entities/Player";
import { Vector2D } from "../types";

/**
 * Team Coordinator - 多智能体协作系统
 * 协调敌人之间的团队战术和配合
 */
export class TeamCoordinator {
  private formationPatterns: Map<string, Vector2D[]> = new Map();
  private roleAssignments: Map<string, "tank" | "assassin" | "support" | "flanker"> = new Map();
  
  /**
   * 分配团队角色
   */
  public assignRoles(
    enemies: Enemy[],
    bosses: EliteEnemy[],
    assassins: AssassinEnemy[]
  ): void {
    // 清空之前的角色分配
    this.roleAssignments.clear();
    
    // Boss作为坦克角色
    bosses.forEach((boss, index) => {
      this.roleAssignments.set(boss.id, index % 2 === 0 ? "tank" : "support");
    });
    
    // 刺客作为刺客角色
    assassins.forEach(assassin => {
      this.roleAssignments.set(assassin.id, "assassin");
    });
    
    // 普通敌人分配为侧翼或支援
    enemies.forEach((enemy, index) => {
      this.roleAssignments.set(enemy.id, index % 2 === 0 ? "flanker" : "support");
    });
  }
  
  /**
   * 计算团队编队位置
   */
  public calculateFormation(
    player: Player,
    entities: Array<Enemy | EliteEnemy | AssassinEnemy>
  ): Map<string, Vector2D> {
    const positions = new Map<string, Vector2D>();
    const radius = 300;
    
    entities.forEach((entity, index) => {
      const role = this.roleAssignments.get(entity.id) || "support";
      const angleStep = (Math.PI * 2) / entities.length;
      const angle = angleStep * index;
      
      let distance = radius;
      
      // 根据角色调整距离
      switch (role) {
        case "tank":
          distance = radius * 0.6; // 更近，吸引火力
          break;
        case "assassin":
          distance = radius * 1.2; // 更远，等待突袭时机
          break;
        case "flanker":
          distance = radius * 0.9; // 中等距离，侧翼包抄
          break;
        case "support":
          distance = radius * 1.1; // 稍远，提供支援
          break;
      }
      
      positions.set(entity.id, {
        x: player.position.x + Math.cos(angle) * distance,
        y: player.position.y + Math.sin(angle) * distance
      });
    });
    
    return positions;
  }
  
  /**
   * 协调攻击时机
   */
  public coordinateAttack(
    entities: Array<Enemy | EliteEnemy | AssassinEnemy>,
    player: Player
  ): { shouldAttack: string[]; shouldRetreat: string[] } {
    const shouldAttack: string[] = [];
    const shouldRetreat: string[] = [];
    
    // 分析玩家周围威胁
    const nearbyThreats = entities.filter(e => {
      const dx = e.position.x - player.position.x;
      const dy = e.position.y - player.position.y;
      return Math.sqrt(dx ** 2 + dy ** 2) < 200;
    }).length;
    
    entities.forEach(entity => {
      const role = this.roleAssignments.get(entity.id);
      const dx = entity.position.x - player.position.x;
      const dy = entity.position.y - player.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      
      // 根据角色和距离决定行动
      if (role === "tank" && distance > 100) {
        shouldAttack.push(entity.id);
      } else if (role === "assassin" && nearbyThreats >= 2 && distance > 150) {
        shouldAttack.push(entity.id); // 有其他威胁吸引注意力时突袭
      } else if (role === "flanker" && distance > 120) {
        shouldAttack.push(entity.id);
      } else if (distance < 50 && role !== "tank") {
        shouldRetreat.push(entity.id); // 非坦克角色在太近时撤退
      }
    });
    
    return { shouldAttack, shouldRetreat };
  }
  
  /**
   * 分析包围圈完整度
   */
  public analyzeEncirclement(
    player: Player,
    entities: Array<Enemy | EliteEnemy | AssassinEnemy>
  ): {
    coverage: number; // 0-1，包围完整度
    weakSpots: Vector2D[]; // 薄弱点
    strongSpots: Vector2D[]; // 强势点
  } {
    const sectors = 12; // 将360度分为12个扇区
    const sectorCoverage = new Array(sectors).fill(0);
    
    entities.forEach(entity => {
      const dx = entity.position.x - player.position.x;
      const dy = entity.position.y - player.position.y;
      const angle = Math.atan2(dy, dx);
      const sector = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * sectors);
      sectorCoverage[sector]++;
    });
    
    // 计算覆盖率
    const coveredSectors = sectorCoverage.filter(count => count > 0).length;
    const coverage = coveredSectors / sectors;
    
    // 找出薄弱点和强势点
    const weakSpots: Vector2D[] = [];
    const strongSpots: Vector2D[] = [];
    
    sectorCoverage.forEach((count, index) => {
      const angle = (index / sectors) * Math.PI * 2 - Math.PI;
      const distance = 250;
      const position: Vector2D = {
        x: player.position.x + Math.cos(angle) * distance,
        y: player.position.y + Math.sin(angle) * distance
      };
      
      if (count === 0) {
        weakSpots.push(position);
      } else if (count >= 2) {
        strongSpots.push(position);
      }
    });
    
    return { coverage, weakSpots, strongSpots };
  }
  
  /**
   * 获取实体的团队角色
   */
  public getRole(entityId: string): "tank" | "assassin" | "support" | "flanker" | undefined {
    return this.roleAssignments.get(entityId);
  }
}
