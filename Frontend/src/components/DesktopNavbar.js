'use client';

import React, { useState } from 'react';
import { Compass, Calendar, Volume2, VolumeX, User, LogIn } from 'lucide-react';
import { sounds } from '../game/soundEffects';

export default function DesktopNavbar({
  currentLevel = 1,
  onOpenDaily,
  onOpenProfile,
  onOpenAuth,
  onSelectLevel,
  onGoHome,
  activeScreen = 'home',
  profile = null
}) {
  const [muted, setMuted] = useState(sounds.muted);

  const toggleSound = () => {
    const nextMuted = !muted;
    sounds.setMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) sounds.playTap();
  };

  const isAuthenticated = Boolean(profile?.email || (profile?.uid && profile?.uid !== 'guest'));

  const handleProfileOrAuthClick = () => {
    sounds.playTap();
    if (isAuthenticated) {
      if (onOpenProfile) onOpenProfile();
    } else {
      if (onOpenAuth) onOpenAuth('signin');
      else if (onOpenProfile) onOpenProfile();
    }
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
          {activeScreen !== 'login' && (
            <button
              className="desktop-nav-btn"
              onClick={() => { sounds.playTap(); onOpenDaily(); }}
              title="Daily Challenge"
            >
              <Calendar size={18} />
              <span className="nav-btn-label">Daily Challenge</span>
            </button>
          )}

          <button
            className="desktop-nav-btn icon-only"
            onClick={toggleSound}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX size={19} color="#ef4444" /> : <Volume2 size={19} color="#2563eb" />}
          </button>

          {activeScreen !== 'login' && (
            <button
              className={`desktop-nav-btn ${isAuthenticated ? 'user-authenticated' : 'nav-btn-signin'}`}
              onClick={handleProfileOrAuthClick}
              title={isAuthenticated ? `${profile?.username || 'Player Profile'}` : "Sign In or Sign Up to Play"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                ...(!isAuthenticated ? {
                  background: '#2563eb',
                  color: '#ffffff',
                  border: '1px solid #1d4ed8',
                  fontWeight: 600
                } : {})
              }}
            >
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #3b82f6'
                  }}
                />
              ) : isAuthenticated ? (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: 'white',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {(profile?.username || 'U')[0].toUpperCase()}
                </div>
              ) : (
                <LogIn size={16} color="#ffffff" />
              )}
              <span className="nav-btn-label" style={{ color: !isAuthenticated ? '#ffffff' : undefined }}>
                {isAuthenticated ? (profile.username?.split(' ')[0] || 'Profile') : 'Sign In'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
