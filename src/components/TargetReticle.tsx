import { useEffect, useState } from "react";

interface TargetReticleProps {
  targetPosition: { x: number; y: number } | null;
  canvasOffset: { x: number; y: number };
  playerPosition: { x: number; y: number } | null;
  isAssassin?: boolean;
}

export const TargetReticle = ({ targetPosition, canvasOffset, playerPosition, isAssassin }: TargetReticleProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (targetPosition) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [targetPosition]);

  if (!visible || !targetPosition) return null;

  const reticleColor = isAssassin ? "hsl(280, 100%, 65%)" : "hsl(60, 100%, 60%)";
  const reticleSize = isAssassin ? 20 : 16;
  const glowSize = isAssassin ? 32 : 24;

  return (
    <>
      {/* Targeting line from player to enemy */}
      {playerPosition && (
        <svg
          className="fixed pointer-events-none z-40"
          style={{
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <line
            x1={playerPosition.x + canvasOffset.x}
            y1={playerPosition.y + canvasOffset.y}
            x2={targetPosition.x + canvasOffset.x}
            y2={targetPosition.y + canvasOffset.y}
            stroke={reticleColor}
            strokeWidth="1"
            strokeDasharray="8 8"
            opacity="0.2"
          />
        </svg>
      )}
      
      {/* Reticle */}
      <div
        className="fixed pointer-events-none z-50 transition-all duration-100"
        style={{
          left: `${targetPosition.x + canvasOffset.x}px`,
          top: `${targetPosition.y + canvasOffset.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            width: `${glowSize}px`,
            height: `${glowSize}px`,
            marginLeft: `-${glowSize/2}px`,
            marginTop: `-${glowSize/2}px`,
            background: `radial-gradient(circle, ${reticleColor}33, transparent 70%)`,
            boxShadow: `0 0 ${glowSize/2}px ${reticleColor}66`,
          }}
        />
        
        {/* Outer ring */}
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            width: `${reticleSize}px`,
            height: `${reticleSize}px`,
            marginLeft: `-${reticleSize/2}px`,
            marginTop: `-${reticleSize/2}px`,
            border: `2px solid ${reticleColor}`,
            boxShadow: `0 0 8px ${reticleColor}`,
          }}
        />
        
        {/* Corner marks */}
        <div 
          className="absolute"
          style={{
            width: `${reticleSize + 8}px`,
            height: `${reticleSize + 8}px`,
            marginLeft: `-${(reticleSize + 8)/2}px`,
            marginTop: `-${(reticleSize + 8)/2}px`,
          }}
        >
          {[0, 90, 180, 270].map((rotation) => (
            <div
              key={rotation}
              className="absolute"
              style={{
                left: "50%",
                top: "0",
                width: "2px",
                height: "6px",
                background: reticleColor,
                boxShadow: `0 0 4px ${reticleColor}`,
                transformOrigin: "center",
                transform: `translateX(-50%) rotate(${rotation}deg) translateY(-${(reticleSize + 8)/2}px)`,
              }}
            />
          ))}
        </div>
        
        {/* Center dot */}
        <div 
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: "3px",
            height: "3px",
            marginLeft: "-1.5px",
            marginTop: "-1.5px",
            background: reticleColor,
            boxShadow: `0 0 6px ${reticleColor}`,
          }}
        />
      </div>
    </>
  );
};
