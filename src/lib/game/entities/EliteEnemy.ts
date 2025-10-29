import { Vector2D } from "../types";
import { Player } from "./Player";
import { Bullet } from "./Bullet";

export class EliteEnemy {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public radius: number;
  public health = 10; // Boss health
  public maxHealth = 10;
  public shield = 0; // Shield activated in formation
  public maxShield = 100;
  public formationIndex = 0; // Position in formation
  public isInFormation = false;
  
  // AI Decision System - Priority: Kill Player > Survival
  private baseSpeed = 375; // 50x enhanced: 7.5 * 50 = 375
  private targetPriority = 10; // Max priority for player kill
  private lastHitTime = 0;
  private dodgeSuccessCount = 0;
  private attackAccuracy = 0.92; // Very high accuracy
  private playerHistory: Vector2D[] = [];
  private maxHistoryLength = 120; // Extended history for better prediction
  private learningWeight = 0.99; // 50x enhanced: near-perfect learning
  private aggressiveness = 1.0; // 50x enhanced: maximum aggression
  
  // Bullet prediction and extreme dodge system (50x enhanced)
  private bulletPredictionRange = 20000; // 50x enhanced: screen-wide detection
  private extremeDodgeSpeed = 2500; // 50x enhanced: instantaneous dodge
  private isDodgingBullet = false;
  private dodgeTimer = 0;
  private bulletTrackingAccuracy = 0.95; // High tracking accuracy
  private predictiveFrames = 2250; // 50x enhanced: predict far into future
  
  // Advanced AI behaviors
  private missedShotCount = 0;
  private hitCount = 0;
  private playerShootingFrequency = 0;
  private lastPlayerShootTime = 0;
  private evasionPatternIndex = 0;
  private attackStrategyMode = 0; // 0: balanced, 1: aggressive, 2: evasive
  
  // Formation control system
  public controlledBy: string | null = null; // ID of boss controlling this one
  public controlledBosses: string[] = []; // IDs of bosses this one controls

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
    if (this.playerHistory.length < 5) {
      return { ...player.position };
    }

    const recentMoves = this.playerHistory.slice(0, 10);
    let avgVelX = 0;
    let avgVelY = 0;
    let totalWeight = 0;

    for (let i = 0; i < recentMoves.length - 1; i++) {
      const weight = 1 - (i / recentMoves.length);
      avgVelX += (recentMoves[i].x - recentMoves[i + 1].x) * weight;
      avgVelY += (recentMoves[i].y - recentMoves[i + 1].y) * weight;
      totalWeight += weight;
    }

    avgVelX /= totalWeight;
    avgVelY /= totalWeight;

    const predictionFrames = 30;
    return {
      x: player.position.x + avgVelX * predictionFrames,
      y: player.position.y + avgVelY * predictionFrames,
    };
  }

  private predictAndDodgeBullets(bullets: Bullet[]): { shouldDodge: boolean; dodgeDirection: Vector2D } {
    // Enhanced 10x: Multi-bullet prediction with priority system
    let highestThreat = 0;
    let bestDodgeDir = { x: 0, y: 0 };
    let shouldPerformDodge = false;

    for (const bullet of bullets) {
      const toBullet = {
        x: bullet.position.x - this.position.x,
        y: bullet.position.y - this.position.y
      };
      const bulletDist = Math.sqrt(toBullet.x ** 2 + toBullet.y ** 2);

      // Enhanced prediction range
      if (bulletDist < this.bulletPredictionRange) {
        const bulletDir = bullet.direction;
        
        // Multi-frame trajectory prediction
        const bulletSpeed = 15;
        const predictions = [];
        
        // Predict multiple frames ahead
        for (let frame = 1; frame <= this.predictiveFrames; frame++) {
          const futureBulletPos = {
            x: bullet.position.x + bulletDir.x * bulletSpeed * (frame / 60),
            y: bullet.position.y + bulletDir.y * bulletSpeed * (frame / 60)
          };
          
          const futureDistToBoss = Math.sqrt(
            (futureBulletPos.x - this.position.x) ** 2 + 
            (futureBulletPos.y - this.position.y) ** 2
          );
          
          predictions.push({ frame, distance: futureDistToBoss, position: futureBulletPos });
        }
        
        // Find minimum distance prediction
        const closestPrediction = predictions.reduce((min, pred) => 
          pred.distance < min.distance ? pred : min
        );
        
        // Calculate threat level based on distance and time
        const threatLevel = (this.bulletPredictionRange - closestPrediction.distance) / 
                           closestPrediction.frame;
        
        // Enhanced dodge threshold
        if (closestPrediction.distance < this.radius * 4 && threatLevel > highestThreat) {
          highestThreat = threatLevel;
          shouldPerformDodge = true;
          
          // Calculate optimal dodge direction with multiple factors
          const perpX = -bulletDir.y;
          const perpY = bulletDir.x;
          
          // Factor 1: Perpendicular to bullet
          // Factor 2: Away from predicted impact
          // Factor 3: Towards canvas center for safety
          const toCenter = {
            x: 400 - this.position.x,
            y: 300 - this.position.y
          };
          const centerDist = Math.sqrt(toCenter.x ** 2 + toCenter.y ** 2);
          const centerDir = {
            x: toCenter.x / centerDist,
            y: toCenter.y / centerDist
          };
          
          // Weighted dodge direction
          const perpDot = perpX * centerDir.x + perpY * centerDir.y;
          const sign = perpDot > 0 ? 1 : -1;
          
          // Add slight randomness to avoid predictability
          const randomAngle = (Math.random() - 0.5) * 0.3;
          const cos = Math.cos(randomAngle);
          const sin = Math.sin(randomAngle);
          
          bestDodgeDir = {
            x: (perpX * sign * cos - perpY * sign * sin) * 0.7 + centerDir.x * 0.3,
            y: (perpX * sign * sin + perpY * sign * cos) * 0.7 + centerDir.y * 0.3
          };
        }
      }
    }

    return { shouldDodge: shouldPerformDodge, dodgeDirection: bestDodgeDir };
  }

  private analyzePlayerPattern(player: Player): { 
    predictedPosition: Vector2D;
    confidenceLevel: number;
    movementPattern: 'linear' | 'circular' | 'erratic' | 'stationary';
  } {
    if (this.playerHistory.length < 10) {
      return {
        predictedPosition: { ...player.position },
        confidenceLevel: 0.3,
        movementPattern: 'stationary'
      };
    }

    // Analyze recent movement history
    const recentMoves = this.playerHistory.slice(0, 30);
    let totalVelX = 0;
    let totalVelY = 0;
    let velocityChanges = 0;
    let totalSpeed = 0;

    for (let i = 0; i < recentMoves.length - 1; i++) {
      const velX = recentMoves[i].x - recentMoves[i + 1].x;
      const velY = recentMoves[i].y - recentMoves[i + 1].y;
      const speed = Math.sqrt(velX ** 2 + velY ** 2);
      
      totalVelX += velX;
      totalVelY += velY;
      totalSpeed += speed;
      
      if (i > 0) {
        const prevVelX = recentMoves[i - 1].x - recentMoves[i].x;
        const prevVelY = recentMoves[i - 1].y - recentMoves[i].y;
        const velChange = Math.abs(velX - prevVelX) + Math.abs(velY - prevVelY);
        velocityChanges += velChange;
      }
    }

    const avgVelX = totalVelX / recentMoves.length;
    const avgVelY = totalVelY / recentMoves.length;
    const avgSpeed = totalSpeed / recentMoves.length;
    const avgVelChange = velocityChanges / (recentMoves.length - 1);

    // Determine movement pattern
    let pattern: 'linear' | 'circular' | 'erratic' | 'stationary' = 'stationary';
    let confidence = 0.5;

    if (avgSpeed < 0.5) {
      pattern = 'stationary';
      confidence = 0.9;
    } else if (avgVelChange < 1) {
      pattern = 'linear';
      confidence = 0.85;
    } else if (avgVelChange < 3) {
      // Check for circular pattern
      const centerX = recentMoves.reduce((sum, p) => sum + p.x, 0) / recentMoves.length;
      const centerY = recentMoves.reduce((sum, p) => sum + p.y, 0) / recentMoves.length;
      const radii = recentMoves.map(p => 
        Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
      );
      const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
      const radiusVariance = radii.reduce((sum, r) => sum + Math.abs(r - avgRadius), 0) / radii.length;
      
      if (radiusVariance < avgRadius * 0.3) {
        pattern = 'circular';
        confidence = 0.8;
      } else {
        pattern = 'erratic';
        confidence = 0.6;
      }
    } else {
      pattern = 'erratic';
      confidence = 0.5;
    }

    // Predict based on pattern
    let predictionFrames = this.predictiveFrames;
    let predictedPos = { ...player.position };

    switch (pattern) {
      case 'linear':
        predictedPos = {
          x: player.position.x + avgVelX * predictionFrames,
          y: player.position.y + avgVelY * predictionFrames
        };
        break;
      case 'circular':
        // Predict circular motion
        const angle = Math.atan2(avgVelY, avgVelX);
        const nextAngle = angle + (avgSpeed / 50) * predictionFrames;
        const centerX = recentMoves.reduce((sum, p) => sum + p.x, 0) / recentMoves.length;
        const centerY = recentMoves.reduce((sum, p) => sum + p.y, 0) / recentMoves.length;
        const radius = Math.sqrt(
          (player.position.x - centerX) ** 2 + 
          (player.position.y - centerY) ** 2
        );
        predictedPos = {
          x: centerX + Math.cos(nextAngle) * radius,
          y: centerY + Math.sin(nextAngle) * radius
        };
        break;
      case 'erratic':
        // Use weighted average with decay
        predictedPos = {
          x: player.position.x + avgVelX * predictionFrames * 0.5,
          y: player.position.y + avgVelY * predictionFrames * 0.5
        };
        break;
      case 'stationary':
        predictedPos = { ...player.position };
        break;
    }

    return {
      predictedPosition: predictedPos,
      confidenceLevel: confidence,
      movementPattern: pattern
    };
  }

  private selectAttackStrategy(player: Player, distance: number, playerScore: number): void {
    // Dynamic strategy selection based on multiple factors
    const healthRatio = this.health / this.maxHealth;
    const shieldRatio = this.shield / this.maxShield;
    
    if (healthRatio < 0.3 && shieldRatio === 0) {
      // Low health: ultra-aggressive
      this.attackStrategyMode = 1;
      this.aggressiveness = 1.0;
    } else if (distance < 100 && playerScore > 100) {
      // Close to high-score player: aggressive
      this.attackStrategyMode = 1;
      this.aggressiveness = 0.95;
    } else if (this.dodgeSuccessCount > 5 && healthRatio > 0.7) {
      // Successful dodges and healthy: aggressive
      this.attackStrategyMode = 1;
      this.aggressiveness = 0.9;
    } else if (healthRatio < 0.5) {
      // Medium health: balanced with evasion
      this.attackStrategyMode = 2;
      this.aggressiveness = 0.7;
    } else {
      // Default: balanced
      this.attackStrategyMode = 0;
      this.aggressiveness = 0.85;
    }
  }

  public updateAI(
    player: Player,
    bullets: Bullet[],
    allBosses: EliteEnemy[],
    deltaTime: number,
    canvas: HTMLCanvasElement,
    playerScore: number
  ) {
    this.recordPlayerPosition(player);
    
    // Calculate distance to player
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    
    // Select attack strategy dynamically
    this.selectAttackStrategy(player, distance, playerScore);

    // PRIORITY 1: Kill Player - High aggression (判定1-10)
    this.targetPriority = 10; // Always max priority to kill player
    
    // Update dodge timer
    if (this.isDodgingBullet) {
      this.dodgeTimer += deltaTime;
      if (this.dodgeTimer >= 300) { // 300ms extreme dodge
        this.isDodgingBullet = false;
        this.dodgeTimer = 0;
      }
    }

    // PRIORITY 0: Extreme bullet dodge - 10x enhanced, faster than player
    const dodgeResult = this.predictAndDodgeBullets(bullets);
    if (dodgeResult.shouldDodge && !this.isDodgingBullet) {
      this.isDodgingBullet = true;
      this.dodgeTimer = 0;
      this.evasionPatternIndex = (this.evasionPatternIndex + 1) % 3;
      
      const dodgeDir = dodgeResult.dodgeDirection;
      const magnitude = Math.sqrt(dodgeDir.x ** 2 + dodgeDir.y ** 2);
      
      // Extreme dodge speed with pattern variation
      let dodgeSpeed = this.extremeDodgeSpeed;
      if (this.evasionPatternIndex === 1) {
        // Zigzag pattern
        dodgeSpeed *= 1.1;
      } else if (this.evasionPatternIndex === 2) {
        // Burst pattern
        dodgeSpeed *= 1.2;
      }
      
      this.velocity.x = (dodgeDir.x / magnitude) * dodgeSpeed;
      this.velocity.y = (dodgeDir.y / magnitude) * dodgeSpeed;
      
      // Multi-step dodge for extreme situations
      const steps = 2;
      for (let i = 0; i < steps; i++) {
        this.position.x += this.velocity.x / steps;
        this.position.y += this.velocity.y / steps;
        
        // Keep in bounds during each step
        const padding = this.radius + 5;
        this.position.x = Math.max(padding, Math.min(canvas.width - padding, this.position.x));
        this.position.y = Math.max(padding, Math.min(canvas.height - padding, this.position.y));
      }
      
      this.dodgeSuccessCount++;
      
      return; // Skip normal movement during extreme dodge
    }
    
    // Adaptive speed - faster with player score (判定51-60)
    let speedMultiplier = 1 + (playerScore / 500) * 0.5; // Up to 50% faster
    if (playerScore >= 200) speedMultiplier *= 1.3; // 判定54
    speedMultiplier *= this.aggressiveness; // Apply aggression

    // Formation logic: One boss attacks, others circle (判定41-50)
    const inFormationCount = allBosses.filter(b => b.isInFormation).length;
    if (this.isInFormation && inFormationCount > 0) {
      const formationRadius = 350;
      const angleStep = (Math.PI * 2) / allBosses.length;
      const targetAngle = angleStep * this.formationIndex + (Date.now() * 0.0005);
      const targetX = player.position.x + Math.cos(targetAngle) * formationRadius;
      const targetY = player.position.y + Math.sin(targetAngle) * formationRadius;
      
      const tdx = targetX - this.position.x;
      const tdy = targetY - this.position.y;
      const tdist = Math.sqrt(tdx ** 2 + tdy ** 2);
      
      if (tdist > 10) {
        const moveSpeed = this.baseSpeed * 1.3 * speedMultiplier;
        this.velocity.x = (tdx / tdist) * moveSpeed;
        this.velocity.y = (tdy / tdist) * moveSpeed;
      }
    } else {
      // AGGRESSIVE prediction - prioritize killing (判定11-20)
      // Use advanced pattern analysis
      const analysis = this.analyzePlayerPattern(player);
      const predicted = analysis.predictedPosition;
      const actual = player.position;
      
      // Adjust learning weight based on confidence
      const dynamicLearning = this.learningWeight * analysis.confidenceLevel;
      const targetX = predicted.x * dynamicLearning + actual.x * (1 - dynamicLearning);
      const targetY = predicted.y * dynamicLearning + actual.y * (1 - dynamicLearning);

      // Reduced evasion - aggression over survival (判定21-30)
      let evasionFactor = 0;
      if (this.shield <= 0 && this.health <= 2) {
        evasionFactor = 0.2; // Low evasion, prioritize attack
        speedMultiplier *= 1.3; // Faster when low health
      }

      // Dodge bullets (判定21-24)
      for (const bullet of bullets) {
        const toBullet = {
          x: bullet.position.x - this.position.x,
          y: bullet.position.y - this.position.y
        };
        const bulletDist = Math.sqrt(toBullet.x ** 2 + toBullet.y ** 2);
        
        if (bulletDist < 150) {
          const perpX = -bullet.direction.y;
          const perpY = bullet.direction.x;
          this.velocity.x += perpX * 2;
          this.velocity.y += perpY * 2;
          this.dodgeSuccessCount++;
        }
      }

      const dx = targetX - this.position.x;
      const dy = targetY - this.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (distance > 5) {
        const zigzagOffset = Math.sin(Date.now() * 0.003) * 40;
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        this.velocity.x = ((dx / distance) * this.baseSpeed + perpX * zigzagOffset * 0.08) * speedMultiplier;
        this.velocity.y = ((dy / distance) * this.baseSpeed + perpY * zigzagOffset * 0.08) * speedMultiplier;
        
        if (evasionFactor > 0) {
          this.velocity.x *= (1 - evasionFactor);
          this.velocity.y *= (1 - evasionFactor);
        }
      }
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Keep in bounds
    const padding = this.radius + 5;
    this.position.x = Math.max(padding, Math.min(canvas.width - padding, this.position.x));
    this.position.y = Math.max(padding, Math.min(canvas.height - padding, this.position.y));
  }

  public takeDamage(amount: number): boolean {
    // Shield absorbs damage first
    if (this.shield > 0) {
      this.shield = Math.max(0, this.shield - amount);
      this.lastHitTime = Date.now();
      return false; // Not dead, shield absorbed damage
    }
    
    this.health = Math.max(0, this.health - amount);
    this.lastHitTime = Date.now();
    return this.health <= 0;
  }

  public render(ctx: CanvasRenderingContext2D, playerPosition?: Vector2D, controlledBosses?: EliteEnemy[]) {
    const x = this.position.x;
    const y = this.position.y;

    // Render pink control lines to controlled bosses
    if (controlledBosses && controlledBosses.length > 0) {
      ctx.save();
      ctx.strokeStyle = "hsla(330, 100%, 60%, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.shadowColor = "hsl(330, 100%, 50%)";
      ctx.shadowBlur = 10;
      
      controlledBosses.forEach(boss => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(boss.position.x, boss.position.y);
        ctx.stroke();
      });
      
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Render tech dashed line to player (if player position provided)
    if (playerPosition) {
      ctx.save();
      ctx.strokeStyle = "hsla(0, 100%, 60%, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.shadowColor = "hsl(0, 100%, 50%)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(playerPosition.x, playerPosition.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Shield effect when active
    if (this.shield > 0) {
      const shieldGlow = ctx.createRadialGradient(x, y, this.radius, x, y, this.radius * 4);
      shieldGlow.addColorStop(0, "hsla(200, 100%, 70%, 0.4)");
      shieldGlow.addColorStop(0.5, "hsla(200, 100%, 60%, 0.25)");
      shieldGlow.addColorStop(1, "transparent");
      ctx.fillStyle = shieldGlow;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * 4, 0, Math.PI * 2);
      ctx.fill();

      // Shield ring
      ctx.strokeStyle = `hsla(200, 100%, 70%, ${(this.shield / this.maxShield) * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * 2.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer glow - Red for Boss
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 5);
    outerGlow.addColorStop(0, "hsla(0, 100%, 65%, 0.6)");
    outerGlow.addColorStop(0.3, "hsla(0, 100%, 60%, 0.4)");
    outerGlow.addColorStop(0.7, "hsla(0, 100%, 55%, 0.2)");
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 5, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    const midGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2.5);
    midGlow.addColorStop(0, "hsla(0, 100%, 75%, 0.7)");
    midGlow.addColorStop(0.5, "hsla(0, 100%, 65%, 0.4)");
    midGlow.addColorStop(1, "transparent");
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    coreGradient.addColorStop(0, "hsl(0, 100%, 75%)");
    coreGradient.addColorStop(0.5, "hsl(0, 100%, 65%)");
    coreGradient.addColorStop(0.8, "hsl(0, 100%, 60%)");
    coreGradient.addColorStop(1, "hsl(0, 100%, 50%)");
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
    highlight.addColorStop(0, "hsla(0, 100%, 95%, 0.7)");
    highlight.addColorStop(0.5, "hsla(0, 100%, 90%, 0.4)");
    highlight.addColorStop(1, "transparent");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Shield bar (if active)
    if (this.shield > 0) {
      const barWidth = this.radius * 3.5;
      const barHeight = 4;
      const shieldBarY = y + this.radius * 2.8;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(x - barWidth / 2, shieldBarY, barWidth, barHeight);

      const shieldPercent = this.shield / this.maxShield;
      ctx.fillStyle = "hsl(200, 100%, 65%)";
      ctx.fillRect(x - barWidth / 2, shieldBarY, barWidth * shieldPercent, barHeight);
    }

    // Health bar
    const healthBarWidth = this.radius * 3.5;
    const healthBarHeight = 4;
    const healthBarY = y + this.radius * 3.5;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(x - healthBarWidth / 2, healthBarY, healthBarWidth, healthBarHeight);

    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? "hsl(120, 100%, 50%)" : healthPercent > 0.25 ? "hsl(40, 100%, 50%)" : "hsl(0, 100%, 50%)";
    ctx.fillRect(x - healthBarWidth / 2, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
  }
}
