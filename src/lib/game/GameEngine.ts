import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { AssassinEnemy } from "./entities/AssassinEnemy";
import { EliteEnemy } from "./entities/EliteEnemy";
import { Defender } from "./entities/Defender";
import { Bullet } from "./entities/Bullet";
import { Particle } from "./entities/Particle";
import { Orbiter } from "./entities/Orbiter";
import { TacticalAnalyzer } from "./ai/TacticalAnalyzer";
import { CommandSystem } from "./ai/CommandSystem";
import { TeamCoordinator } from "./ai/TeamCoordinator";
import { DifficultyManager } from "./ai/DifficultyManager";
import { PlayerAnalyzer } from "./ai/PlayerAnalyzer";
import { GameReview } from "./ai/GameReview";
import { CombatCoordinator } from "./ai/CombatCoordinator";
import { GlobalStats } from "./GlobalStats";
import { Vector2D } from "./types";

interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  onEnemyDestroyed: () => void;
  onAutoAimChange: (enabled: boolean) => void;
  onDefenderSlowChange: (slowPercent: number) => void;
  onAILog: (log: { timestamp: string; message: string; type: "info" | "success" | "warning" | "error" }) => void;
  onPlayerStatsUpdate: (stats: { speed: number; position: Vector2D }) => void;
  onTargetUpdate: (target: Vector2D | null) => void;
  onAICoachTip: (tip: { message: string; type: "positive" | "warning" | "info" | "critical" }) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private assassins: AssassinEnemy[] = [];
  private bosses: EliteEnemy[] = [];
  private defenders: Defender[] = [];
  private orbiters: Orbiter[] = [];
  private commandSystem: CommandSystem = new CommandSystem();
  private teamCoordinator: TeamCoordinator = new TeamCoordinator();
  private difficultyManager: DifficultyManager = new DifficultyManager();
  private playerAnalyzer: PlayerAnalyzer = new PlayerAnalyzer();
  private gameReview: GameReview = new GameReview();
  private combatCoordinator: CombatCoordinator;
  private maxBosses = 6;
  private bossesKilledInWave = 0;
  private maxEnemies = 6;
  private enemySpawnTimer = 0;
  private enemySpawnInterval = 2000;
  private maxAssassins = 0;
  private assassinSpawnTimer = 0;
  private assassinSpawnInterval = 8000;
  
  // Session statistics
  private sessionStats = {
    shotsFired: 0,
    shotsHit: 0,
    startHealth: 100
  };
  
  // Formation debuff system
  private formationDebuffActive = false;
  private formationDebuffMultiplier = 1.0;
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mousePosition: Vector2D = { x: 0, y: 0 };
  private hoveredBoss: EliteEnemy | null = null;
  private currentTarget: Vector2D | null = null;
  private isMouseDown = false;
  private lastShotTime = 0;
  private baseShootCooldown = 25; // 300%+ shooting speed
  private shootCooldown = 25;
  private score = 0;
  private callbacks: GameCallbacks;
  private bossSpawnTimer = 0;
  private bossSpawnInterval = 4000; // Spawn boss every 4 seconds
  private gameOver = false;
  private lastFrameTime: number = 0;
  private playerStatsUpdateTimer = 0;
  private nextWaveScheduled = false;
  private waveSize = 6;
  private aiCoachTipTimer = 0;
  private aiCoachTipInterval = 5000; // 每5秒一次AI提示
  private gameStartDelay = 3000; // 开局3秒延迟
  private gameStartTime = 0;
  private hasGameStarted = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.callbacks = callbacks;
    
    this.combatCoordinator = new CombatCoordinator(canvas.width, canvas.height);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.player = new Player(
      { x: canvas.width / 2, y: canvas.height / 2 },
      3 // 50% smaller
    );

    this.setupEventListeners();
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    });

    this.canvas.addEventListener("mousedown", () => {
      this.isMouseDown = true;
    });

    this.canvas.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });
    
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyA") {
        e.preventDefault();
        this.player.toggleAutoAim();
        this.callbacks.onAutoAimChange(this.player.autoAimMode);
      }
      if (e.code === "KeyQ") {
        e.preventDefault();
        this.player.toggleAIAutoPilot();
        this.logAI(`AI Auto-pilot: ${this.player.aiAutoPilot ? "ON" : "OFF"}`, this.player.aiAutoPilot ? "success" : "info");
      }
    });
  }

  private spawnRandomEnemy() {
    const roll = Math.random();
    
    if (roll < 0.4) {
      // 40% Boss
      this.spawnBoss();
    } else if (roll < 0.7) {
      // 30% 刺客
      this.spawnAssassin();
    } else {
      // 30% 普通敌人
      this.spawnEnemy();
    }
  }

  private spawnEnemy() {
    if (this.enemies.length >= this.maxEnemies) return;

    const radius = 3; // 50% smaller
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0:
        x = Math.random() * this.canvas.width;
        y = -radius * 3;
        break;
      case 1:
        x = this.canvas.width + radius * 3;
        y = Math.random() * this.canvas.height;
        break;
      case 2:
        x = Math.random() * this.canvas.width;
        y = this.canvas.height + radius * 3;
        break;
      default:
        x = -radius * 3;
        y = Math.random() * this.canvas.height;
    }

    this.enemies.push(new Enemy({ x, y }, radius));
  }

  private spawnDefender() {
    const radius = 3;
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0:
        x = Math.random() * this.canvas.width;
        y = -radius * 3;
        break;
      case 1:
        x = this.canvas.width + radius * 3;
        y = Math.random() * this.canvas.height;
        break;
      case 2:
        x = Math.random() * this.canvas.width;
        y = this.canvas.height + radius * 3;
        break;
      default:
        x = -radius * 3;
        y = Math.random() * this.canvas.height;
    }

    this.defenders.push(new Defender({ x, y }, radius));
    this.logAI(`Defender spawned! Total: ${this.defenders.length}`);
  }

  private spawnAssassin() {
    if (this.assassins.length >= this.maxAssassins) return;

    const radius = 3; // 50% smaller
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0:
        x = Math.random() * this.canvas.width;
        y = -radius * 3;
        break;
      case 1:
        x = this.canvas.width + radius * 3;
        y = Math.random() * this.canvas.height;
        break;
      case 2:
        x = Math.random() * this.canvas.width;
        y = this.canvas.height + radius * 3;
        break;
      default:
        x = -radius * 3;
        y = Math.random() * this.canvas.height;
    }

    this.assassins.push(new AssassinEnemy({ x, y }, radius));
    this.logAI(`Assassin spawned! Total: ${this.assassins.length}/${this.maxAssassins}`);
  }

  private spawnBoss() {
    if (this.bosses.length >= this.maxBosses) return;

    const padding = 50;
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
      case 0: // top
        x = padding + Math.random() * (this.canvas.width - padding * 2);
        y = padding;
        break;
      case 1: // right
        x = this.canvas.width - padding;
        y = padding + Math.random() * (this.canvas.height - padding * 2);
        break;
      case 2: // bottom
        x = padding + Math.random() * (this.canvas.width - padding * 2);
        y = this.canvas.height - padding;
        break;
      default: // left
        x = padding;
        y = padding + Math.random() * (this.canvas.height - padding * 2);
    }

    const boss = new EliteEnemy({ x, y }, 3); // 50% smaller radius
    
    // Setup formation and control system
    this.updateFormationAndControl();
    
    this.bosses.push(boss);
    
    // Re-update formation with new boss (整齐编队)
    this.updateFormationAndControl();
    
    this.logAI(`Boss spawned! Total: ${this.bosses.length}/${this.maxBosses}`);
    
    // Boss可能发出指令给普通AI
    if (Math.random() < 0.4 && this.enemies.length > 0) {
      const command = this.commandSystem.issueCommand(
        boss, 
        "rush", 
        this.enemies, 
        this.player, 
        2
      );
      if (command) {
        this.logAI(`Boss issued RUSH command to ${command.targets.length} enemies!`, "warning");
      }
    }
  }

  private updateFormationAndControl() {
    const totalBosses = this.bosses.length;
    
    if (totalBosses < 2) {
      // Single boss: no formation, no control
      this.bosses.forEach(b => {
        b.isInFormation = false;
        b.shield = 0;
        b.controlledBy = null;
        b.controlledBosses = [];
      });
      this.formationDebuffActive = false;
      this.formationDebuffMultiplier = 1.0;
      return;
    }
    
    // With 2+ bosses: N-1 in formation, 1 attacking
    // Formation bosses get shields and control relationships
    const numInFormation = totalBosses - 1;
    const attackerIndex = Math.floor(Math.random() * totalBosses);
    
    // Reset all control relationships
    this.bosses.forEach(b => {
      b.controlledBy = null;
      b.controlledBosses = [];
    });
    
    // Assign formation and control
    let formationCount = 0;
    for (let i = 0; i < totalBosses; i++) {
      if (i === attackerIndex) {
        // This boss attacks
        this.bosses[i].isInFormation = false;
        this.bosses[i].shield = 0;
        this.bosses[i].formationIndex = -1;
      } else {
        // This boss is in formation
        this.bosses[i].isInFormation = true;
        this.bosses[i].shield = 100;
        this.bosses[i].formationIndex = formationCount;
        formationCount++;
      }
    }
    
    // Setup control relationships (pink lines)
    // Attacker controls all formation bosses
    const attacker = this.bosses[attackerIndex];
    for (let i = 0; i < totalBosses; i++) {
      if (i !== attackerIndex) {
        attacker.controlledBosses.push(this.bosses[i].id);
        this.bosses[i].controlledBy = attacker.id;
      }
    }
    
    // Calculate debuff based on formation size
    // Each formation boss reduces player speed/fire rate by 25%
    this.formationDebuffActive = numInFormation > 0;
    this.formationDebuffMultiplier = Math.max(0.1, 1.0 - (numInFormation * 0.25));
  }

  private shoot() {
    const now = Date.now();
    const adjustedCooldown = this.shootCooldown / this.formationDebuffMultiplier;
    if (now - this.lastShotTime < adjustedCooldown) return;

    const shootPos = this.player.getShootPosition();
    let targetX: number, targetY: number;

    // Auto-aim mode: target priority - assassin > boss > enemy > defender
    if (this.player.autoAimMode) {
      let target: Vector2D | null = null;

      // Priority 1: Assassins
      if (this.assassins.length > 0) {
        let minDist = Infinity;
        for (const assassin of this.assassins) {
          const dist = Math.sqrt(
            (assassin.position.x - shootPos.x) ** 2 + (assassin.position.y - shootPos.y) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            target = assassin.position;
          }
        }
      }
      // Priority 2: Bosses
      else if (this.bosses.length > 0) {
        let minDist = Infinity;
        for (const boss of this.bosses) {
          const dist = Math.sqrt(
            (boss.position.x - shootPos.x) ** 2 + (boss.position.y - shootPos.y) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            target = boss.position;
          }
        }
      }
      // Priority 3: Enemies
      else if (this.enemies.length > 0) {
        let minDist = Infinity;
        for (const enemy of this.enemies) {
          const dist = Math.sqrt(
            (enemy.position.x - shootPos.x) ** 2 + (enemy.position.y - shootPos.y) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            target = enemy.position;
          }
        }
      }
      // Priority 4: Defenders (only when all other enemies are cleared)
      else if (this.defenders.length > 0) {
        let minDist = Infinity;
        for (const defender of this.defenders) {
          const dist = Math.sqrt(
            (defender.position.x - shootPos.x) ** 2 + (defender.position.y - shootPos.y) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            target = defender.position;
          }
        }
      }

      if (target) {
        targetX = target.x;
        targetY = target.y;
      } else {
        targetX = this.mousePosition.x;
        targetY = this.mousePosition.y;
      }
    } else {
      targetX = this.mousePosition.x;
      targetY = this.mousePosition.y;
    }

    const direction = {
      x: targetX - shootPos.x,
      y: targetY - shootPos.y,
    };
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const normalized = {
      x: direction.x / length,
      y: direction.y / length,
    };

    const bullet = new Bullet(shootPos, normalized, 8);
    (bullet as any).damage = this.player.autoAimMode ? 8 : 30; // 3x damage for fast kills
    this.bullets.push(bullet);
    
    // Record shot for player analyzer and session stats
    this.playerAnalyzer.recordShot(false); // Will be updated to true if hit
    this.sessionStats.shotsFired++;

    this.lastShotTime = now;
  }

  private updateMouseHover() {
    let closestTarget: EliteEnemy | null = null;
    let minDist = Infinity;

    this.hoveredBoss = null;
    for (const boss of this.bosses) {
      const dx = this.mousePosition.x - boss.position.x;
      const dy = this.mousePosition.y - boss.position.y;
      const dist = Math.sqrt(dx ** 2 + dy ** 2);
      if (dist < boss.radius * 4) {
        this.hoveredBoss = boss;
        if (dist < minDist) {
          minDist = dist;
          closestTarget = boss;
        }
      }
    }

    this.currentTarget = closestTarget ? { ...closestTarget.position } : null;
    this.callbacks.onTargetUpdate(this.currentTarget);
  }

  private checkCollisions() {
    // Bullet collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      if (bullet.isOutOfBounds(this.canvas)) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      let bulletHit = false;
      const damage = (bullet as any).damage || 10;
      
      // Bullet-Enemy collisions
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        const dx = bullet.position.x - enemy.position.x;
        const dy = bullet.position.y - enemy.position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (distance < bullet.radius * 0.6 + enemy.radius) {
          enemy.health -= damage;
          
          if (enemy.health <= 0) {
            this.createExplosion(enemy.position, "hsl(280, 100%, 60%)");
            this.enemies.splice(j, 1);
            this.score += 10;
            this.callbacks.onScoreUpdate(this.score);
            this.callbacks.onEnemyDestroyed();
            this.difficultyManager.recordKill();
            this.gameReview.recordEvent("kill", enemy.position, "Enemy eliminated");
          }
          
          this.playerAnalyzer.recordShot(true); // Hit confirmed
          this.sessionStats.shotsHit++;
          bulletHit = true;
          break;
        }
      }

      if (bulletHit) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Bullet-Assassin collisions
      for (let j = this.assassins.length - 1; j >= 0; j--) {
        const assassin = this.assassins[j];
        
        const dx = bullet.position.x - assassin.position.x;
        const dy = bullet.position.y - assassin.position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (distance < bullet.radius * 0.6 + assassin.radius) {
          this.createExplosion(assassin.position, "hsl(45, 100%, 60%)");
          this.assassins.splice(j, 1);
          this.score += 25;
          this.callbacks.onScoreUpdate(this.score);
          this.callbacks.onEnemyDestroyed();
          this.difficultyManager.recordKill();
          this.playerAnalyzer.recordShot(true);
          this.sessionStats.shotsHit++;
          this.gameReview.recordEvent("kill", assassin.position, "Assassin eliminated");
          this.logAI(`Assassin killed! Respawning...`, "success");
          
          // Respawn assassin
          setTimeout(() => this.spawnAssassin(), 2000);
          
          bulletHit = true;
          break;
        }
      }

      if (bulletHit) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Bullet-Boss collisions
      for (let j = this.bosses.length - 1; j >= 0; j--) {
        const boss = this.bosses[j];
        
        const dx = bullet.position.x - boss.position.x;
        const dy = bullet.position.y - boss.position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        // Only core of bullet counts for hit detection
        if (distance < bullet.radius * 0.6 + boss.radius) {
          const isDead = boss.takeDamage(damage);
          this.sessionStats.shotsHit++;
          
          if (isDead) {
            this.createExplosion(boss.position, "hsl(0, 100%, 60%)");
            for (let k = 0; k < 30; k++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 6 + 3;
              this.particles.push(
                new Particle(
                  { ...boss.position },
                  { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                  Math.random() * 4 + 2,
                  "hsl(0, 100%, 70%)"
                )
              );
            }
            
            this.bosses.splice(j, 1);
            this.bossesKilledInWave++;
            this.score += 50;
            this.callbacks.onScoreUpdate(this.score);
            this.callbacks.onEnemyDestroyed();
            this.difficultyManager.recordKill();
            this.gameReview.recordEvent("kill", boss.position, "Boss eliminated");
            
            // Update formation after boss death
            this.updateFormationAndControl();
            
            this.logAI(`Boss killed! Wave: ${this.bossesKilledInWave}/6`, "success");
            
            // Spawn new wave when all 6 bosses killed
            if (this.bossesKilledInWave >= 6 && this.bosses.length === 0) {
              this.bossesKilledInWave = 0;
              this.logAI("🌊 New wave incoming!", "warning");
              setTimeout(() => {
                for (let i = 0; i < 6; i++) {
                  this.spawnBoss();
                }
              }, 1000);
            }
          }
          
          bulletHit = true;
          break;
        }
      }
      
      if (bulletHit) {
        this.bullets.splice(i, 1);
      }
    }

    // Player-Enemy collisions
    for (const enemy of this.enemies) {
      const dx = this.player.position.x - enemy.position.x;
      const dy = this.player.position.y - enemy.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const collisionDistance = this.player.radius + enemy.radius;

      if (distance < collisionDistance) {
        const previousHealth = this.player.health;
        const playerDied = this.player.takeDamage(10);
        const healthLost = previousHealth - this.player.health;
        
        if (healthLost > 0) {
          this.difficultyManager.recordHealthLoss(healthLost);
          this.difficultyManager.recordDamage(10);
        }
        
        if (playerDied) {
          this.createExplosion(this.player.position, "hsl(200, 100%, 60%)");
          this.handleGameOver("Enemy collision");
        }
        return;
      }
    }

    // Player-Assassin collisions
    for (const assassin of this.assassins) {
      const dx = this.player.position.x - assassin.position.x;
      const dy = this.player.position.y - assassin.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const collisionDistance = this.player.radius + assassin.radius;

      if (distance < collisionDistance) {
        const previousHealth = this.player.health;
        const playerDied = this.player.takeDamage(15);
        const healthLost = previousHealth - this.player.health;
        
        if (healthLost > 0) {
          this.difficultyManager.recordHealthLoss(healthLost);
          this.difficultyManager.recordDamage(15);
        }
        
        if (playerDied) {
          this.createExplosion(this.player.position, "hsl(200, 100%, 60%)");
          this.handleGameOver("Assassin collision");
        }
        return;
      }
    }

    // Player-Boss collisions (5 damage per hit)
    for (const boss of this.bosses) {
      const dx = this.player.position.x - boss.position.x;
      const dy = this.player.position.y - boss.position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const collisionDistance = this.player.radius + boss.radius;

      if (distance < collisionDistance) {
        const previousHealth = this.player.health;
        // Boss deals 5 damage
        const playerDied = this.player.takeDamage(5);
        const healthLost = previousHealth - this.player.health;
        
        if (healthLost > 0) {
          this.difficultyManager.recordHealthLoss(healthLost);
          this.difficultyManager.recordDamage(5);
        }
        
        if (playerDied) {
          this.createExplosion(this.player.position, "hsl(200, 100%, 60%)");
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 4;
            this.particles.push(
              new Particle(
                { ...this.player.position },
                { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                Math.random() * 5 + 2,
                Math.random() > 0.5 ? "hsl(200, 100%, 70%)" : "hsl(200, 100%, 90%)"
              )
            );
          }
          
          this.handleGameOver("Boss collision");
        } else {
          this.gameReview.recordEvent("damage_taken", this.player.position, `Took 5 damage from Boss`);
          this.logAI(`Player hit! Health: ${this.player.health}/${this.player.maxHealth}`, "warning");
          // Knockback
          const knockbackStrength = 15;
          this.player.velocity.x += (dx / distance) * knockbackStrength;
          this.player.velocity.y += (dy / distance) * knockbackStrength;
        }
        return;
      }
    }
  }
  
  private handleGameOver(reason: string) {
    this.gameOver = true;
    this.callbacks.onGameOver();
    this.stop();
    this.difficultyManager.recordDeath();
    this.gameReview.recordEvent("death", this.player.position, `Killed by ${reason}`);
    
    // Save global statistics
    GlobalStats.saveGameSession({
      kills: this.difficultyManager.getPerformanceReport().kills,
      deaths: 1, // Player died
      shots: this.sessionStats.shotsFired,
      hits: this.sessionStats.shotsHit,
      score: this.score
    });
    
    this.logAI(`💀 Game Over - ${reason}!`, "error");
  }

  private logAI(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.callbacks.onAILog({ timestamp, message, type });
  }
  
  private generateAICoachTip() {
    const report = this.difficultyManager.getPerformanceReport();
    const behavior = this.playerAnalyzer.getBehaviorReport();
    const enemyCount = this.enemies.length + this.assassins.length + this.bosses.length;
    
    if (this.player.health < 30) {
      this.callbacks.onAICoachTip({ message: "⚠️ 生命值危险！建议保持距离，优先击杀近战敌人", type: "critical" });
    } else if (enemyCount >= 5) {
      this.callbacks.onAICoachTip({ message: "🎯 敌人数量较多，注意走位避免被包围", type: "warning" });
    } else if (report.kdRatio > 3) {
      this.callbacks.onAICoachTip({ message: "✨ 表现出色！继续保持这种节奏", type: "positive" });
    } else if (behavior.accuracy < 40) {
      this.callbacks.onAICoachTip({ message: "💡 命中率偏低，建议开启自动瞄准（A键）", type: "info" });
    } else {
      this.callbacks.onAICoachTip({ message: "👍 战术执行良好，保持专注", type: "positive" });
    }
  }

  private createExplosion(position: Vector2D, color: string) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 3;
      this.particles.push(
        new Particle(
          { ...position },
          {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          Math.random() * 4 + 2,
          color
        )
      );
    }
  }

  private update(deltaTime: number) {
    if (this.gameOver) return;

    this.updateMouseHover();
    
    // AI Auto-pilot: let AI control player movement
    if (this.player.aiAutoPilot) {
      const allEnemies = [...this.enemies, ...this.assassins, ...this.bosses];
      const aiTarget = this.combatCoordinator.getAssistantAI().calculatePlayerMovement(
        this.player,
        allEnemies,
        this.bullets,
        this.canvas.width,
        this.canvas.height
      );
      this.player.update(aiTarget, deltaTime, this.canvas);
    } else {
      this.player.update(this.mousePosition, deltaTime, this.canvas);
    }
    
    // Record player position for analysis
    this.playerAnalyzer.recordPosition(this.player.position);
    
    // Periodically analyze player behavior
    if (Math.random() < 0.01) { // 1% chance per frame
      this.playerAnalyzer.analyze();
    }
    
    // Update team coordination
    const allEntities = [...this.enemies, ...this.bosses, ...this.assassins];
    if (allEntities.length > 0) {
      this.teamCoordinator.assignRoles(this.enemies, this.bosses, this.assassins);
      const coordination = this.teamCoordinator.coordinateAttack(allEntities, this.player);
      
      // Log coordination decisions occasionally
      if (Math.random() < 0.005 && coordination.shouldAttack.length > 0) {
        this.logAI(`🎯 Team coordinating attack: ${coordination.shouldAttack.length} units attacking`, "warning");
      }
    }

    // Update orbiters when AI mode active
    if (this.player.orbitersActive && this.orbiters.length === 0) {
      this.orbiters.push(new Orbiter(0, this.player.radius));
      this.orbiters.push(new Orbiter(Math.PI, this.player.radius));
      this.logAI("🤖 AI Orbiters activated!", "info");
    } else if (!this.player.orbitersActive && this.orbiters.length > 0) {
      this.orbiters = [];
      this.logAI("AI Orbiters deactivated", "info");
    }

    // Update orbiters and collect bullets
    const allEnemies = [...this.enemies, ...this.assassins, ...this.bosses, ...this.defenders];
    for (const orbiter of this.orbiters) {
      const bullet = orbiter.update(deltaTime, this.player, allEnemies);
      if (bullet) {
        this.bullets.push(bullet);
      }
    }

    // Update enemies with command system
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Check for commands from Boss
      const commands = this.commandSystem.getCommandsForEnemy(enemy.id);
      if (commands.length > 0) {
        this.commandSystem.executeCommand(enemy, commands[0], this.player, this.canvas);
      }
      
      enemy.updateAI(this.player, this.bullets, this.enemies, deltaTime, this.canvas);
    }

    // Update defenders
    for (let i = this.defenders.length - 1; i >= 0; i--) {
      this.defenders[i].update(this.player, deltaTime, this.canvas);
    }

    // Calculate defender slow effect
    let totalDefenderSlow = 0;
    for (const defender of this.defenders) {
      if (defender.isLocked) {
        const effects = defender.getLockEffects();
        totalDefenderSlow += effects.speedSlow;
      }
    }
    const slowPercent = Math.min(100, totalDefenderSlow * 100);
    this.player.setSlowFactor(1 - (slowPercent / 100));
    this.callbacks.onDefenderSlowChange(slowPercent);

    // Update assassins
    for (let i = this.assassins.length - 1; i >= 0; i--) {
      this.assassins[i].updateAI(this.player, this.bullets, deltaTime, this.canvas);
      
      // Remove expired assassins (30s lifetime)
      if (this.assassins[i].isExpired()) {
        this.createExplosion(this.assassins[i].position, "hsl(45, 100%, 60%)");
        this.assassins.splice(i, 1);
        this.logAI("Assassin expired, respawning...", "info");
        setTimeout(() => this.spawnAssassin(), 2000);
      }
    }

    // Update bosses with enhanced AI
    for (const boss of this.bosses) {
      boss.updateAI(this.player, this.bullets, this.bosses, deltaTime, this.canvas, this.score);
    }

    // Wave-based spawning: spawn next wave 2s after clearing current
    const totalEnemies = this.enemies.length + this.assassins.length + this.bosses.length + this.defenders.length;
    if (totalEnemies === 0 && !this.nextWaveScheduled && this.hasGameStarted) {
      this.nextWaveScheduled = true;
      
      // 清除所有防御者
      this.defenders = [];
      
      this.logAI("🌊 下一波将在2秒后出现", "warning");
      setTimeout(() => {
        for (let i = 0; i < this.waveSize; i++) {
          this.spawnRandomEnemy();
        }
        this.nextWaveScheduled = false;
        
        if (Math.random() < 0.3) {
          this.spawnDefender();
        }
      }, 2000);
    }
    
    // AI教练每5秒提示
    this.aiCoachTipTimer += deltaTime;
    if (this.aiCoachTipTimer >= this.aiCoachTipInterval && this.hasGameStarted) {
      this.generateAICoachTip();
      this.aiCoachTipTimer = 0;
    }

    // Spawn assassins
    this.assassinSpawnTimer += deltaTime;
    if (this.assassinSpawnTimer >= this.assassinSpawnInterval && this.assassins.length < this.maxAssassins) {
      this.spawnAssassin();
      this.assassinSpawnTimer = 0;
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update(deltaTime);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (this.particles[i].alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Auto-shoot
    if (this.isMouseDown || this.player.autoAimMode) {
      this.shoot();
    }

    // Don't spawn more bosses automatically - only spawn in waves
    // when 6 are killed
    
    // Update player stats
    this.playerStatsUpdateTimer += deltaTime;
    if (this.playerStatsUpdateTimer >= 100) {
      this.callbacks.onPlayerStatsUpdate({
        speed: this.player.getSpeed(),
        position: { ...this.player.position },
      });
      this.playerStatsUpdateTimer = 0;
    }

    this.checkCollisions();
  }

  private render() {
    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(10, 10, 15, 0.25)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render particles
    for (const particle of this.particles) {
      particle.render(this.ctx);
    }

    // Render bullets
    for (const bullet of this.bullets) {
      bullet.render(this.ctx);
    }

    // Render enemies
    for (const enemy of this.enemies) {
      enemy.render(this.ctx);
    }

    // Render assassins
    for (const assassin of this.assassins) {
      assassin.render(this.ctx);
    }

    // Render defenders
    for (const defender of this.defenders) {
      defender.render(this.ctx);
    }

    // Render bosses with player position and control relationships
    this.bosses.forEach(boss => {
      const controlled = this.bosses.filter(b => boss.controlledBosses.includes(b.id));
      boss.render(this.ctx, this.player.position, controlled);
    });

    // Render orbiters
    for (const orbiter of this.orbiters) {
      orbiter.render(this.ctx, this.player);
    }

    // Render player
    this.player.render(this.ctx);
  }

  private gameLoop = (timestamp: number) => {
    const deltaTime = Math.min(20, timestamp - (this.lastFrameTime || timestamp));
    this.lastFrameTime = timestamp;
    
    this.update(deltaTime);
    this.render();

    if (!this.gameOver) {
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  };

  public start() {
    if (this.animationId !== null) return;
    
    this.gameOver = false;
    this.score = 0;
    this.bossesKilledInWave = 0;
    this.player = new Player({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, 3);
    this.bullets = [];
    this.particles = [];
    this.enemies = [];
    this.assassins = [];
    this.bosses = [];
    this.defenders = [];
    this.orbiters = [];
    this.commandSystem = new CommandSystem();
    this.enemySpawnTimer = 0;
    this.assassinSpawnTimer = 0;
    
    // Spawn initial wave of 10 random enemies
    for (let i = 0; i < this.waveSize; i++) {
      this.spawnRandomEnemy();
    }
    
    this.logAI("🎮 Game Started! Wave mode (随机10敌人: Boss 40%, 刺客30%, 普通30%)", "success");
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  public stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public getPlayer(): Player {
    return this.player;
  }

  public restart() {
    this.stop();
    this.gameOver = false;
    
    // Save global statistics before reset
    GlobalStats.saveGameSession({
      kills: this.difficultyManager.getPerformanceReport().kills,
      deaths: this.difficultyManager.getPerformanceReport().deaths,
      shots: this.sessionStats.shotsFired,
      hits: this.sessionStats.shotsHit,
      score: this.score
    });
    
    this.score = 0;
    this.enemies = [];
    this.assassins = [];
    this.bosses = [];
    this.defenders = [];
    this.orbiters = [];
    this.commandSystem = new CommandSystem();
    this.teamCoordinator = new TeamCoordinator();
    this.difficultyManager.reset();
    this.playerAnalyzer.reset();
    this.gameReview.reset();
    this.bossSpawnTimer = 0;
    this.bossSpawnInterval = 4000;
    this.enemySpawnTimer = 0;
    this.assassinSpawnTimer = 0;
    this.lastFrameTime = 0;
    this.lastShotTime = 0;
    this.shootCooldown = this.baseShootCooldown;
    this.playerStatsUpdateTimer = 0;
    this.sessionStats = {
      shotsFired: 0,
      shotsHit: 0,
      startHealth: 100
    };
    
    // Generate performance report before reset
    const performanceReport = this.difficultyManager.getPerformanceReport();
    const behaviorReport = this.playerAnalyzer.getBehaviorReport();
    this.logAI(`📊 Performance: K/D ${performanceReport.kdRatio} | Accuracy ${behaviorReport.accuracy}%`, "info");
    this.logAI(`🎮 Playstyle: ${behaviorReport.playstyle}`, "info");
    
    this.logAI("🔄 Game Restarted", "info");
    
    this.player = new Player(
      { x: this.canvas.width / 2, y: this.canvas.height / 2 },
      3
    );
    
    this.callbacks.onScoreUpdate(0);
    this.callbacks.onAutoAimChange(false);
    this.callbacks.onDefenderSlowChange(0);
    this.start();
  }
}
