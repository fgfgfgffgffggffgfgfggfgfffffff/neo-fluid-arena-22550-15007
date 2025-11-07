import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/lib/game/GameEngine";
import { GameUI } from "./GameUI";
import { StartScreen } from "./StartScreen";
import { HealthDisplay } from "./HealthDisplay";
import { AICoachButton } from "./AICoachButton";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { TargetReticle } from "./TargetReticle";
import { AICoachTip } from "./AICoachTip";
import { SkillsDisplay } from "./SkillsDisplay";
import { Leaderboard } from "./Leaderboard";
import { PlayerStatsChart } from "./PlayerStatsChart";

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [enemiesDestroyed, setEnemiesDestroyed] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [autoAimMode, setAutoAimMode] = useState(false);
  const [aiAutoPilot, setAiAutoPilot] = useState(false);
  const [defenderSlowPercent, setDefenderSlowPercent] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiLogs, setAiLogs] = useState<Array<{ timestamp: string; message: string; type: "info" | "success" | "warning" | "error" }>>([]);
  const [playerStats, setPlayerStats] = useState({ speed: 21.6, position: { x: 0, y: 0 } });
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiReports, setAiReports] = useState({
    performance: {
      kills: 0,
      deaths: 0,
      kdRatio: 0,
      accuracy: 0,
      difficulty: 1.0,
      suggestion: ""
    },
    behavior: {
      accuracy: 0,
      movementPattern: "balanced",
      playstyle: "平衡型",
      recommendations: [] as string[]
    }
  });
  const [currentTip, setCurrentTip] = useState<{
    message: string;
    type: "positive" | "warning" | "info" | "critical";
  } | null>(null);
  const [lastTipTime, setLastTipTime] = useState(0);
  const [showTipVisual, setShowTipVisual] = useState(false);

  const [skills, setSkills] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentWave, setCurrentWave] = useState(1);
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);

  useEffect(() => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      onScoreUpdate: (newScore) => {
        setScore(newScore);
        setHighScore(prev => Math.max(prev, newScore));
      },
      onGameOver: () => {
        setGameOver(true);
        setDeaths(prev => prev + 1);
      },
      onEnemyDestroyed: () => {
        setEnemiesDestroyed(prev => prev + 1);
        setKills(prev => prev + 1);
      },
      onAutoAimChange: setAutoAimMode,
      onDefenderSlowChange: setDefenderSlowPercent,
      onAILog: (log) => setAiLogs(prev => [log, ...prev].slice(0, 100)),
      onPlayerStatsUpdate: setPlayerStats,
      onTargetUpdate: setTargetPosition,
      onAICoachTip: (tip) => {
        const now = Date.now();
        if (now - lastTipTime >= 7000) {
          setCurrentTip(tip);
          setShowTipVisual(true);
          setLastTipTime(now);
          
          setTimeout(() => {
            setShowTipVisual(false);
          }, 2000);
        }
      },
      onSkillsUpdate: setSkills,
    });

    engineRef.current = engine;
    engine.start();

    // Update player health periodically
    const healthInterval = setInterval(() => {
      if (engineRef.current) {
        const player = engineRef.current.getPlayer();
        setPlayerHealth(player.health);
        setAiAutoPilot(player.aiAutoPilot);
      }
    }, 100);

    // Add P key listener for AI Coach
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setShowAIAnalysis(prev => !prev);
        if (!showAIAnalysis) handleShowAIAnalysis();
      }
      if (e.key === 'l' || e.key === 'L') {
        setShowLeaderboard(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      engine.stop();
      clearInterval(healthInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted]);

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restart();
      setGameOver(false);
      setScore(0);
      setEnemiesDestroyed(0);
      setSkills([]); // 清空技能显示
    }
  };
  
  const handleStart = () => {
    setGameStarted(true);
  };
  
  const handleShowAIAnalysis = () => {
    if (engineRef.current) {
      const engine = engineRef.current as any;
      if (engine.difficultyManager && engine.playerAnalyzer) {
        const perfReport = engine.difficultyManager.getPerformanceReport();
        const behaviorReport = engine.playerAnalyzer.getBehaviorReport();
        setAiReports({ performance: perfReport, behavior: behaviorReport });
      }
    }
  };

  const handleSkillClick = (skillId: string) => {
    if (engineRef.current) (engineRef.current as any).useSkill(skillId);
  };

  const getCooldownPercent = (skillId: string) => 
    engineRef.current ? (engineRef.current as any).getSkillCooldownPercent(skillId) : 0;

  const getRemainingCooldown = (skillId: string) => 
    engineRef.current ? (engineRef.current as any).getSkillRemainingCooldown(skillId) : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {!gameStarted && <StartScreen onStart={handleStart} />}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      {gameStarted && !gameOver && (
        <>
          <TargetReticle
            targetPosition={targetPosition}
            canvasOffset={{ x: 0, y: 0 }}
            playerPosition={playerStats.position}
            isAssassin={false}
          />
          <HealthDisplay health={playerHealth} maxHealth={100} />
          <AICoachButton onClick={handleShowAIAnalysis} />
          <SkillsDisplay skills={skills} getCooldownPercent={getCooldownPercent} getRemainingCooldown={getRemainingCooldown} onSkillClick={handleSkillClick} />
          <Leaderboard visible={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
          
          <AIAnalysisPanel
            visible={showAIAnalysis}
            onClose={() => setShowAIAnalysis(false)}
            performanceReport={aiReports.performance}
            behaviorReport={aiReports.behavior}
            kills={kills}
            deaths={deaths}
            score={score}
            wave={currentWave}
          />
          {currentTip && showTipVisual && (
            <AICoachTip
              message={currentTip.message}
              type={currentTip.type}
              onDismiss={() => {
                setCurrentTip(null);
                setShowTipVisual(false);
              }}
            />
          )}
        </>
      )}
      <GameUI
        score={score}
        enemiesDestroyed={enemiesDestroyed}
        gameOver={gameOver}
        onRestart={handleRestart}
        autoAimMode={autoAimMode}
        aiAutoPilot={aiAutoPilot}
        defenderSlowPercent={defenderSlowPercent}
        highScore={highScore}
        playerHealth={playerHealth}
      />
    </div>
  );
};
