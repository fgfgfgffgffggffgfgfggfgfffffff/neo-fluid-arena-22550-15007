import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/lib/game/GameEngine";
import { GameUI } from "./GameUI";
import { StartScreen } from "./StartScreen";
import { HealthDisplay } from "./HealthDisplay";
import { AICoachButton } from "./AICoachButton";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { TargetReticle } from "./TargetReticle";

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

  useEffect(() => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      onScoreUpdate: (newScore) => {
        setScore(newScore);
        setHighScore(prev => Math.max(prev, newScore));
      },
      onGameOver: () => setGameOver(true),
      onEnemyDestroyed: () => setEnemiesDestroyed(prev => prev + 1),
      onAutoAimChange: setAutoAimMode,
      onDefenderSlowChange: setDefenderSlowPercent,
      onAILog: (log) => setAiLogs(prev => [log, ...prev].slice(0, 100)),
      onPlayerStatsUpdate: setPlayerStats,
      onTargetUpdate: setTargetPosition,
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
        handleShowAIAnalysis();
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
    }
  };
  
  const handleStart = () => {
    setGameStarted(true);
  };
  
  const handleShowAIAnalysis = () => {
    // Get latest reports from engine
    if (engineRef.current) {
      const engine = engineRef.current as any;
      if (engine.difficultyManager && engine.playerAnalyzer) {
        const perfReport = engine.difficultyManager.getPerformanceReport();
        const behaviorReport = engine.playerAnalyzer.getBehaviorReport();
        setAiReports({
          performance: perfReport,
          behavior: behaviorReport
        });
      }
    }
    setShowAIAnalysis(true);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {!gameStarted && <StartScreen onStart={handleStart} />}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
      {gameStarted && (
        <>
          <TargetReticle
            targetPosition={targetPosition}
            canvasOffset={{ x: 0, y: 0 }}
            playerPosition={playerStats.position}
            isAssassin={false}
          />
          <HealthDisplay health={playerHealth} maxHealth={100} />
          <AICoachButton onClick={handleShowAIAnalysis} />
          <AIAnalysisPanel
            visible={showAIAnalysis}
            onClose={() => setShowAIAnalysis(false)}
            performanceReport={aiReports.performance}
            behaviorReport={aiReports.behavior}
          />
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
