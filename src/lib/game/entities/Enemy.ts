import { Vector2D } from "../types";
import { Player } from "./Player";
import { Bullet } from "./Bullet";
import { AIStats } from "../ai/AIEvolution";

interface MovementPattern {
  type: "dodge" | "flank" | "retreat" | "aggressive" | "predict";
  duration: number;
}

export class Enemy {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public radius: number;
  public health = 10; // New health system
  public commandedTarget: Vector2D | null = null; // Boss指令目标
  public speedMultiplier = 1.0; // 指令速度加成
  private baseSpeed = 243; // 50x enhanced: 4.86 * 50 = 243
  private currentPattern: MovementPattern = { type: "aggressive", duration: 0 };
  private patternTimer = 0;
  private playerHistory: Vector2D[] = [];
  private maxHistoryLength = 50; // More history for better learning
  private dodgeDirection: Vector2D = { x: 0, y: 0 };
  private learningWeight = 0.95; // 50x enhanced: near-perfect learning from start
  private survivalTime = 0;
  private attackPatterns: Map<string, number> = new Map(); // Track player attack patterns
  public lookAtTarget: Vector2D | null = null; // What the enemy is looking at
  public aiStats: AIStats | null = null; // AI statistics
  private lastDodgeTime = 0;
  private nearbyEntities: Array<{ type: "player" | "bullet"; position: Vector2D; distance: number }> = [];
  public targetPath: Vector2D[] = []; // Path to player for rendering
  public hasShield = true; // Each AI gets one shield
  private shieldActivationTime = 0;
  private shieldDecisionWindow = 5000; // 5 seconds to decide
  private isShieldActive = false;
  
  // New dodge ability system
  private dodgeAbilityReady = true;
  private dodgeAbilityCooldown = 5000; // 5 seconds cooldown
  private lastDodgeAbilityTime = 0;
  private isDodging = false;
  private dodgeStartPos: Vector2D | null = null;

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

    // Calculate player's movement velocity with weighted recent history
    const recentMoves = this.playerHistory.slice(0, 8); // Look at more history
    let avgVelX = 0;
    let avgVelY = 0;
    let totalWeight = 0;

    for (let i = 0; i < recentMoves.length - 1; i++) {
      // More recent movements have higher weight
      const weight = 1 - (i / recentMoves.length);
      avgVelX += (recentMoves[i].x - recentMoves[i + 1].x) * weight;
      avgVelY += (recentMoves[i].y - recentMoves[i + 1].y) * weight;
      totalWeight += weight;
    }

    avgVelX /= totalWeight;
    avgVelY /= totalWeight;

    // Predict future position with acceleration consideration
    const predictionFrames = 15;
    const predictedX = player.position.x + avgVelX * predictionFrames;
    const predictedY = player.position.y + avgVelY * predictionFrames;

    // Increase learning weight over time (enemy gets smarter)
    this.learningWeight = Math.min(0.6, this.learningWeight + 0.001);

    return {
      x: predictedX,
      y: predictedY,
    };
  }

  private shouldDodgeBullet(bullets: Bullet[]): Bullet | null {
    const evolutionBonus = this.aiStats ? (1 + this.aiStats.evolutionLevel * 7.5) : 50; // 50x enhanced
    const dangerRadius = 10000 * evolutionBonus; // 50x enhanced: massive detection range
    
    for (const bullet of bullets) {
      const toEnemy = {
        x: this.position.x - bullet.position.x,
        y: this.position.y - bullet.position.y,
      };
      
      const distance = Math.sqrt(toEnemy.x ** 2 + toEnemy.y ** 2);
      
      // Enhanced detection - include glow radius and predict bullet path
      if (distance < this.radius * 4.5 + dangerRadius) {
        const bulletDir = bullet.direction;
        const dot = (toEnemy.x * bulletDir.x + toEnemy.y * bulletDir.y) / distance;
        
        if (dot > 0.3) { // Earlier detection
          this.lookAtTarget = { ...bullet.position };
          
          // NEW: Dodge ability - teleport away from bullet
          const now = Date.now();
          if (this.dodgeAbilityReady && distance < 150 && now - this.lastDodgeAbilityTime >= this.dodgeAbilityCooldown) {
            this.activateDodgeAbility(bullet);
            this.lastDodgeAbilityTime = now;
            this.dodgeAbilityReady = false;
            // Reset after cooldown
            setTimeout(() => {
              this.dodgeAbilityReady = true;
            }, this.dodgeAbilityCooldown);
          }
          
          // Shield decision logic - activate if bullet is very close
          if (this.hasShield && !this.isShieldActive && distance < 100) {
            if (now - this.shieldActivationTime < this.shieldDecisionWindow) {
              this.isShieldActive = true;
              console.log(`🛡️ AI ${this.id.substring(0, 6)} activated shield!`);
            }
          }
          
          if (now - this.lastDodgeTime > 500) {
            console.log(`🎯 AI ${this.id.substring(0, 6)} [Lv${this.aiStats?.evolutionLevel || 0}] detected danger at ${distance.toFixed(1)}px!`);
            this.lastDodgeTime = now;
          }
          
          return bullet;
        }
      }
    }
    
    return null;
  }
  
  private activateDodgeAbility(bullet: Bullet) {
    // Teleport perpendicular to bullet direction
    const bulletDir = bullet.direction;
    const perpendicular = {
      x: -bulletDir.y,
      y: bulletDir.x,
    };
    
    // Choose random side
    const side = Math.random() > 0.5 ? 1 : -1;
    const dodgeDistance = 120;
    
    this.dodgeStartPos = { ...this.position };
    this.position.x += perpendicular.x * dodgeDistance * side;
    this.position.y += perpendicular.y * dodgeDistance * side;
    this.isDodging = true;
    
    console.log(`⚡ AI ${this.id.substring(0, 6)} DODGED! Cooldown: 5s`);
    
    // Visual effect timeout
    setTimeout(() => {
      this.isDodging = false;
      this.dodgeStartPos = null;
    }, 200);
  }
  
  public checkShieldHit(bullet: Bullet): boolean {
    if (!this.isShieldActive) return false;
    
    const dx = bullet.position.x - this.position.x;
    const dy = bullet.position.y - this.position.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    
    // Shield radius slightly larger than enemy
    if (distance < this.radius * 6) {
      console.log(`🛡️💥 AI ${this.id.substring(0, 6)} shield blocked bullet!`);
      this.hasShield = false;
      this.isShieldActive = false;
      return true;
    }
    
    return false;
  }
  
  private recordAttackPattern(player: Player, bullet: Bullet | null) {
    if (!bullet) return;
    
    // Create pattern signature based on player position and bullet direction
    const pattern = `${Math.floor(player.position.x / 100)},${Math.floor(player.position.y / 100)},${Math.floor(bullet.direction.x * 10)},${Math.floor(bullet.direction.y * 10)}`;
    
    const count = this.attackPatterns.get(pattern) || 0;
    this.attackPatterns.set(pattern, count + 1);
    
    if (count > 0 && count % 3 === 0) {
      console.log(`🧠 Enemy learned pattern: Player at (${Math.floor(player.position.x)},${Math.floor(player.position.y)}) shoots at angle ${Math.atan2(bullet.direction.y, bullet.direction.x).toFixed(2)} - seen ${count + 1} times`);
    }
  }

  private calculateFlankingPosition(player: Player, enemies: Enemy[]): Vector2D {
    // Try to position at a perpendicular angle to player
    const toPlayer = {
      x: player.position.x - this.position.x,
      y: player.position.y - this.position.y,
    };
    
    const distance = Math.sqrt(toPlayer.x ** 2 + toPlayer.y ** 2);
    const normalized = {
      x: toPlayer.x / distance,
      y: toPlayer.y / distance,
    };

    // Perpendicular vector
    const perpendicular = {
      x: -normalized.y,
      y: normalized.x,
    };

    // Check if other enemies are on the other side
    let otherSideCount = 0;
    for (const enemy of enemies) {
      if (enemy === this) continue;
      
      const toOther = {
        x: enemy.position.x - player.position.x,
        y: enemy.position.y - player.position.y,
      };
      
      const cross = perpendicular.x * toOther.y - perpendicular.y * toOther.x;
      if (cross < 0) otherSideCount++;
    }

    // Go to the side with fewer enemies
    const flankDir = otherSideCount > enemies.length / 2 ? -1 : 1;
    
    return {
      x: player.position.x + perpendicular.x * 150 * flankDir,
      y: player.position.y + perpendicular.y * 150 * flankDir,
    };
  }

  private selectPattern(player: Player, bullets: Bullet[], enemies: Enemy[]): MovementPattern {
    const distanceToPlayer = Math.sqrt(
      (player.position.x - this.position.x) ** 2 +
      (player.position.y - this.position.y) ** 2
    );

    // Detect nearby entities (600px range)
    this.detectNearbyEntities(player, bullets, 600);

    // High priority: dodge bullets
    const dangerousBullet = this.shouldDodgeBullet(bullets);
    if (dangerousBullet) {
      this.recordAttackPattern(player, dangerousBullet);
      return { type: "dodge", duration: 600 };
    }

    // If very close, retreat immediately
    if (distanceToPlayer < 80) {
      return { type: "retreat", duration: 1000 };
    }

    // If medium-close distance, retreat
    if (distanceToPlayer < 150) {
      return { type: "retreat", duration: 700 };
    }

    // If medium distance and other enemies nearby, try flanking
    if (distanceToPlayer < 350 && enemies.length > 1) {
      return { type: "flank", duration: 1500 };
    }
    
    // New: Enhanced prediction mode for evolved AI
    if (this.aiStats && this.aiStats.evolutionLevel >= 2 && distanceToPlayer < 400) {
      return { type: "predict", duration: 1800 };
    }

    // Default: aggressive approach (but cautious)
    return { type: "aggressive", duration: 1200 };
  }
  
  private detectNearbyEntities(player: Player, bullets: Bullet[], range: number) {
    this.nearbyEntities = [];
    
    const playerDist = Math.sqrt(
      (player.position.x - this.position.x) ** 2 +
      (player.position.y - this.position.y) ** 2
    );
    if (playerDist <= range) {
      this.nearbyEntities.push({
        type: "player",
        position: player.position,
        distance: playerDist,
      });
    }
    
    for (const bullet of bullets) {
      const bulletDist = Math.sqrt(
        (bullet.position.x - this.position.x) ** 2 +
        (bullet.position.y - this.position.y) ** 2
      );
      if (bulletDist <= range) {
        this.nearbyEntities.push({
          type: "bullet",
          position: bullet.position,
          distance: bulletDist,
        });
      }
    }
    
    if (this.nearbyEntities.length > 2 && Math.random() < 0.02) {
      console.log(`🔍 AI ${this.id.substring(0, 6)} [Lv${this.aiStats?.evolutionLevel || 0}] scanned ${this.nearbyEntities.length} entities in 600px range`);
    }
  }
  
  // Calculate optimal attack angle considering team coverage
  public calculateTeamAttackAngle(player: Player, otherEnemies: Enemy[]): number {
    const toPlayer = {
      x: player.position.x - this.position.x,
      y: player.position.y - this.position.y,
    };
    const baseAngle = Math.atan2(toPlayer.y, toPlayer.x);
    
    // Find gaps in team coverage
    const coverageMap = new Array(12).fill(0); // 12 sectors (30 degrees each)
    
    for (const other of otherEnemies) {
      if (other === this) continue;
      
      const otherToPlayer = {
        x: player.position.x - other.position.x,
        y: player.position.y - other.position.y,
      };
      const otherAngle = Math.atan2(otherToPlayer.y, otherToPlayer.x);
      const sector = Math.floor(((otherAngle + Math.PI) / (Math.PI * 2)) * 12);
      coverageMap[sector]++;
    }
    
    // Find least covered sector
    let minCoverage = Infinity;
    let bestSector = 0;
    for (let i = 0; i < 12; i++) {
      if (coverageMap[i] < minCoverage) {
        minCoverage = coverageMap[i];
        bestSector = i;
      }
    }
    
    const targetAngle = (bestSector * (Math.PI * 2) / 12) - Math.PI;
    
    if (Math.random() < 0.03) {
      console.log(`🎯 AI ${this.id.substring(0, 6)} targeting sector ${bestSector} (coverage: ${minCoverage})`);
    }
    
    return targetAngle;
  }
  
  // Calculate path to player for rendering
  private calculatePathToPlayer(player: Player) {
    this.targetPath = [];
    const steps = 10;
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.targetPath.push({
        x: this.position.x + (player.position.x - this.position.x) * t,
        y: this.position.y + (player.position.y - this.position.y) * t,
      });
    }
  }

  public updateAI(
    player: Player,
    bullets: Bullet[],
    enemies: Enemy[],
    deltaTime: number,
    canvas: HTMLCanvasElement
  ) {
    this.recordPlayerPosition(player);
    this.survivalTime += deltaTime;

    // Calculate path to player for rendering
    this.calculatePathToPlayer(player);

    // Default look at player
    this.lookAtTarget = { ...player.position };
    
    // Track shield activation window
    if (this.hasShield && !this.isShieldActive) {
      this.shieldActivationTime = Date.now();
    }

    // Enemies get smarter the longer they survive - 50x enhanced
    const experienceBonus = Math.min(110, 50 + (this.survivalTime / 120)); // 50x enhanced bonus

    // Increase learning weight faster with evolution - 50x enhanced
    const evolutionBonus = this.aiStats ? (1 + this.aiStats.evolutionLevel * 5) : 50; // 50x enhanced
    this.learningWeight = Math.min(0.99, this.learningWeight + 0.15 * evolutionBonus); // 50x enhanced learning rate

    // Update pattern selection
    this.patternTimer += deltaTime;
    if (this.patternTimer >= this.currentPattern.duration) {
      this.currentPattern = this.selectPattern(player, bullets, enemies);
      this.patternTimer = 0;
    }

    let targetX = this.position.x;
    let targetY = this.position.y;
    let speedMultiplier = 1 * experienceBonus;

    switch (this.currentPattern.type) {
      case "dodge": {
        const dangerousBullet = this.shouldDodgeBullet(bullets);
        if (dangerousBullet) {
          // Calculate perpendicular dodge direction
          const bulletDir = dangerousBullet.direction;
          const perpendicular = {
            x: -bulletDir.y,
            y: bulletDir.x,
          };
          
          // Choose dodge direction that keeps us further from player
          const toPlayer = {
            x: player.position.x - this.position.x,
            y: player.position.y - this.position.y,
          };
          
          // Dot product to determine which perpendicular direction is better
          const dot1 = perpendicular.x * toPlayer.x + perpendicular.y * toPlayer.y;
          const sign = dot1 > 0 ? -1 : 1; // Go away from player
          
          this.dodgeDirection = {
            x: perpendicular.x * sign,
            y: perpendicular.y * sign,
          };
          
          targetX = this.position.x + this.dodgeDirection.x * 120;
          targetY = this.position.y + this.dodgeDirection.y * 120;
          speedMultiplier = 2.0; // Dodge very quickly
        }
        break;
      }

      case "retreat": {
        // Move away from player
        const awayFromPlayer = {
          x: this.position.x - player.position.x,
          y: this.position.y - player.position.y,
        };
        const distance = Math.sqrt(awayFromPlayer.x ** 2 + awayFromPlayer.y ** 2);
        targetX = this.position.x + (awayFromPlayer.x / distance) * 150;
        targetY = this.position.y + (awayFromPlayer.y / distance) * 150;
        speedMultiplier = 1.5;
        break;
      }

      case "flank": {
        const flankPos = this.calculateFlankingPosition(player, enemies);
        targetX = flankPos.x;
        targetY = flankPos.y;
        speedMultiplier = 1.2;
        break;
      }
      
      case "predict": {
        // Enhanced prediction mode for evolved AI
        const predicted = this.predictPlayerPosition(player);
        const actual = player.position;
        
        // Higher learning weight for evolved AI
        const enhancedWeight = Math.min(0.85, this.learningWeight + (this.aiStats?.evolutionLevel || 0) * 0.08);
        
        // Predict even further ahead
        const futurePrediction = {
          x: predicted.x + (predicted.x - actual.x) * 0.5,
          y: predicted.y + (predicted.y - actual.y) * 0.5,
        };
        
        targetX = futurePrediction.x * enhancedWeight + actual.x * (1 - enhancedWeight);
        targetY = futurePrediction.y * enhancedWeight + actual.y * (1 - enhancedWeight);
        speedMultiplier = 1.1;
        break;
      }

      case "aggressive": {
        // Team-based attack with coverage analysis
        const teamAngle = this.calculateTeamAttackAngle(player, enemies);
        const distance = 180; // Optimal attack distance
        
        const teamTargetX = player.position.x + Math.cos(teamAngle) * distance;
        const teamTargetY = player.position.y + Math.sin(teamAngle) * distance;
        
        // Blend team position with prediction
        const predicted = this.predictPlayerPosition(player);
        targetX = teamTargetX * 0.6 + predicted.x * 0.4;
        targetY = teamTargetY * 0.6 + predicted.y * 0.4;
        speedMultiplier = 1.1;
        break;
      }
    }

    // Move towards target
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance > 5) {
      this.velocity.x = (dx / distance) * this.baseSpeed * speedMultiplier;
      this.velocity.y = (dy / distance) * this.baseSpeed * speedMultiplier;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Keep in bounds - don't allow wrapping
    const padding = this.radius + 5;
    this.position.x = Math.max(padding, Math.min(canvas.width - padding, this.position.x));
    this.position.y = Math.max(padding, Math.min(canvas.height - padding, this.position.y));
  }

  public render(ctx: CanvasRenderingContext2D) {
    const x = this.position.x;
    const y = this.position.y;
    
    // Render dodge trail if dodging
    if (this.isDodging && this.dodgeStartPos) {
      ctx.save();
      ctx.strokeStyle = "hsla(340, 100%, 70%, 0.6)";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(this.dodgeStartPos.x, this.dodgeStartPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Afterimage at start position
      const afterimageGradient = ctx.createRadialGradient(
        this.dodgeStartPos.x, this.dodgeStartPos.y, 0,
        this.dodgeStartPos.x, this.dodgeStartPos.y, this.radius * 3
      );
      afterimageGradient.addColorStop(0, "hsla(340, 100%, 70%, 0.4)");
      afterimageGradient.addColorStop(1, "transparent");
      ctx.fillStyle = afterimageGradient;
      ctx.beginPath();
      ctx.arc(this.dodgeStartPos.x, this.dodgeStartPos.y, this.radius * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Render targeting line to player
    if (this.targetPath.length > 0) {
      ctx.save();
      ctx.strokeStyle = `hsla(340, 100%, 50%, 0.15)`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (const point of this.targetPath) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    
    // Render shield if active
    if (this.isShieldActive) {
      const shieldGradient = ctx.createRadialGradient(x, y, this.radius * 4, x, y, this.radius * 6);
      shieldGradient.addColorStop(0, "hsla(200, 100%, 60%, 0.3)");
      shieldGradient.addColorStop(0.7, "hsla(200, 100%, 70%, 0.5)");
      shieldGradient.addColorStop(1, "hsla(200, 100%, 80%, 0.7)");
      ctx.fillStyle = shieldGradient;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Shield ring
      ctx.strokeStyle = "hsla(200, 100%, 90%, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outermost glow (largest) - red - ENHANCED
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 4.5);
    outerGlow.addColorStop(0, "hsla(340, 100%, 65%, 0.5)");
    outerGlow.addColorStop(0.3, "hsla(340, 100%, 60%, 0.3)");
    outerGlow.addColorStop(0.7, "hsla(340, 100%, 55%, 0.15)");
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    const midGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
    midGlow.addColorStop(0, "hsla(340, 100%, 75%, 0.6)");
    midGlow.addColorStop(0.5, "hsla(340, 100%, 65%, 0.3)");
    midGlow.addColorStop(1, "transparent");
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    coreGradient.addColorStop(0, "hsl(340, 100%, 85%)");
    coreGradient.addColorStop(0.5, "hsl(340, 100%, 70%)");
    coreGradient.addColorStop(0.8, "hsl(340, 100%, 60%)");
    coreGradient.addColorStop(1, "hsl(340, 100%, 50%)");
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
    highlight.addColorStop(0, "hsla(340, 100%, 95%, 0.7)");
    highlight.addColorStop(0.5, "hsla(340, 100%, 90%, 0.4)");
    highlight.addColorStop(1, "transparent");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye (pupil) that looks at target
    if (this.lookAtTarget) {
      const dx = this.lookAtTarget.x - x;
      const dy = this.lookAtTarget.y - y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const maxOffset = this.radius * 0.3;
      
      const eyeX = x + (dx / distance) * Math.min(maxOffset, distance * 0.01);
      const eyeY = y + (dy / distance) * Math.min(maxOffset, distance * 0.01);
      
      // White of eye
      ctx.fillStyle = "hsla(0, 0%, 100%, 0.9)";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, this.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // Pupil
      ctx.fillStyle = "hsla(0, 0%, 10%, 0.95)";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, this.radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
