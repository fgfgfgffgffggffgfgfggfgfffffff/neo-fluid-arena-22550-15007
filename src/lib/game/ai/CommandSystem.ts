import { Vector2D } from "../types";
import { Enemy } from "../entities/Enemy";
import { EliteEnemy } from "../entities/EliteEnemy";
import { Player } from "../entities/Player";

export interface Command {
  id: string;
  type: "rush" | "flank" | "retreat" | "surround";
  issuer: string; // Boss ID
  targets: string[]; // Enemy IDs
  targetPosition?: Vector2D;
  priority: number;
  expiresAt: number;
}

/**
 * 指挥系统 - Boss向普通AI发送战术指令
 */
export class CommandSystem {
  private activeCommands: Map<string, Command> = new Map();
  private commandHistory: Command[] = [];
  private maxHistorySize = 50;

  /**
   * Boss发出指令
   */
  public issueCommand(
    boss: EliteEnemy,
    type: Command["type"],
    enemies: Enemy[],
    player: Player,
    priority: number = 1
  ): Command | null {
    if (enemies.length === 0) return null;

    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 选择目标敌人（最近的3个）
    const targets = enemies
      .sort((a, b) => {
        const distA = Math.sqrt(
          (a.position.x - boss.position.x) ** 2 + 
          (a.position.y - boss.position.y) ** 2
        );
        const distB = Math.sqrt(
          (b.position.x - boss.position.x) ** 2 + 
          (b.position.y - boss.position.y) ** 2
        );
        return distA - distB;
      })
      .slice(0, 3)
      .map(e => e.id);

    const command: Command = {
      id: commandId,
      type,
      issuer: boss.id,
      targets,
      targetPosition: type === "rush" || type === "surround" ? player.position : undefined,
      priority,
      expiresAt: Date.now() + 5000 // 5秒后过期
    };

    this.activeCommands.set(commandId, command);
    this.commandHistory.push(command);
    
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }

    return command;
  }

  /**
   * 获取特定敌人的有效指令
   */
  public getCommandsForEnemy(enemyId: string): Command[] {
    const now = Date.now();
    const validCommands: Command[] = [];

    this.activeCommands.forEach((command, id) => {
      if (command.expiresAt < now) {
        this.activeCommands.delete(id);
      } else if (command.targets.includes(enemyId)) {
        validCommands.push(command);
      }
    });

    // 按优先级排序
    return validCommands.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 执行指令 - 修改敌人行为
   */
  public executeCommand(enemy: Enemy, command: Command, player: Player, canvas: HTMLCanvasElement): void {
    switch (command.type) {
      case "rush":
        // 直接冲向玩家
        if (command.targetPosition) {
          enemy.commandedTarget = { ...command.targetPosition };
          enemy.speedMultiplier = 1.5; // 提速50%
        }
        break;

      case "flank":
        // 侧翼包抄
        const flankAngle = Math.random() * Math.PI / 2 - Math.PI / 4;
        const dx = player.position.x - enemy.position.x;
        const dy = player.position.y - enemy.position.y;
        const baseAngle = Math.atan2(dy, dx);
        const newAngle = baseAngle + flankAngle;
        
        enemy.commandedTarget = {
          x: player.position.x + Math.cos(newAngle + Math.PI) * 100,
          y: player.position.y + Math.sin(newAngle + Math.PI) * 100
        };
        enemy.speedMultiplier = 1.2;
        break;

      case "retreat":
        // 后撤重整
        const retreatDx = enemy.position.x - player.position.x;
        const retreatDy = enemy.position.y - player.position.y;
        const retreatDist = Math.sqrt(retreatDx ** 2 + retreatDy ** 2);
        
        if (retreatDist > 0) {
          enemy.commandedTarget = {
            x: enemy.position.x + (retreatDx / retreatDist) * 200,
            y: enemy.position.y + (retreatDy / retreatDist) * 200
          };
          enemy.speedMultiplier = 1.3;
        }
        break;

      case "surround":
        // 包围玩家
        if (command.targetPosition) {
          const surroundAngle = Math.random() * Math.PI * 2;
          const surroundRadius = 150;
          
          enemy.commandedTarget = {
            x: command.targetPosition.x + Math.cos(surroundAngle) * surroundRadius,
            y: command.targetPosition.y + Math.sin(surroundAngle) * surroundRadius
          };
          enemy.speedMultiplier = 1.0;
        }
        break;
    }
  }

  /**
   * 清理过期指令
   */
  public cleanup(): void {
    const now = Date.now();
    this.activeCommands.forEach((command, id) => {
      if (command.expiresAt < now) {
        this.activeCommands.delete(id);
      }
    });
  }

  /**
   * 获取活跃指令数量
   */
  public getActiveCommandCount(): number {
    this.cleanup();
    return this.activeCommands.size;
  }

  /**
   * 获取指令历史（用于调试）
   */
  public getCommandHistory(): Command[] {
    return [...this.commandHistory];
  }
}
