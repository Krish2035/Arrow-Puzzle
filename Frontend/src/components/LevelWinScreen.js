'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../game/soundEffects';
import { Star, Trophy, ArrowRight, Home } from 'lucide-react';

export default function LevelWinScreen({
  completedLevel = 3,
  onNextGame,
  onGoHome,
  levelPreviewData
}) {
  useEffect(() => {
    // Play win sound fanfare & cracker pops
    sounds.playWin();
    sounds.playFirecracker();

    // Multi-cannon cracker fireworks explosions
    // 1. Immediate center blast
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.32, x: 0.5 },
      colors: ['#ff4081', '#00e5ff', '#ffeb3b', '#76ff03', '#ff9100', '#ffffff']
    });

    // 2. Left side cannon blast
    const timer1 = setTimeout(() => {
      sounds.playFirecracker();
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0.08, y: 0.65 },
        colors: ['#00e5ff', '#ffeb3b', '#e040fb', '#ffffff']
      });
    }, 280);

    // 3. Right side cannon blast
    const timer2 = setTimeout(() => {
      sounds.playFirecracker();
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 0.92, y: 0.65 },
        colors: ['#ff4081', '#76ff03', '#ff9100', '#ffffff']
      });
    }, 550);

    // 4. Grand finale celebration shower
    const timer3 = setTimeout(() => {
      confetti({
        particleCount: 110,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#ffeb3b', '#ff4081', '#00e5ff', '#76ff03', '#ff9100', '#ffffff']
      });
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const nextLevelNumber = completedLevel + 1;

  // Desktop keyboard shortcuts: Space/Enter = next level, Esc = home
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        sounds.playTap();
        onNextGame(nextLevelNumber);
      } else if (e.key === 'Escape') {
        sounds.playTap();
        onGoHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completedLevel, nextLevelNumber, onNextGame, onGoHome]);

  // Render miniature puzzle preview inside the card
  const arrows = levelPreviewData?.arrows || [];
  const svgSize = 180;
  const gridSize = levelPreviewData?.grid_size || 8;
  const padding = 18;
  const usableSize = svgSize - padding * 2;
  const scale = usableSize / gridSize;

  const toSvgCoords = (gx, gy) => [
    padding + gx * scale,
    padding + gy * scale
  ];

  const createPathD = (points) => {
    if (!points || points.length < 2) return '';
    const [firstX, firstY] = toSvgCoords(points[0][0], points[0][1]);
    let d = `M ${firstX.toFixed(1)} ${firstY.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const [px, py] = toSvgCoords(points[i][0], points[i][1]);
      d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    return d;
  };

  const renderArrowhead = (arrow) => {
    if (!arrow || !arrow.points || arrow.points.length === 0) return null;
    const endPoint = arrow.points[arrow.points.length - 1];
    const [hx, hy] = toSvgCoords(endPoint[0], endPoint[1]);
    const len = 7.5;
    const halfWidth = len * 0.58;
    let d = '';
    const dir = (arrow?.direction || 'right').toLowerCase();
    switch (dir) {
      case 'up':
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx - halfWidth).toFixed(1)} ${(hy + len).toFixed(1)} L ${(hx + halfWidth).toFixed(1)} ${(hy + len).toFixed(1)} Z`;
        break;
      case 'down':
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx + halfWidth).toFixed(1)} ${(hy - len).toFixed(1)} L ${(hx - halfWidth).toFixed(1)} ${(hy - len).toFixed(1)} Z`;
        break;
      case 'right':
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy - halfWidth).toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy + halfWidth).toFixed(1)} Z`;
        break;
      case 'left':
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx + len).toFixed(1)} ${(hy + halfWidth).toFixed(1)} L ${(hx + len).toFixed(1)} ${(hy - halfWidth).toFixed(1)} Z`;
        break;
      default:
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy - halfWidth).toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy + halfWidth).toFixed(1)} Z`;
    }
    return <path d={d} fill="#111e38" stroke="#111e38" strokeWidth="0.5" />;
  };

  const renderGridDots = () => {
    const dots = [];
    const dotRadius = Math.max(1.2, Math.min(2.0, (20 / gridSize)));
    for (let x = 1; x <= gridSize - 1; x++) {
      for (let y = 1; y <= gridSize - 1; y++) {
        const [cx, cy] = toSvgCoords(x, y);
        dots.push(
          <circle
            key={`win-dot-${x}-${y}`}
            cx={cx.toFixed(1)}
            cy={cy.toFixed(1)}
            r={dotRadius}
            fill="#94a3b8"
            opacity="0.45"
          />
        );
      }
    }
    return dots;
  };

  return (
    <div className="win-screen-container">
      {/* Sunburst radiating beams background */}
      <div className="sunburst-bg" />

      {/* Main Victory Center Stage */}
      <div className="win-content-wrapper">
        {/* Victory Star Badge */}
        <div className="win-trophy-badge">
          <Trophy size={36} color="#ffffff" strokeWidth={2.4} />
        </div>

        {/* Title matching Screenshot 3 */}
        <h1 className="win-title">Level Completed!</h1>
        <p className="win-subtitle">Flawless solution! Ready for the next challenge?</p>

        {/* Center White Card displaying the completed maze pattern */}
        <div className="win-card">
          <div className="win-card-header">
            <span>Pattern Cleared</span>
            <div className="win-stars-row">
              <Star size={14} fill="#eab308" color="#eab308" />
              <Star size={14} fill="#eab308" color="#eab308" />
              <Star size={14} fill="#eab308" color="#eab308" />
            </div>
          </div>
          <svg
            className="win-preview-svg"
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g pointerEvents="none">{renderGridDots()}</g>
            {arrows.map((arrow) => (
              <g key={arrow.id}>
                <path
                  d={createPathD(arrow.points)}
                  fill="none"
                  stroke="#111e38"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {renderArrowhead(arrow)}
              </g>
            ))}
          </svg>
        </div>

        {/* Bottom Action Buttons matching Screenshot 3 + Desktop shortcuts */}
        <div className="win-actions-container">
          {/* Next Game Button */}
          <button
            className="next-game-btn"
            onClick={() => { sounds.playTap(); onNextGame(nextLevelNumber); }}
          >
            <span className="next-game-title">Next Game</span>
            <span className="next-game-subtitle">Level {nextLevelNumber} (Space)</span>
          </button>

          {/* Main link to return to home */}
          <button
            className="win-main-link"
            onClick={() => { sounds.playTap(); onGoHome(); }}
          >
            <Home size={16} /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
