import { Vector2D } from "../types";
import { Player } from "./Player";
import { Bullet } from "./Bullet";

export class AssassinEnemy {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public radius: number;
  public health = 1; // Only 1 HP - dies instantly
  private baseSpeed = 18; // Very slow movement (reduced from 35)
  private orbitRadius = 200; // Orbit distance
  private orbitAngle = Math.random() * Math.PI * 2;
  private orbitSpeed = 0.0005; // Very slow orbit
  private chargeMode = false; // When true, charges at player
  private chargeTimer = 0;
  private chargeInterval = 5000; // Charge every 5 seconds
  private orbitCount = 0; // Track orbits
  private lastAngle = 0; // Track angle for orbit counting
  private dodgeAngle = 0;
  private dodgeTimer = 0;
  private lifeTimer = 0; // Track lifetime
  private maxLifetime = 30000; // 30 seconds
  private trail: Vector2D[] = [];
  private maxTrailLength = 20;
  private smoothing = 0.15; // 平滑系数
  
  // Prediction
  private playerHistory: Vector2D[] = [];
  private maxHistoryLength = 30;

  constructor(position: Vector2D, radius: number) {
    this.id = Math.random().toString(36).substring(2, 15);
    this.position = position;
    this.radius = radius;
  }

  private recordPlayerPosition(player: Player) {
    this.playerHistory.unshift({ ...player.position });
    if (this.playerHistory.length > this.maxHistoryLength) {
      this.playerHistory.pop();
    }
  }

  private predictPlayerPosition(player: Player): Vector2D {
    if (this.playerHistory.length < 3) {
      return { ...player.position };
    }

    const recentMoves = this.playerHistory.slice(0, 5);
    let avgVelX = 0;
    let avgVelY = 0;

    for (let i = 0; i < recentMoves.length - 1; i++) {
      avgVelX += recentMoves[i].x - recentMoves[i + 1].x;
      avgVelY += recentMoves[i].y - recentMoves[i + 1].y;
    }

    avgVelX /= recentMoves.length - 1;
    avgVelY /= recentMoves.length - 1;

    const predictionFrames = 1000; // 50x enhanced: predict much further ahead
    return {
      x: player.position.x + avgVelX * predictionFrames,
      y: player.position.y + avgVelY * predictionFrames,
    };
  }

  private shouldDodgeBullet(bullets: Bullet[]): boolean {
    for (const bullet of bullets) {
      const toAssassin = {
        x: this.position.x - bullet.position.x,
        y: this.position.y - bullet.position.y,
      };
      
      const distance = Math.sqrt(toAssassin.x ** 2 + toAssassin.y ** 2);
      
      if (distance < 12500) { // 50x enhanced: massive detection range
        const bulletDir = bullet.direction;
        const dot = (toAssassin.x * bulletDir.x + toAssassin.y * bulletDir.y) / distance;
        
        if (dot > 0.5) {
          // Calculate perpendicular dodge direction
          this.dodgeAngle = Math.atan2(-bulletDir.x, bulletDir.y);
          this.dodgeTimer = 300; // Dodge for 300ms
          return true;
        }
      }
    }
    
    return false;
  }

  public updateAI(
    player: Player,
    bullets: Bullet[],
    deltaTime: number,
    canvas: HTMLCanvasElement
  ) {
    this.recordPlayerPosition(player);
    this.chargeTimer += deltaTime;
    this.lifeTimer += deltaTime;
    
    // Track orbit count
    if (Math.abs(this.orbitAngle - this.lastAngle) > Math.PI * 2) {
      this.orbitCount++;
      this.lastAngle = this.orbitAngle;
    }
    
    // After 2 orbits, try to charge
    if (this.orbitCount >= 2 && !this.chargeMode) {
      this.chargeMode = true;
      this.orbitCount = 0;
    }
    
    const isDodging = this.dodgeTimer > 0;
    if (isDodging) {
      this.dodgeTimer -= deltaTime;
    }

    // Check if should dodge bullets
    const shouldDodge = this.shouldDodgeBullet(bullets);

    // Charge mode: directly rush to player
    if (this.chargeTimer >= this.chargeInterval && !isDodging) {
      this.chargeMode = true;
      this.chargeTimer = 0;
    }

    let targetX: number, targetY: number;
    let speedMultiplier = 1;

    if (shouldDodge || isDodging) {
      // Dodge perpendicular to bullet
      targetX = this.position.x + Math.cos(this.dodgeAngle) * 150;
      targetY = this.position.y + Math.sin(this.dodgeAngle) * 150;
      speedMultiplier = 1.1; // Very slow dodge
    } else if (this.chargeMode) {
      // Charge at predicted player position
      const predicted = this.predictPlayerPosition(player);
      targetX = predicted.x;
      targetY = predicted.y;
      speedMultiplier = 1.05; // Very slow charge
      
      // Exit charge mode when close
      const dx = player.position.x - this.position.x;
      const dy = player.position.y - this.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      if (distance < 50) {
        this.chargeMode = false;
      }
    } else {
      // Orbit mode: circle around player
      this.orbitAngle += this.orbitSpeed * deltaTime;
      targetX = player.position.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      targetY = player.position.y + Math.sin(this.orbitAngle) * this.orbitRadius;
      speedMultiplier = 1.0; // Normal speed orbit
    }

    // Move towards target with smooth interpolation
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance > 5) {
      // 计算目标速度
      const targetVelX = (dx / distance) * this.baseSpeed * speedMultiplier;
      const targetVelY = (dy / distance) * this.baseSpeed * speedMultiplier;
      
      // 使用平滑插值而不是直接赋值，使移动更流畅
      this.velocity.x += (targetVelX - this.velocity.x) * this.smoothing;
      this.velocity.y += (targetVelY - this.velocity.y) * this.smoothing;
    } else {
      // 接近目标时减速
      this.velocity.x *= 0.9;
      this.velocity.y *= 0.9;
    }

    // 应用速度（乘以deltaTime使其与帧率无关）
    this.position.x += this.velocity.x * (deltaTime / 1000);
    this.position.y += this.velocity.y * (deltaTime / 1000);
    
    // Update trail
    this.trail.unshift({ ...this.position });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }

    // Keep in bounds - don't allow wrapping
    const padding = this.radius + 5;
    this.position.x = Math.max(padding, Math.min(canvas.width - padding, this.position.x));
    this.position.y = Math.max(padding, Math.min(canvas.height - padding, this.position.y));
  }

  public isExpired(): boolean {
    return this.lifeTimer >= this.maxLifetime;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const x = this.position.x;
    const y = this.position.y;

    // Enhanced smooth trail effect with glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < this.trail.length - 1; i++) {
      const alpha = (1 - (i / this.trail.length)) * 0.7;
      const radius = this.radius * (1 - (i / this.trail.length) * 0.6);
      
      // 渐变光晕效果
      const gradient = ctx.createRadialGradient(
        this.trail[i].x,
        this.trail[i].y,
        0,
        this.trail[i].x,
        this.trail[i].y,
        radius * 2.5
      );
      gradient.addColorStop(0, `hsla(280, 100%, 75%, ${alpha * 0.8})`);
      gradient.addColorStop(0.4, `hsla(280, 100%, 65%, ${alpha * 0.5})`);
      gradient.addColorStop(0.7, `hsla(280, 100%, 55%, ${alpha * 0.2})`);
      gradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // 连接线效果
      if (i < this.trail.length - 1) {
        ctx.strokeStyle = `hsla(280, 100%, 70%, ${alpha * 0.4})`;
        ctx.lineWidth = radius * 0.5;
        ctx.beginPath();
        ctx.moveTo(this.trail[i].x, this.trail[i].y);
        ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Outermost glow - purple/magenta
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 4);
    const glowIntensity = this.chargeMode ? 1.5 : 1;
    outerGlow.addColorStop(0, `hsla(280, 100%, 65%, ${0.6 * glowIntensity})`);
    outerGlow.addColorStop(0.3, `hsla(280, 100%, 60%, ${0.4 * glowIntensity})`);
    outerGlow.addColorStop(0.7, `hsla(280, 100%, 55%, ${0.2 * glowIntensity})`);
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    const midGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
    midGlow.addColorStop(0, "hsla(280, 100%, 75%, 0.7)");
    midGlow.addColorStop(0.5, "hsla(280, 100%, 65%, 0.4)");
    midGlow.addColorStop(1, "transparent");
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core - smaller and more intense
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 0.8);
    coreGradient.addColorStop(0, "hsl(280, 100%, 90%)");
    coreGradient.addColorStop(0.5, "hsl(280, 100%, 75%)");
    coreGradient.addColorStop(0.8, "hsl(280, 100%, 65%)");
    coreGradient.addColorStop(1, "hsl(280, 100%, 55%)");
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Danger symbol when charging
    if (this.chargeMode) {
      ctx.save();
      ctx.fillStyle = "hsla(0, 100%, 70%, 0.9)";
      ctx.font = `${this.radius * 1.5}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", x, y);
      ctx.restore();
    }
  }
}
