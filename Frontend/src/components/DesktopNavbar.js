'use client';

import React, { useState } from 'react';
import { Compass, Calendar, Grid, Volume2, VolumeX, User, HelpCircle } from 'lucide-react';
import { sounds } from '../game/soundEffects';

export default function DesktopNavbar({
  currentLevel = 1,
  onOpenDaily,
  onOpenProfile,
  onSelectLevel,
  onGoHome,
  activeScreen = 'home'
}) {
  const [muted, setMuted] = useState(sounds.muted);

  const toggleSound = () => {
    const nextMuted = !muted;
    sounds.setMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) sounds.playTap();
  };

  return (
    <header className="desktop-navbar">
      <div className="desktop-nav-content">
        {/* Brand Logo & Name */}
        <div className="desktop-brand" onClick={onGoHome} role="button" tabIndex={0}>
          <div className="desktop-brand-icon">
            <Compass size={22} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div className="desktop-brand-text">
            <span className="desktop-brand-title">Arrow Puzzle</span>
            <span className="desktop-brand-badge">100 Levels</span>
          </div>
        </div>

        {/* Center Level Info if in Game */}
        {activeScreen === 'game' && (
          <div className="desktop-nav-level-pill">
            <span className="pill-dot" />
            <span>Playing Level {currentLevel}</span>
          </div>
        )}

        {/* Right Navigation Actions */}
        <div className="desktop-nav-actions">
          <button
            className="desktop-nav-btn"
            onClick={() => { sounds.playTap(); onOpenDaily(); }}
            title="Daily Challenge"
          >
            <Calendar size={18} />
            <span className="nav-btn-label">Daily Challenge</span>
          </button>

          <button
            className="desktop-nav-btn icon-only"
            onClick={toggleSound}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX size={19} color="#ef4444" /> : <Volume2 size={19} color="#2563eb" />}
          </button>

          <button
            className="desktop-nav-btn"
            onClick={() => { sounds.playTap(); onOpenProfile(); }}
            title="Player Profile"
          >
            <User size={18} />
            <span className="nav-btn-label">Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}
