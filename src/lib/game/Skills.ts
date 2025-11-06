import { Vector2D } from "./types";

export interface Skill {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  lastUsed: number;
  isReady: () => boolean;
  use: () => void;
  shouldAutoUse?: (gameState: any) => boolean;
}

export class SkillManager {
  private skills: Map<string, Skill> = new Map();
  
  constructor() {
    this.initializeSkills();
  }

  private initializeSkills() {
    // 技能1: 护盾 (Shield)
    this.skills.set("shield", {
      id: "shield",
      name: "护盾",
      icon: "🛡️",
      cooldown: 15000,
      lastUsed: -15000,
      isReady: function() {
        return Date.now() - this.lastUsed >= this.cooldown;
      },
      use: function() {
        this.lastUsed = Date.now();
      },
      shouldAutoUse: (gameState) => {
        return gameState.playerHealth < 40 && gameState.enemyCount > 3;
      }
    });

    // 技能2: 时间减速 (Time Slow)
    this.skills.set("timeSlow", {
      id: "timeSlow",
      name: "时间减速",
      icon: "⏱️",
      cooldown: 20000,
      lastUsed: -20000,
      isReady: function() {
        return Date.now() - this.lastUsed >= this.cooldown;
      },
      use: function() {
        this.lastUsed = Date.now();
      },
      shouldAutoUse: (gameState) => {
        return gameState.enemyCount > 6 || gameState.playerHealth < 30;
      }
    });

    // 技能3: 范围爆炸 (AOE Blast)
    this.skills.set("aoeBlast", {
      id: "aoeBlast",
      name: "范围爆炸",
      icon: "💥",
      cooldown: 12000,
      lastUsed: -12000,
      isReady: function() {
        return Date.now() - this.lastUsed >= this.cooldown;
      },
      use: function() {
        this.lastUsed = Date.now();
      },
      shouldAutoUse: (gameState) => {
        return gameState.nearbyEnemies > 4;
      }
    });

    // 技能4: 瞬移 (Teleport)
    this.skills.set("teleport", {
      id: "teleport",
      name: "瞬移",
      icon: "⚡",
      cooldown: 10000,
      lastUsed: -10000,
      isReady: function() {
        return Date.now() - this.lastUsed >= this.cooldown;
      },
      use: function() {
        this.lastUsed = Date.now();
      },
      shouldAutoUse: (gameState) => {
        return gameState.playerHealth < 25 && gameState.nearbyEnemies > 2;
      }
    });

    // 技能5: 治疗 (Heal)
    this.skills.set("heal", {
      id: "heal",
      name: "治疗",
      icon: "❤️",
      cooldown: 25000,
      lastUsed: -25000,
      isReady: function() {
        return Date.now() - this.lastUsed >= this.cooldown;
      },
      use: function() {
        this.lastUsed = Date.now();
      },
      shouldAutoUse: (gameState) => {
        return gameState.playerHealth < 50;
      }
    });
  }

  public getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  public getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  public useSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill && skill.isReady()) {
      skill.use();
      return true;
    }
    return false;
  }

  public autoUseSkills(gameState: any): string[] {
    const usedSkills: string[] = [];
    
    for (const skill of this.skills.values()) {
      if (skill.shouldAutoUse && skill.shouldAutoUse(gameState) && skill.isReady()) {
        skill.use();
        usedSkills.push(skill.id);
      }
    }
    
    return usedSkills;
  }

  public getCooldownPercent(skillId: string): number {
    const skill = this.skills.get(skillId);
    if (!skill) return 0;
    
    const elapsed = Date.now() - skill.lastUsed;
    const percent = Math.min(100, (elapsed / skill.cooldown) * 100);
    return percent;
  }

  public getRemainingCooldown(skillId: string): number {
    const skill = this.skills.get(skillId);
    if (!skill) return 0;
    
    const elapsed = Date.now() - skill.lastUsed;
    const remaining = Math.max(0, skill.cooldown - elapsed);
    return Math.ceil(remaining / 1000);
  }
}
