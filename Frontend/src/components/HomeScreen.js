'use client';

import React, { useState } from 'react';
import { Calendar, Home, User, Star, Play, Sparkles, Grid, CheckCircle2, Award } from 'lucide-react';
import { sounds } from '../game/soundEffects';

export default function HomeScreen({
  currentLevel = 3,
  onStartGame,
  onOpenDaily,
  onOpenProfile,
  activeTab = 'main',
  setActiveTab
}) {
  const [levelCategory, setLevelCategory] = useState('all'); // 'all' | 'easy' | 'medium' | 'hard' | 'master'
  const [showLevelBrowserMobile, setShowLevelBrowserMobile] = useState(false);

  const today = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dateString = `${months[today.getMonth()]} ${today.getDate()}`;

  const handlePlayDaily = (e) => {
    if (e) e.stopPropagation();
    sounds.playTap();
    onStartGame('daily');
  };

  const handleStartCurrentLevel = () => {
    sounds.playTap();
    onStartGame(currentLevel);
  };

  const handleSelectSpecificLevel = (lvlNum) => {
    sounds.playTap();
    onStartGame(lvlNum);
  };

  // Filter levels
  const allLevels = Array.from({ length: 100 }, (_, i) => i + 1);
  const filteredLevels = allLevels.filter((lvl) => {
    if (levelCategory === 'easy') return lvl <= 20;
    if (levelCategory === 'medium') return lvl > 20 && lvl <= 50;
    if (levelCategory === 'hard') return lvl > 50 && lvl <= 80;
    if (levelCategory === 'master') return lvl > 80;
    return true;
  });

  return (
    <div className="home-screen-wrapper">
      {/* Abstract geometric background shapes */}
      <div className="bg-abstract-shapes">
        <svg className="abstract-shape shape-2" viewBox="0 0 200 200">
          <path d="M 50,30 L 180,10 L 150,170 L 30,130 Z" fill="#ffffff" />
        </svg>
        <svg className="abstract-shape shape-3" viewBox="0 0 200 200">
          <path d="M 20,40 L 160,20 L 130,150 L 10,120 Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="home-layout-container">
        {/* Desktop Header Banner */}
        <div className="home-hero-header">
          <div className="home-badge-row">
            <span className="hero-pill-badge">
              <Sparkles size={14} className="hero-pill-icon" /> Guaranteed Solvable Mazes
            </span>
          </div>
          <h1 className="hero-main-title">Arrow Puzzle</h1>
          <p className="hero-subtext">
            Untangle the directional labyrinth. Tap arrows in the correct sequence so each one flies free without collision.
          </p>
        </div>

        {/* Desktop & Tablet Main Content Grid */}
        <div className="home-dashboard-grid">
          {/* Left Column: Primary Play Card & Daily Challenge */}
          <div className="home-primary-cards">
            {/* Play Current Level Hero Card */}
            <div className="card-play-hero">
              <div className="play-hero-content">
                <div className="play-level-badge">Current Level</div>
                <h2 className="play-level-number">Level {currentLevel}</h2>
                <p className="play-level-desc">
                  {currentLevel <= 20 ? 'Easy • Simple intersections' : currentLevel <= 50 ? 'Normal • Dense maze' : currentLevel <= 80 ? 'Hard • Multi-turn pathways' : 'Master • Extreme density'}
                </p>
              </div>
              <button className="desktop-new-game-btn" onClick={handleStartCurrentLevel}>
                <span className="btn-glow" />
                <Play size={20} fill="#ffffff" />
                <span>Play Level {currentLevel}</span>
              </button>
            </div>

            {/* Daily Challenge Card matching Screenshot 1 */}
            <div className="daily-challenge-card" onClick={handlePlayDaily}>
              <div className="daily-icon-wrapper">
                <Calendar size={28} color="#ffffff" strokeWidth={2.4} />
                <div className="daily-star-badge">
                  <Star size={11} fill="#ff9900" color="#ff9900" />
                </div>
              </div>
              <div className="daily-title">DAILY CHALLENGE</div>
              <div className="daily-date">{dateString}</div>
              <button className="daily-play-btn" onClick={handlePlayDaily}>
                Play
              </button>
            </div>
          </div>

          {/* Right Column: 100-Level Selector Grid on Desktop */}
          <div className="home-level-browser-card">
            <div className="level-browser-header">
              <div className="browser-title-group">
                <Grid size={20} color="#2563eb" />
                <h3 className="browser-title">Level Selector</h3>
                <span className="browser-count">100 Levels</span>
              </div>

              {/* Filter tabs */}
              <div className="level-filter-tabs">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'easy', label: '1-20' },
                  { id: 'medium', label: '21-50' },
                  { id: 'hard', label: '51-80' },
                  { id: 'master', label: '81-100' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`filter-tab-btn ${levelCategory === tab.id ? 'active' : ''}`}
                    onClick={() => setLevelCategory(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Levels Grid */}
            <div className="level-grid-scroll">
              <div className="level-grid">
                {filteredLevels.map((lvl) => {
                  const isCurrent = lvl === currentLevel;
                  const isCompleted = lvl < currentLevel;
                  return (
                    <button
                      key={lvl}
                      className={`level-cell-btn ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleSelectSpecificLevel(lvl)}
                      title={`Play Level ${lvl}`}
                    >
                      <span className="lvl-num">{lvl}</span>
                      {isCompleted && <Star size={10} className="lvl-star" fill="#eab308" color="#eab308" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View Classic Action Button (Visible on mobile screens) */}
        <div className="mobile-home-actions">
          <h1 className="mobile-brand-title">Arrow Puzzle</h1>
          <div className="mobile-buttons-group">
            <button className="new-game-btn" onClick={handleStartCurrentLevel}>
              <span className="new-game-title">New Game</span>
              <span className="new-game-subtitle">Level {currentLevel}</span>
            </button>
            <button
              className="mobile-browse-levels-btn"
              onClick={() => setShowLevelBrowserMobile(true)}
            >
              <Grid size={16} /> Browse 100 Levels
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Level Browser Modal */}
      {showLevelBrowserMobile && (
        <div className="modal-overlay" onClick={() => setShowLevelBrowserMobile(false)}>
          <div className="modal-card mobile-levels-modal" onClick={(e) => e.stopPropagation()}>
            <div className="browser-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Grid size={20} color="#2563eb" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Select Level</h3>
              </div>
              <button
                className="btn-icon-close"
                onClick={() => setShowLevelBrowserMobile(false)}
              >
                ✕
              </button>
            </div>

            <div className="level-grid-scroll" style={{ maxHeight: '55vh' }}>
              <div className="level-grid">
                {allLevels.map((lvl) => {
                  const isCurrent = lvl === currentLevel;
                  const isCompleted = lvl < currentLevel;
                  return (
                    <button
                      key={lvl}
                      className={`level-cell-btn ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => {
                        setShowLevelBrowserMobile(false);
                        handleSelectSpecificLevel(lvl);
                      }}
                    >
                      <span className="lvl-num">{lvl}</span>
                      {isCompleted && <Star size={10} className="lvl-star" fill="#eab308" color="#eab308" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (for Mobile / Tablet) */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'main' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('main');
          }}
        >
          <Home size={22} strokeWidth={2.4} />
          <span>Main</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('daily');
            onOpenDaily();
          }}
        >
          <Calendar size={22} strokeWidth={2} />
          <span>Daily</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'me' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('me');
            onOpenProfile();
          }}
        >
          <User size={22} strokeWidth={2} />
          <span>Me</span>
        </button>
      </nav>
    </div>
  );
}
