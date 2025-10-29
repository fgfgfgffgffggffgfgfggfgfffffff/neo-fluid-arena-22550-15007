import { Vector2D } from "../types";
import { Player } from "./Player";

export class Defender {
  public id: string;
  public position: Vector2D;
  public radius: number;
  public health = 30; // 3x health of attacker (10 * 3 = 30)
  public lockTarget: Player | null = null;
  private maxLockDistance = 30000; // 50x enhanced: screen-wide lock range
  public isLocked = false;
  public lockStrength = 0; // 0-1, increases while locked
  
  // Movement (orbital around player)
  private orbitAngle = Math.random() * Math.PI * 2;
  private orbitSpeed = 0.04; // 50x enhanced: much faster orbital movement
  private orbitRadius = 400; // Distance from player
  private baseSpeed = 200; // 50x enhanced: 4 * 50 = 200

  constructor(position: Vector2D, radius: number) {
    this.id = Math.random().toString(36).substring(2, 15);
    this.position = position;
    this.radius = radius;
  }

  public update(player: Player, deltaTime: number, canvas: HTMLCanvasElement) {
    // Lock onto player if within range
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    this.isLocked = distance <= this.maxLockDistance;
    if (this.isLocked) {
      this.lockTarget = player;
      // Increase lock strength over time (max 1.0)
      this.lockStrength = Math.min(1, this.lockStrength + deltaTime / 10000);
    } else {
      this.lockTarget = null;
      // Decrease lock strength when not locked
      this.lockStrength = Math.max(0, this.lockStrength - deltaTime / 5000);
    }
    
    // Orbital movement around player
    this.orbitAngle += this.orbitSpeed * deltaTime;
    const targetX = player.position.x + Math.cos(this.orbitAngle) * this.orbitRadius;
    const targetY = player.position.y + Math.sin(this.orbitAngle) * this.orbitRadius;
    
    // Move towards target orbit position
    const tdx = targetX - this.position.x;
    const tdy = targetY - this.position.y;
    const tdist = Math.sqrt(tdx ** 2 + tdy ** 2);
    
    if (tdist > 5) {
      this.position.x += (tdx / tdist) * this.baseSpeed;
      this.position.y += (tdy / tdist) * this.baseSpeed;
    }
    
    // Keep in bounds
    const padding = this.radius + 5;
    this.position.x = Math.max(padding, Math.min(canvas.width - padding, this.position.x));
    this.position.y = Math.max(padding, Math.min(canvas.height - padding, this.position.y));
  }

  public getLockEffects() {
    // Returns the debuff effects based on lock strength - 50% slow per defender
    return {
      speedSlow: this.isLocked ? 0.5 : 0,
    };
  }

  public render(ctx: CanvasRenderingContext2D) {
    const x = this.position.x;
    const y = this.position.y;

    // Render subtle yellow targeting line when locked
    if (this.isLocked && this.lockTarget) {
      ctx.save();
      ctx.strokeStyle = `hsla(60, 100%, 50%, 0.15)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(this.lockTarget.position.x, this.lockTarget.position.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Outermost glow (largest) - yellow/gold
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 4.5);
    outerGlow.addColorStop(0, "hsla(50, 100%, 60%, 0.5)");
    outerGlow.addColorStop(0.3, "hsla(50, 100%, 55%, 0.3)");
    outerGlow.addColorStop(0.7, "hsla(50, 100%, 50%, 0.15)");
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    const midGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
    midGlow.addColorStop(0, "hsla(50, 100%, 70%, 0.6)");
    midGlow.addColorStop(0.5, "hsla(50, 100%, 60%, 0.3)");
    midGlow.addColorStop(1, "transparent");
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core - darker when not locked
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    if (this.isLocked) {
      coreGradient.addColorStop(0, "hsl(50, 100%, 75%)");
      coreGradient.addColorStop(0.5, "hsl(50, 100%, 65%)");
      coreGradient.addColorStop(0.8, "hsl(50, 100%, 55%)");
      coreGradient.addColorStop(1, "hsl(50, 100%, 45%)");
    } else {
      coreGradient.addColorStop(0, "hsl(50, 80%, 60%)");
      coreGradient.addColorStop(0.5, "hsl(50, 80%, 50%)");
      coreGradient.addColorStop(0.8, "hsl(50, 80%, 40%)");
      coreGradient.addColorStop(1, "hsl(50, 80%, 30%)");
    }
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    const highlight = ctx.createRadialGradient(
      x - this.radius * 0.3,
      y - this.radius * 0.3,
      0,
      x,
      y,
      this.radius * 0.6
    );
    highlight.addColorStop(0, "hsla(50, 100%, 90%, 0.7)");
    highlight.addColorStop(0.5, "hsla(50, 100%, 85%, 0.4)");
    highlight.addColorStop(1, "transparent");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Health indicator
    const healthBarWidth = this.radius * 3;
    const healthBarHeight = 4;
    const healthBarY = y + this.radius * 3;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x - healthBarWidth / 2, healthBarY, healthBarWidth, healthBarHeight);

    // Health bar (30 max health)
    const healthPercent = this.health / 30;
    ctx.fillStyle = healthPercent > 0.5 ? "hsl(120, 100%, 50%)" : healthPercent > 0.25 ? "hsl(40, 100%, 50%)" : "hsl(0, 100%, 50%)";
    ctx.fillRect(x - healthBarWidth / 2, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
  }
}
