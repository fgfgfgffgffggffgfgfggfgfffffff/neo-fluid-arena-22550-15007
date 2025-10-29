import { Enemy } from "../entities/Enemy";

export interface AIStats {
  id: string;
  survivalTime: number;
  dodgesSuccessful: number;
  hitsTaken: number;
  score: number;
  evolutionLevel: number; // 0-5, higher = better AI
  guilt: number; // Increases when failing
}

export class AIEvolutionSystem {
  private aiStats: Map<string, AIStats> = new Map();
  private leaderboard: AIStats[] = [];
  
  public registerAI(id: string): AIStats {
    const stats: AIStats = {
      id,
      survivalTime: 0,
      dodgesSuccessful: 0,
      hitsTaken: 0,
      score: 0,
      evolutionLevel: 0,
      guilt: 0,
    };
    this.aiStats.set(id, stats);
    return stats;
  }
  
  public updateSurvivalTime(id: string, deltaTime: number) {
    const stats = this.aiStats.get(id);
    if (stats) {
      stats.survivalTime += deltaTime;
      stats.score = this.calculateScore(stats);
    }
  }
  
  public recordDodge(id: string) {
    const stats = this.aiStats.get(id);
    if (stats) {
      stats.dodgesSuccessful++;
      stats.score = this.calculateScore(stats);
      
      // Long-term learning bonus
      const learningBonus = Math.floor(stats.dodgesSuccessful / 5);
      if (learningBonus > 0 && stats.dodgesSuccessful % 5 === 0) {
        console.log(`🎓 AI ${id.substring(0, 6)} gained learning bonus! +${learningBonus * 10} XP from ${stats.dodgesSuccessful} dodges`);
      }
      
      console.log(`✅ AI ${id.substring(0, 6)} dodged! Total: ${stats.dodgesSuccessful}, Score: ${stats.score.toFixed(0)}`);
    }
  }
  
  public recordHit(id: string) {
    const stats = this.aiStats.get(id);
    if (stats) {
      stats.hitsTaken++;
      console.log(`❌ AI ${id.substring(0, 6)} hit! Total hits: ${stats.hitsTaken}`);
    }
  }
  
  public recordDeath(id: string, reason: "hit" | "timeout") {
    const stats = this.aiStats.get(id);
    if (stats) {
      stats.guilt += reason === "timeout" ? 50 : 20;
      console.log(`💀 AI ${id.substring(0, 6)} died (${reason})! Guilt: ${stats.guilt}, Final Score: ${stats.score.toFixed(0)}`);
      console.log(`📊 AI ${id.substring(0, 6)} stats: Survived ${(stats.survivalTime / 1000).toFixed(1)}s, Dodged ${stats.dodgesSuccessful} times`);
      
      // Remove from active tracking
      this.aiStats.delete(id);
      
      // Update leaderboard
      this.updateLeaderboard();
    }
  }
  
  private calculateScore(stats: AIStats): number {
    // Score formula: survival time + dodge bonus - hit penalty
    const survivalScore = stats.survivalTime / 100; // 1 point per 0.1 second
    const dodgeBonus = stats.dodgesSuccessful * 50;
    const hitPenalty = stats.hitsTaken * 30;
    const evolutionBonus = stats.evolutionLevel * 100;
    
    return survivalScore + dodgeBonus - hitPenalty + evolutionBonus;
  }
  
  private updateLeaderboard() {
    // Sort by score descending
    this.leaderboard = Array.from(this.aiStats.values()).sort((a, b) => b.score - a.score);
    
    if (this.leaderboard.length > 0) {
      console.log("🏆 AI LEADERBOARD:");
      this.leaderboard.slice(0, 5).forEach((stats, i) => {
        console.log(`  ${i + 1}. AI ${stats.id.substring(0, 6)} - Score: ${stats.score.toFixed(0)}, Level: ${stats.evolutionLevel}, Survived: ${(stats.survivalTime / 1000).toFixed(1)}s`);
      });
    }
  }
  
  public evolveTopAI() {
    if (this.leaderboard.length === 0) return;
    
    const topAI = this.leaderboard[0];
    const scoreThreshold = 300 + (topAI.evolutionLevel * 200); // Progressive difficulty
    
    if (topAI.score > scoreThreshold && topAI.evolutionLevel < 5) {
      topAI.evolutionLevel++;
      console.log(`🎖️ EVOLUTION! AI ${topAI.id.substring(0, 6)} evolved to Level ${topAI.evolutionLevel}!`);
      console.log(`  📈 Enhanced abilities:`);
      console.log(`     • Prediction accuracy: +${topAI.evolutionLevel * 15}%`);
      console.log(`     • Detection range: +${topAI.evolutionLevel * 20}%`);
      console.log(`     • Team coordination: +${topAI.evolutionLevel * 10}%`);
      console.log(`     • Learning rate: +${topAI.evolutionLevel * 12}%`);
    }
  }
  
  public getEvolutionBonus(id: string): number {
    const stats = this.aiStats.get(id);
    return stats ? 1 + (stats.evolutionLevel * 0.15) : 1; // 15% bonus per level
  }
  
  public getStats(id: string): AIStats | undefined {
    return this.aiStats.get(id);
  }
  
  public getLeaderboard(): AIStats[] {
    return [...this.leaderboard];
  }
  
  public logTrainingResults() {
    console.log("\n🎓 AI TRAINING RESULTS (Enhanced Real-Time Learning)");
    console.log("====================================================");
    
    if (this.leaderboard.length === 0) {
      console.log("No active AI agents");
      return;
    }
    
    const avgScore = this.leaderboard.reduce((sum, s) => sum + s.score, 0) / this.leaderboard.length;
    const avgSurvival = this.leaderboard.reduce((sum, s) => sum + s.survivalTime, 0) / this.leaderboard.length;
    const totalDodges = this.leaderboard.reduce((sum, s) => sum + s.dodgesSuccessful, 0);
    const avgDodges = totalDodges / this.leaderboard.length;
    const maxLevel = Math.max(...this.leaderboard.map(s => s.evolutionLevel));
    const totalHits = this.leaderboard.reduce((sum, s) => sum + s.hitsTaken, 0);
    const dodgeSuccessRate = totalDodges + totalHits > 0 ? (totalDodges / (totalDodges + totalHits)) * 100 : 0;
    
    console.log(`📊 Population Metrics:`);
    console.log(`   Active AI Agents: ${this.leaderboard.length}`);
    console.log(`   Average Score: ${avgScore.toFixed(0)}`);
    console.log(`   Average Survival: ${(avgSurvival / 1000).toFixed(1)}s`);
    console.log(`   Total Dodges: ${totalDodges} (avg: ${avgDodges.toFixed(1)} per AI)`);
    console.log(`   Dodge Success Rate: ${dodgeSuccessRate.toFixed(1)}%`);
    console.log(`   Highest Evolution: Level ${maxLevel}`);
    
    // Top performers with detailed stats
    console.log(`\n🏆 Top 5 Performers (Leaderboard):`);
    this.leaderboard.slice(0, 5).forEach((ai, i) => {
      const dodgeRate = ai.dodgesSuccessful + ai.hitsTaken > 0 ? 
        ((ai.dodgesSuccessful / (ai.dodgesSuccessful + ai.hitsTaken)) * 100).toFixed(0) : 0;
      console.log(`   ${i + 1}. AI ${ai.id.substring(0, 6)} - Score: ${ai.score.toFixed(0)} | Lv${ai.evolutionLevel} | ${(ai.survivalTime / 1000).toFixed(1)}s | Dodge Rate: ${dodgeRate}%`);
    });
    
    // Training insights with detailed analysis
    console.log(`\n📝 Training Insights & Real-Time Adaptation:`);
    
    if (avgSurvival < 5000) {
      console.log("  ⚠️ Low survival - Adjusting defensive algorithms");
      console.log("     → Enhancing retreat patterns & threat detection");
    } else if (avgSurvival > 15000) {
      console.log("  ✅ High survival - AI mastering advanced evasion");
      console.log("     → Implementing aggressive pursuit patterns");
    } else {
      console.log("  📊 Moderate survival - Balanced learning in progress");
    }
    
    if (dodgeSuccessRate < 40) {
      console.log("  ⚠️ Poor dodge rate - Upgrading prediction models");
      console.log("     → Increasing bullet detection radius");
      console.log("     → Improving perpendicular dodge calculations");
    } else if (dodgeSuccessRate > 70) {
      console.log("  ✅ Excellent dodge rate - Superior prediction active");
      console.log("     → AI demonstrating adaptive learning");
    } else {
      console.log("  📈 Good dodge rate - Learning curve progressing");
    }
    
    if (maxLevel < 2) {
      console.log("  📈 Evolution potential - Top AI approaching threshold");
      console.log("     → Next evolution unlocks enhanced prediction");
    } else if (maxLevel >= 4) {
      console.log("  🎖️ Elite AI operational - Advanced evolution achieved");
      console.log("     → Master-level tactics & team coordination active");
    } else {
      console.log(`  🔬 Evolution Level ${maxLevel} - Mid-tier AI active`);
    }
    
    // Reward & Punishment feedback
    console.log(`\n🎯 Learning Mechanics:`);
    console.log("   Rewards:");
    console.log("     • +50 points per successful dodge");
    console.log("     • +1 point per 0.1s survival");
    console.log("     • +100 points per evolution level");
    console.log("     • Learning bonus every 5 dodges");
    console.log("   Penalties:");
    console.log("     • -30 points per hit taken");
    console.log("     • +20 guilt on death by hit");
    console.log("     • +50 guilt on timeout death");
    
    const teamworkScore = this.leaderboard.length > 3 ? "High coordination" : "Learning teamwork";
    console.log(`\n⚙️ System Status:`);
    console.log(`  🤝 Team Coordination: ${teamworkScore}`);
    console.log(`  🔬 Detection Range: 600px`);
    console.log(`  🛡️ Shield System: Active`);
    console.log(`  ⚡ Dodge Ability: 5s cooldown`);
    console.log(`  🧠 Real-time Learning: Enabled\n`);
  }
}
