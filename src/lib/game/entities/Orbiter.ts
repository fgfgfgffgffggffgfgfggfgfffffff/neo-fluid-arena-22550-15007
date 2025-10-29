import { Vector2D } from "../types";
import { Player } from "./Player";
import { EliteEnemy } from "./EliteEnemy";
import { Bullet } from "./Bullet";

export class Orbiter {
  public id: string;
  public angle: number;
  public radius: number;
  public orbitDistance = 40; // Distance from player
  public orbitSpeed = 0.05; // Rotation speed
  private shootCooldown = 0;
  private baseShootCooldown = 12.5; // 2x player speed (player is 25ms)

  constructor(initialAngle: number, playerRadius: number) {
    this.id = Math.random().toString(36).substring(2, 15);
    this.angle = initialAngle;
    this.radius = playerRadius * 0.5; // 50% of player size
  }

  public update(deltaTime: number, player: Player, allEnemies: any[]): Bullet | null {
    // Orbit around player
    this.angle += this.orbitSpeed;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
    }

    // Auto-shoot at nearest enemy
    if (this.shootCooldown === 0 && allEnemies.length > 0) {
      const position = this.getPosition(player);
      
      // Find nearest enemy (any type)
      let nearestEnemy: any = null;
      let nearestDistance = Infinity;
      
      for (const enemy of allEnemies) {
        const dx = enemy.position.x - position.x;
        const dy = enemy.position.y - position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEnemy = enemy;
        }
      }

      if (nearestEnemy) {
        const dx = nearestEnemy.position.x - position.x;
        const dy = nearestEnemy.position.y - position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        const direction = {
          x: dx / distance,
          y: dy / distance
        };

        this.shootCooldown = this.baseShootCooldown;
        
        // 小激光炮 - 更小的子弹
        const bullet = new Bullet(position, direction, 1.5); // 小子弹半径1.5
        (bullet as any).damage = 2; // 2点伤害
        (bullet as any).color = "hsl(45, 100%, 60%)"; // 黄色激光
        return bullet;
      }
    }

    return null;
  }

  public getPosition(player: Player): Vector2D {
    return {
      x: player.position.x + Math.cos(this.angle) * this.orbitDistance,
      y: player.position.y + Math.sin(this.angle) * this.orbitDistance
    };
  }

  public render(ctx: CanvasRenderingContext2D, player: Player) {
    const position = this.getPosition(player);
    const x = position.x;
    const y = position.y;

    // Outer glow - Yellow (更小)
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
    outerGlow.addColorStop(0, "hsla(45, 100%, 65%, 0.5)");
    outerGlow.addColorStop(0.5, "hsla(45, 100%, 60%, 0.25)");
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    coreGradient.addColorStop(0, "hsl(45, 100%, 75%)");
    coreGradient.addColorStop(0.5, "hsl(45, 100%, 65%)");
    coreGradient.addColorStop(1, "hsl(45, 100%, 55%)");
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    const highlight = ctx.createRadialGradient(
      x - this.radius * 0.3,
      y - this.radius * 0.3,
      0,
      x,
      y,
      this.radius * 0.6
    );
    highlight.addColorStop(0, "hsla(45, 100%, 95%, 0.8)");
    highlight.addColorStop(1, "transparent");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
