import { Vector2D } from "../types";

export class Player {
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public radius: number;
  private baseSpeed = 21.6;
  private speed = 21.6;
  public shield = 0; // Player shield
  public health = 100; // Player health
  public maxHealth = 100;
  private trail: Vector2D[] = [];
  private maxTrailLength = 15;
  public slowFactor = 1; // Reduced by defender locks
  public orbitersActive = false; // AI mode orbiters

  // Auto-aim mode
  public autoAimMode = false;
  
  // AI auto-pilot mode
  public aiAutoPilot = false;

  constructor(position: Vector2D, radius: number) {
    this.position = position;
    this.radius = radius;
  }

  public update(mousePosition: Vector2D, deltaTime: number, canvas: HTMLCanvasElement) {
    this.speed = this.baseSpeed * this.slowFactor;
    
    // Move towards mouse position (very fast and smooth)
    const dx = mousePosition.x - this.position.x;
    const dy = mousePosition.y - this.position.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance > 3) {
      // Interpolate velocity for smoother movement
      const targetVelX = (dx / distance) * this.speed;
      const targetVelY = (dy / distance) * this.speed;
      
      this.velocity.x += (targetVelX - this.velocity.x) * 0.3;
      this.velocity.y += (targetVelY - this.velocity.y) * 0.3;
    } else {
      this.velocity.x *= 0.85;
      this.velocity.y *= 0.85;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Keep player in bounds with slight padding
    const padding = this.radius + 5;
    this.position.x = Math.max(padding, Math.min(canvas.width - padding, this.position.x));
    this.position.y = Math.max(padding, Math.min(canvas.height - padding, this.position.y));

    // Update trail
    this.trail.unshift({ ...this.position });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }
  }

  public toggleAutoAim() {
    this.autoAimMode = !this.autoAimMode;
    this.orbitersActive = this.autoAimMode; // Activate orbiters with auto-aim
    console.log(`🎯 Auto-aim mode: ${this.autoAimMode ? "ON (AI Orbiters)" : "OFF"}`);
  }
  
  public toggleAIAutoPilot() {
    this.aiAutoPilot = !this.aiAutoPilot;
    console.log(`🤖 AI Auto-pilot: ${this.aiAutoPilot ? "ON" : "OFF"}`);
  }

  public takeDamage(amount: number): boolean {
    // Shield absorbs damage first
    if (this.shield > 0) {
      this.shield = Math.max(0, this.shield - amount);
      return false;
    }
    
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }

  public setSlowFactor(factor: number) {
    this.slowFactor = Math.max(0.5, factor); // Minimum 50% speed
  }

  public getShootPosition(): Vector2D {
    // Shoot from exact center of player
    return { ...this.position };
  }
  
  public getSpeed(): number {
    return this.speed;
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Render trail with smooth falloff (减少拖尾长度)
    for (let i = 0; i < Math.min(this.trail.length, 8); i++) {
      const alpha = (1 - (i / 8)) * 0.3;
      const radius = this.radius * (1 - (i / 8) * 0.5);
      
      const gradient = ctx.createRadialGradient(
        this.trail[i].x,
        this.trail[i].y,
        0,
        this.trail[i].x,
        this.trail[i].y,
        radius * 1.5
      );
      gradient.addColorStop(0, `hsla(200, 100%, 65%, ${alpha})`);
      gradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main body - multiple layers for intense glow effect
    const x = this.position.x;
    const y = this.position.y;
    
    // Outermost glow (小一点)
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 3);
    outerGlow.addColorStop(0, "hsla(200, 100%, 70%, 0.4)");
    outerGlow.addColorStop(0.3, "hsla(200, 100%, 70%, 0.25)");
    outerGlow.addColorStop(0.7, "hsla(200, 100%, 70%, 0.1)");
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    const midGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 1.5);
    midGlow.addColorStop(0, "hsla(200, 100%, 75%, 0.6)");
    midGlow.addColorStop(0.5, "hsla(200, 100%, 65%, 0.3)");
    midGlow.addColorStop(1, "transparent");
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    coreGradient.addColorStop(0, "hsl(200, 100%, 90%)");
    coreGradient.addColorStop(0.5, "hsl(200, 100%, 70%)");
    coreGradient.addColorStop(0.8, "hsl(200, 100%, 60%)");
    coreGradient.addColorStop(1, "hsl(200, 100%, 50%)");
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright spot for extra shine
    const highlight = ctx.createRadialGradient(
      x - this.radius * 0.3,
      y - this.radius * 0.3,
      0,
      x,
      y,
      this.radius * 0.6
    );
    highlight.addColorStop(0, "hsla(200, 100%, 100%, 0.9)");
    highlight.addColorStop(0.5, "hsla(200, 100%, 95%, 0.5)");
    highlight.addColorStop(1, "transparent");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
