'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft, Settings, Heart, Send, Lightbulb, RotateCcw,
  Sparkles, Keyboard, ChevronRight
} from 'lucide-react';
import { checkArrowObstruction, findClearableArrows } from '../game/arrowPhysics';
import { sounds } from '../game/soundEffects';

export default function GameScreen({
  levelData,
  onBack,
  onLevelComplete,
  onOpenSettings,
  onJumpLevel,
  hardMode = false,
  onToggleHardMode
}) {
  const maxHearts = hardMode ? 2 : 3;
  const [arrows, setArrows] = useState([]);
  const [hearts, setHearts] = useState(maxHearts);
  const [hints, setHints] = useState(2);
  const [movesCount, setMovesCount] = useState(0);
  const [hintedArrowId, setHintedArrowId] = useState(null);
  const [shakingArrowId, setShakingArrowId] = useState(null);
  const [exitingArrows, setExitingArrows] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const hasWonRef = useRef(false);
  const [arrowsLoaded, setArrowsLoaded] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // Initialize arrows from level data
  useEffect(() => {
    if (levelData && levelData.arrows) {
      hasWonRef.current = false;
      setArrows(levelData.arrows);
      setArrowsLoaded(true);
      setHearts(hardMode ? 2 : 3);
      setGameOver(false);
      setHasWon(false);
      setHintedArrowId(null);
      setShakingArrowId(null);
      setExitingArrows({});
      setMovesCount(0);
      setStartTime(Date.now());
    }
  }, [levelData, hardMode]);

  // Guaranteed reactive victory trigger when board is cleared
  useEffect(() => {
    if (!arrowsLoaded || !levelData || hasWonRef.current || gameOver) return;
    if (arrows.length === 0) {
      hasWonRef.current = true;
      setHasWon(true);
      sounds.playWin();
      const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      if (typeof onLevelComplete === 'function') {
        onLevelComplete(levelData.level_number || 1, hearts, timeTaken);
      }
    }
  }, [arrows.length, arrowsLoaded, levelData, gameOver, hearts, startTime, onLevelComplete]);

  // Coordinate scaling: map grid coords to SVG viewbox (420x420)
  const svgSize = 420;
  const gridSize = levelData?.grid_size || 8;
  const padding = 34;
  const usableSize = svgSize - padding * 2;
  const scale = usableSize / gridSize;

  // Responsive stroke width and arrowhead sizing based on grid density
  const arrowStrokeWidth = Math.max(3.4, Math.min(5.6, 38 / gridSize));
  const arrowheadSize = Math.max(8.5, Math.min(13.5, (36 / gridSize) * 2.3));

  // Compute active bounds and used columns/rows from initial levelData definition
  const { minX, maxX, minY, maxY, usedCols, usedRows } = useMemo(() => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    const usedCols = new Set();
    const usedRows = new Set();

    const allArrows = levelData?.arrows || [];
    allArrows.forEach(arrow => {
      (arrow.points || []).forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
      for (let i = 0; i < (arrow.points || []).length - 1; i++) {
        const [x1, y1] = arrow.points[i];
        const [x2, y2] = arrow.points[i + 1];
        for (let x = Math.floor(Math.min(x1, x2)); x <= Math.ceil(Math.max(x1, x2)); x++) {
          usedCols.add(x);
        }
        for (let y = Math.floor(Math.min(y1, y2)); y <= Math.ceil(Math.max(y1, y2)); y++) {
          usedRows.add(y);
        }
      }
    });

    if (minX === Infinity) {
      minX = 1; maxX = gridSize - 1;
      minY = 1; maxY = gridSize - 1;
    }

    return { minX, maxX, minY, maxY, usedCols, usedRows };
  }, [levelData, gridSize]);

  // Center active maze bounds within SVG viewbox so margins are balanced
  const activeCenterX = (minX + maxX) / 2;
  const activeCenterY = (minY + maxY) / 2;
  const offsetX = (gridSize / 2 - activeCenterX) * scale;
  const offsetY = (gridSize / 2 - activeCenterY) * scale;

  const toSvgCoords = (gx, gy) => [
    padding + offsetX + gx * scale,
    padding + offsetY + gy * scale
  ];

  // Calculate total geometric length of arrow body in SVG units
  const getPathLength = (points) => {
    if (!points || points.length < 2) return 60;
    let len = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = toSvgCoords(points[i][0], points[i][1]);
      const [x2, y2] = toSvgCoords(points[i + 1][0], points[i + 1][1]);
      len += Math.hypot(x2 - x1, y2 - y1);
    }
    return Math.max(30, len);
  };

  const getEffectiveDirection = (arrow) => {
    if (!arrow || !arrow.points || arrow.points.length < 2) return arrow?.direction?.toLowerCase() || 'right';
    const p = arrow.points;
    const p1 = p[p.length - 2];
    const p2 = p[p.length - 1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
  };

  // Generate extended path with exit runway for snake slither animation
  const createExtendedPathD = (points, direction, runway = 500) => {
    const baseD = createPathD(points, direction);
    if (!baseD) return '';
    const endPoint = points[points.length - 1];
    const [hx, hy] = toSvgCoords(endPoint[0], endPoint[1]);
    const dir = getEffectiveDirection({ points, direction });

    let endX = hx;
    let endY = hy;
    if (dir === 'up') endY -= runway;
    else if (dir === 'down') endY += runway;
    else if (dir === 'left') endX -= runway;
    else if (dir === 'right') endX += runway;

    return `${baseD} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
  };

  // Convert arrow points to SVG path with crisp 90-degree corners, stopping slightly inside arrowhead
  const createPathD = (points, direction) => {
    if (!points || points.length < 2) return '';
    const coords = points.map(p => toSvgCoords(p[0], p[1]));
    const len = Math.max(9.5, Math.min(16, (40 / gridSize) * 2.6));
    const pullback = len * 0.45;

    // Pull back the final point strictly along the true segment vector so lines stay 100% straight
    const lastIdx = coords.length - 1;
    const prevP = coords[lastIdx - 1];
    const currP = coords[lastIdx];
    const dx = currP[0] - prevP[0];
    const dy = currP[1] - prevP[1];
    const dist = Math.hypot(dx, dy);

    const lastP = [...currP];
    if (dist > 0.001) {
      lastP[0] -= (dx / dist) * pullback;
      lastP[1] -= (dy / dist) * pullback;
    }

    const adjustedCoords = [...coords.slice(0, lastIdx), lastP];

    let d = `M ${adjustedCoords[0][0].toFixed(1)} ${adjustedCoords[0][1].toFixed(1)}`;
    for (let i = 1; i < adjustedCoords.length; i++) {
      d += ` L ${adjustedCoords[i][0].toFixed(1)} ${adjustedCoords[i][1].toFixed(1)}`;
    }
    return d;
  };

  // Render solid flat-base triangular arrowhead exactly matching reference screenshot
  const renderArrowhead = (arrow) => {
    const endPoint = arrow.points[arrow.points.length - 1];
    const [hx, hy] = toSvgCoords(endPoint[0], endPoint[1]);
    const len = Math.max(9.5, Math.min(16, (40 / gridSize) * 2.6));
    const halfWidth = len * 0.58;

    let d = '';
    const dir = getEffectiveDirection(arrow);
    switch (dir) {
      case 'up':
        // Tip at (hx, hy), flat base at (hy + len)
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx - halfWidth).toFixed(1)} ${(hy + len).toFixed(1)} L ${(hx + halfWidth).toFixed(1)} ${(hy + len).toFixed(1)} Z`;
        break;
      case 'down':
        // Tip at (hx, hy), flat base at (hy - len)
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx + halfWidth).toFixed(1)} ${(hy - len).toFixed(1)} L ${(hx - halfWidth).toFixed(1)} ${(hy - len).toFixed(1)} Z`;
        break;
      case 'right':
        // Tip at (hx, hy), flat base at (hx - len)
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy - halfWidth).toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy + halfWidth).toFixed(1)} Z`;
        break;
      case 'left':
        // Tip at (hx, hy), flat base at (hx + len)
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx + len).toFixed(1)} ${(hy + halfWidth).toFixed(1)} L ${(hx + len).toFixed(1)} ${(hy - halfWidth).toFixed(1)} Z`;
        break;
      default:
        d = `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy - halfWidth).toFixed(1)} L ${(hx - len).toFixed(1)} ${(hy + halfWidth).toFixed(1)} Z`;
    }
    return <path d={d} className="arrow-head" />;
  };

  // Render subtle background grid dots beneath arrows for active puzzle area only
  const renderGridDots = () => {
    const dots = [];
    const dotRadius = Math.max(1.8, Math.min(2.8, (28 / gridSize)));
    const startX = Math.max(1, Math.floor(minX));
    const endX = Math.min(gridSize - 1, Math.ceil(maxX));
    const startY = Math.max(1, Math.floor(minY));
    const endY = Math.min(gridSize - 1, Math.ceil(maxY));

    for (let x = startX; x <= endX; x++) {
      if (usedCols.size > 0 && !usedCols.has(x)) continue;
      for (let y = startY; y <= endY; y++) {
        if (!usedRows.size > 0 && !usedRows.has(y)) continue;
        const [cx, cy] = toSvgCoords(x, y);
        dots.push(
          <circle
            key={`dot-${x}-${y}`}
            cx={cx.toFixed(1)}
            cy={cy.toFixed(1)}
            r={dotRadius}
            fill="#94a3b8"
            opacity="0.45"
            className="puzzle-grid-dot"
          />
        );
      }
    }
    return dots;
  };

  // Handle player tapping on an arrow
  const handleArrowClick = (arrow) => {
    if (gameOver || exitingArrows[arrow.id]) return;
    setMovesCount(prev => prev + 1);

    // Check collision with remaining arrows
    const result = checkArrowObstruction(arrow, arrows);

    if (result.canExit) {
      sounds.playWhoosh();
      setHintedArrowId(null);

      // Trigger snake-like slither exit animation
      const effDir = getEffectiveDirection(arrow);
      setExitingArrows(prev => ({
        ...prev,
        [arrow.id]: effDir
      }));

      // Remove after snake finishes slithering out (440ms)
      setTimeout(() => {
        setArrows(prev => {
          const next = prev.filter(a => a.id !== arrow.id);
          if (next.length === 0 && !hasWonRef.current) {
            hasWonRef.current = true;
            setHasWon(true);
            sounds.playWin();
            const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));
            if (typeof onLevelComplete === 'function') {
              onLevelComplete(levelData.level_number || 1, hearts, timeTaken);
            }
          }
          return next;
        });
        setExitingArrows(prev => {
          const copy = { ...prev };
          delete copy[arrow.id];
          return copy;
        });
      }, 440);

    } else {
      // Collision/Obstruction!
      sounds.playBump();
      setShakingArrowId(arrow.id);
      setTimeout(() => setShakingArrowId(null), 400);

      // Decrement heart
      setHearts(prev => {
        const nextHearts = prev - 1;
        if (nextHearts <= 0) {
          setGameOver(true);
        }
        return Math.max(0, nextHearts);
      });
    }
  };

  // Hint powerup
  const handleUseHint = () => {
    if (hints <= 0 || arrows.length === 0 || gameOver) return;
    const clearable = findClearableArrows(arrows);
    if (clearable.length > 0) {
      sounds.playHint();
      setHints(prev => prev - 1);
      setHintedArrowId(clearable[0].id);
      setTimeout(() => setHintedArrowId(null), 3000);
    }
  };

  // Precision tool powerup
  const handleUseTool = () => {
    if (gameOver || arrows.length === 0) return;
    sounds.playTap();
    if (hearts < maxHearts) {
      setHearts(prev => Math.min(maxHearts, prev + 1));
    } else {
      const clearable = findClearableArrows(arrows);
      if (clearable.length > 0) {
        handleArrowClick(clearable[0]);
      }
    }
  };

  const handleRetry = () => {
    sounds.playTap();
    setGameOver(false);
    setHearts(hardMode ? 2 : 3);
    setArrows(levelData?.arrows || []);
    setExitingArrows({});
    setHintedArrowId(null);
    setMovesCount(0);
  };

  // Keyboard shortcut listener for desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        handleUseHint();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRetry();
      } else if (e.key === 't' || e.key === 'T') {
        handleUseTool();
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const levelNum = levelData?.level_number || 1;
  const isLevel1 = levelNum === 1;

  const clearableCount = findClearableArrows(arrows).length;

  return (
    <div className="game-screen-wrapper">
      {/* Mobile Top Header Bar matching Screenshot 1 & 2 */}
      <div className="mobile-game-top-bar">
        {!isLevel1 ? (
          <button className="icon-btn" onClick={onBack} aria-label="Go back">
            <ChevronLeft size={28} color="#2563eb" strokeWidth={2.4} />
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}

        <span className="game-level-title">
          Level {levelNum}
        </span>

        {!isLevel1 ? (
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
            <Settings size={24} color="#2563eb" strokeWidth={2.2} />
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>

      {/* Unified Floating Stats Pill (Levels 2+) */}
      {!isLevel1 && (
        <div className="unified-stats-pill-container">
          <div className="unified-stats-pill">
            {/* Arrow Counter with Rocket Icon */}
            <div className="pill-stat-group" title="Arrows remaining">
              <Send size={15} color="#475569" style={{ transform: 'rotate(-45deg)' }} />
              <span className="pill-stat-count">{arrows.length}</span>
            </div>

            {/* Red Hearts */}
            <div className="pill-hearts-group" title={`${hearts} / ${maxHearts} hearts left`}>
              {Array.from({ length: maxHearts }, (_, i) => i + 1).map((num) => (
                <Heart
                  key={num}
                  size={20}
                  className={`heart-icon ${num > hearts ? 'lost' : ''}`}
                />
              ))}
            </div>

            {/* Bottleneck Indicator */}
            {arrows.length > 0 && (
              <div
                className="pill-bottleneck-badge"
                title={`${clearableCount} unblocked arrow${clearableCount === 1 ? '' : 's'} right now`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: clearableCount <= 1 ? '#be123c' : '#1e40af',
                  background: clearableCount <= 1 ? '#ffe4e6' : '#eff6ff',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: clearableCount <= 1 ? '1px solid #fecdd3' : '1px solid #bfdbfe'
                }}
              >
                <span>🎯 {clearableCount} Open</span>
              </div>
            )}

            {/* Difficulty & Hard Mode Badge */}
            <div className="pill-diff-group">
              {hardMode ? (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #e11d48, #be123c)',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                  }}
                >
                  🔥 Hard
                </span>
              ) : (
                <span className="pill-diff-badge">{levelData?.difficulty || 'Normal'}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Game Stage */}
      <div className="game-responsive-stage">
        {/* DESKTOP LEFT PANEL */}
        <aside className="game-desktop-panel left-panel">
          <button className="desktop-back-btn" onClick={onBack}>
            <ChevronLeft size={20} />
            <span>Back to Menu</span>
          </button>

          <div className="desktop-card level-info-card">
            <div className="level-info-header">
              <span className="level-badge-tag">Puzzle</span>
              <span className="difficulty-badge-pill">{levelData?.difficulty || 'Normal'}</span>
            </div>
            <h2 className="desktop-level-heading">Level {levelNum}</h2>
            <div className="desktop-level-meta">
              <span>Grid: {gridSize}×{gridSize}</span>
              <span>•</span>
              <span>100 Levels Total</span>
            </div>

            {/* Arrow Remaining Pill */}
            <div className="desktop-arrow-counter-pill">
              <div className="pill-icon-circle">
                <Send size={16} style={{ transform: 'rotate(-45deg)' }} />
              </div>
              <div className="pill-text-group">
                <span className="count-number">{arrows.length}</span>
                <span className="count-label">Arrows Left</span>
              </div>
            </div>

            {/* Live Stats Row: Moves & Open Paths */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginTop: '12px',
              padding: '10px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Taps / Moves</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{movesCount}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Safe Moves</span>
                <p style={{
                  margin: '2px 0 0 0',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: clearableCount <= 1 ? '#e11d48' : '#2563eb'
                }}>
                  {clearableCount}
                </p>
              </div>
            </div>

            {/* Hard Mode Toggle Button on Desktop */}
            {onToggleHardMode && (
              <button
                onClick={onToggleHardMode}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: hardMode ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                  background: hardMode ? '#fff1f2' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: hardMode ? '#be123c' : '#475569' }}>
                  {hardMode ? '🔥 Hard Mode (2 Hearts)' : '⚡ Standard Mode (3 Hearts)'}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: hardMode ? '#ffffff' : '#64748b',
                  background: hardMode ? '#e11d48' : '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {hardMode ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {/* Level Quick Navigation */}
            {onJumpLevel && (
              <div className="level-jump-actions">
                <button
                  className="btn-jump-level"
                  disabled={levelNum <= 1}
                  onClick={() => onJumpLevel(levelNum - 1)}
                  title="Previous Level"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  className="btn-jump-level"
                  disabled={levelNum >= 100}
                  onClick={() => onJumpLevel(levelNum + 1)}
                  title="Next Level"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Keyboard Shortcuts Helper */}
          <div className="desktop-card shortcuts-card">
            <div className="shortcuts-title">
              <Keyboard size={16} color="#64748b" />
              <span>Keyboard Controls</span>
            </div>
            <div className="shortcuts-list">
              <div className="shortcut-row">
                <kbd className="key-badge">H</kbd>
                <span>Reveal Safe Hint</span>
              </div>
              <div className="shortcut-row">
                <kbd className="key-badge">R</kbd>
                <span>Restart Puzzle</span>
              </div>
              <div className="shortcut-row">
                <kbd className="key-badge">T</kbd>
                <span>Precision Tool</span>
              </div>
              <div className="shortcut-row">
                <kbd className="key-badge">Esc</kbd>
                <span>Main Menu</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER ARENA: PUZZLE BOARD */}
        <main className="game-center-arena">
          <div className="puzzle-board-card">
            {/* Level 1 Tutorial Overlay with Pointing Hand & "Tap to remove" Bubble */}
            {isLevel1 && arrows.some(a => a.id === 'a2') && (
              <div className="tutorial-overlay">
                <div className="tutorial-hand-wrapper">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="tutorial-hand-svg">
                    <path
                      d="M10 2a2 2 0 0 0-2 2v6.5l-1.4-.8a2.1 2.1 0 0 0-2.8.6 2 2 0 0 0 .5 2.8l4.4 3.7c1.3 1.1 2.9 1.8 4.6 1.8h3c3.3 0 6-2.7 6-6V9a2 2 0 0 0-2-2 2 2 0 0 0-1.8 1.1A2 2 0 0 0 17 7a2 2 0 0 0-1.8 1.1A2 2 0 0 0 13.5 7H13V4a2 2 0 0 0-2-2h-1z"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="tutorial-speech-bubble">
                  <div className="bubble-tail-arrow" />
                  <span>Tap to remove</span>
                </div>
              </div>
            )}

            <svg
              className="puzzle-svg"
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Subtle background grid dots beneath arrows */}
              <g className="puzzle-grid-dots" pointerEvents="none">
                {renderGridDots()}
              </g>

              {arrows.map((arrow) => {
                const isExiting = exitingArrows[arrow.id];
                const isBlocked = shakingArrowId === arrow.id;
                const isHinted = hintedArrowId === arrow.id;

                let groupClass = 'arrow-group';
                if (isBlocked) groupClass += ' blocked';
                if (isHinted) groupClass += ' hint-active';

                const bodyLen = Math.round(getPathLength(arrow.points));
                const runway = 520;
                const slitherDist = Math.round(bodyLen + runway);

                const activePathD = isExiting
                  ? createExtendedPathD(arrow.points, arrow.direction, runway)
                  : createPathD(arrow.points, arrow.direction);

                return (
                  <g
                    key={arrow.id}
                    className={groupClass}
                    onClick={() => handleArrowClick(arrow)}
                    style={{
                      cursor: 'pointer',
                      '--body-len': `${bodyLen}px`,
                      '--slither-dist': `${slitherDist}px`,
                      '--slither-dist-neg': `-${slitherDist}px`
                    }}
                  >
                    {/* Wide invisible stroke for easy tapping/clicking */}
                    <path
                      d={createPathD(arrow.points, arrow.direction)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={Math.max(24, arrowStrokeWidth * 4.8)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Visual snake line path */}
                    <path
                      d={activePathD}
                      fill="none"
                      className={`arrow-path ${isExiting ? 'slithering-body' : ''}`}
                      style={{
                        strokeWidth: arrowStrokeWidth,
                        ...(isExiting ? {
                          strokeDasharray: `${bodyLen} ${slitherDist + 200}`,
                          strokeDashoffset: 0
                        } : {})
                      }}
                    />
                    {/* Sharp Arrowhead (mouth of the snake leading the way) */}
                    <g className={`arrowhead-wrapper ${isExiting ? `slithering-head-${isExiting}` : ''}`}>
                      {renderArrowhead(arrow)}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </main>

        {/* DESKTOP RIGHT PANEL */}
        <aside className="game-desktop-panel right-panel">
          {/* Lives Card */}
          <div className="desktop-card lives-card">
            <span className="panel-card-subtitle">Lives Remaining</span>
            <div className="desktop-hearts-display">
              {Array.from({ length: maxHearts }, (_, i) => i + 1).map((num) => (
                <Heart
                  key={num}
                  size={32}
                  className={`heart-icon ${num > hearts ? 'lost' : ''}`}
                />
              ))}
            </div>
            <span className="lives-text">{hearts} of {maxHearts} Lives</span>
          </div>

          {/* Power-ups Panel */}
          <div className="desktop-card powerups-card">
            <span className="panel-card-subtitle">Power-Ups</span>

            <button
              className="desktop-powerup-btn hint-btn"
              onClick={handleUseHint}
              disabled={hints <= 0}
              title="Reveal safe unblocked arrow [H]"
            >
              <div className="powerup-icon-wrapper bulb">
                <Lightbulb size={22} color="#ffffff" strokeWidth={2.4} />
                <span className="powerup-badge">{hints}</span>
              </div>
              <div className="powerup-text-group">
                <span className="powerup-title">Hint [H]</span>
                <span className="powerup-desc">Shows next safe arrow</span>
              </div>
            </button>

            <button
              className="desktop-powerup-btn tool-btn"
              onClick={handleUseTool}
              title="Safely eliminate obstacle or restore life [T]"
            >
              <div className="powerup-icon-wrapper ruler">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(-40deg)' }}>
                  <rect x="2" y="7" width="20" height="10" rx="2.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.4" />
                  <line x1="6" y1="7" x2="6" y2="11" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="10" y1="7" x2="10" y2="12" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="14" y1="7" x2="14" y2="11" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="18" y1="7" x2="18" y2="12" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="powerup-text-group">
                <span className="powerup-title">Power Tool [T]</span>
                <span className="powerup-desc">Clears 1 arrow or +1 life</span>
              </div>
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="desktop-card actions-card">
            <button className="desktop-restart-btn" onClick={handleRetry}>
              <RotateCcw size={18} />
              <span>Restart Level [R]</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Floating Bottom Power-ups Toolbar matching all Screenshots */}
      <div className="mobile-game-bottom-tools">
        {/* Hint Lightbulb */}
        <button
          className="tool-button"
          onClick={handleUseHint}
          disabled={hints <= 0}
          aria-label="Use Hint"
        >
          <div className="floating-tool-circle bulb-circle">
            <Lightbulb size={22} color="#ffffff" strokeWidth={2.4} />
            <div className="tool-badge">{hints}</div>
          </div>
        </button>

        {/* Ruler / Power Tool */}
        <button
          className="tool-button"
          onClick={handleUseTool}
          aria-label="Power Tool"
        >
          <div className="floating-tool-circle ruler-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(-40deg)' }}>
              <rect x="2" y="7" width="20" height="10" rx="2.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.4" />
              <line x1="6" y1="7" x2="6" y2="11" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="10" y1="7" x2="10" y2="12" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="14" y1="7" x2="14" y2="11" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="18" y1="7" x2="18" y2="12" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>💔</div>
            <h2 className="modal-title">Out of Lives!</h2>
            <p className="modal-body">
              Arrows collided too many times! Don’t worry, you can retry this puzzle anytime.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onBack}>
                Main Menu
              </button>
              <button className="btn-primary" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
