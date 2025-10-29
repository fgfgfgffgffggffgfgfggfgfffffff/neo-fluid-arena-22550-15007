import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { AssassinEnemy } from "../entities/AssassinEnemy";
import { Vector2D } from "../types";

/**
 * 敌人战术 AI - 策略压迫、主动突袭
 * 实现核心战术功能，通过阵型、分工、地形利用压迫玩家
 */
export class EnemyTacticalAI {
  private formationMode: "surround" | "flank" | "charge" | "ambush" = "surround";
  private aggressionLevel = 1.0;
  
  /**
   * 更新战术状态
   */
  public update(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    deltaTime: number
  ): {
    formationMode: string;
    aggressionLevel: number;
    tactics: Map<string, TacticCommand>;
  } {
    const tactics = new Map<string, TacticCommand>();
    
    // 规则3: 玩家血量<40%时，提高侵略性
    if (player.health < 40) {
      this.aggressionLevel = 1.6;
    } else {
      this.aggressionLevel = 1.0;
    }
    
    // 规则5: 同波敌人>8个且玩家在开阔区域时，形成360°包围
    if (enemies.length > 8) {
      this.formationMode = "surround";
      this.assignSurroundTactics(player, enemies, tactics);
    }
    // 规则2: 每波剩余5个敌人时，3个正面吸引火力，2个绕后偷袭
    else if (enemies.length === 5) {
      this.formationMode = "flank";
      this.assignFlankTactics(player, enemies, tactics);
    }
    // 规则4: 检测到玩家换弹且距离<10米时，冲锋
    else if (enemies.length > 0) {
      const nearEnemies = enemies.filter(e => {
        const dx = e.position.x - player.position.x;
        const dy = e.position.y - player.position.y;
        return Math.sqrt(dx * dx + dy * dy) < 200;
      });
      
      if (nearEnemies.length > 0) {
        this.formationMode = "charge";
        this.assignChargeTactics(player, nearEnemies, tactics);
      }
    }
    
    return {
      formationMode: this.formationMode,
      aggressionLevel: this.aggressionLevel,
      tactics
    };
  }
  
  /**
   * 分配包围战术
   */
  private assignSurroundTactics(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    tactics: Map<string, TacticCommand>
  ): void {
    const angleStep = (Math.PI * 2) / enemies.length;
    const radius = 250;
    
    enemies.forEach((enemy, index) => {
      const angle = angleStep * index;
      const targetX = player.position.x + Math.cos(angle) * radius;
      const targetY = player.position.y + Math.sin(angle) * radius;
      
      tactics.set(enemy.id, {
        type: "move_to_position",
        target: { x: targetX, y: targetY },
        speedMultiplier: 1.2,
        shouldAttack: true
      });
    });
  }
  
  /**
   * 分配侧翼战术
   */
  private assignFlankTactics(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    tactics: Map<string, TacticCommand>
  ): void {
    // 前3个正面吸引火力
    for (let i = 0; i < Math.min(3, enemies.length); i++) {
      const enemy = enemies[i];
      const angle = (i - 1) * (Math.PI / 4); // 展开45度
      const targetX = player.position.x + Math.cos(angle) * 200;
      const targetY = player.position.y + Math.sin(angle) * 200;
      
      tactics.set(enemy.id, {
        type: "distract",
        target: { x: targetX, y: targetY },
        speedMultiplier: 0.8,
        shouldAttack: true
      });
    }
    
    // 后2个绕后偷袭
    for (let i = 3; i < enemies.length; i++) {
      const enemy = enemies[i];
      const angle = Math.PI + (i - 3) * (Math.PI / 3);
      const targetX = player.position.x + Math.cos(angle) * 150;
      const targetY = player.position.y + Math.sin(angle) * 150;
      
      tactics.set(enemy.id, {
        type: "flank",
        target: { x: targetX, y: targetY },
        speedMultiplier: 1.4,
        shouldAttack: true
      });
    }
  }
  
  /**
   * 分配冲锋战术
   */
  private assignChargeTactics(
    player: Player,
    enemies: (Enemy | EliteEnemy | AssassinEnemy)[],
    tactics: Map<string, TacticCommand>
  ): void {
    enemies.forEach(enemy => {
      tactics.set(enemy.id, {
        type: "charge",
        target: { x: player.position.x, y: player.position.y },
        speedMultiplier: 1.6 * this.aggressionLevel,
        shouldAttack: true
      });
    });
  }
  
  /**
   * 检测是否应该触发自爆
   */
  public shouldTriggerSuicide(
    enemy: Enemy | EliteEnemy | AssassinEnemy,
    player: Player
  ): boolean {
    // 规则7: 敌人血量<15%且距离玩家<4米时，触发濒死自爆
    const dx = enemy.position.x - player.position.x;
    const dy = enemy.position.y - player.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    return enemy.health < enemy.health * 0.15 && dist < 80;
  }
  
  /**
   * 计算最佳攻击时机
   */
  public calculateAttackTiming(
    player: Player,
    playerReloading: boolean,
    playerHealth: number
  ): number {
    let timing = 1.0;
    
    // 规则4: 玩家换弹时提高攻击频率
    if (playerReloading) {
      timing *= 1.4;
    }
    
    // 规则3: 玩家血量低时提高攻击频率
    if (playerHealth < 40) {
      timing *= 1.4;
    }
    
    return timing;
  }
}

export interface TacticCommand {
  type: "move_to_position" | "distract" | "flank" | "charge" | "retreat";
  target: Vector2D;
  speedMultiplier: number;
  shouldAttack: boolean;
}
