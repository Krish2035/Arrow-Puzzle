'use client';

import React, { useState, useEffect } from 'react';
import HomeScreen from '../components/HomeScreen';
import GameScreen from '../components/GameScreen';
import LevelWinScreen from '../components/LevelWinScreen';
import DailyModal from '../components/DailyModal';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import { fetchLevel, submitLevelWin, fetchDailyChallenge, fetchUserProfile } from '../services/api';

import DesktopNavbar from '../components/DesktopNavbar';

export default function Page() {
  // Navigation states: 'home' | 'game' | 'win'
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('main');

  // Game data states
  const [currentLevel, setCurrentLevel] = useState(3);
  const [levelData, setLevelData] = useState(null);
  const [lastClearedLevelData, setLastClearedLevelData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Modals
  const [dailyOpen, setDailyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hardMode, setHardMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arrow_puzzle_hard_mode');
      if (saved === 'true') setHardMode(true);
    }
  }, []);

  const handleToggleHardMode = () => {
    setHardMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('arrow_puzzle_hard_mode', String(next));
      }
      return next;
    });
  };

  // Load initial profile and level data
  useEffect(() => {
    async function loadInitial() {
      let startLvl = 3;
      let initialView = 'home';

      let hasExplicitLevel = false;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryLvl = parseInt(params.get('level'), 10);
        const view = params.get('view');
        if (queryLvl) {
          startLvl = queryLvl;
          hasExplicitLevel = true;
        }
        if (view) initialView = view;
        window.__SET_SCREEN__ = (s) => setScreen(s);
      }

      const profile = await fetchUserProfile();
      if (profile) {
        setUserProfile(profile);
        if (profile.current_level && !hasExplicitLevel) {
          startLvl = profile.current_level;
        }
      }

      const level = await fetchLevel(startLvl);
      setLevelData(level);
      setLastClearedLevelData(level);
      setCurrentLevel(startLvl);
      if (initialView !== 'home') setScreen(initialView);
    }
    loadInitial();
  }, []);

  // Handle starting a game (from Home or Daily)
  const handleStartGame = async (levelNumberOrType) => {
    if (levelNumberOrType === 'daily') {
      const dailyData = await fetchDailyChallenge();
      setLevelData(dailyData);
      setLastClearedLevelData(dailyData);
      setScreen('game');
    } else {
      const num = parseInt(levelNumberOrType, 10) || currentLevel;
      const data = await fetchLevel(num);
      setLevelData(data);
      setLastClearedLevelData(data);
      setCurrentLevel(num);
      setScreen('game');
    }
  };

  // Handle completing a level
  const handleLevelComplete = (clearedLevelNumber, heartsLeft, timeSeconds) => {
    const num = parseInt(clearedLevelNumber, 10) || currentLevel;
    const nextLvl = Math.min(100, num + 1);

    if (levelData) {
      setLastClearedLevelData(levelData);
    }
    // Immediate instant transition to victory screen
    setCurrentLevel(nextLvl);
    setScreen('win');

    // Asynchronously record in backend/localStorage in background
    submitLevelWin(num, heartsLeft, timeSeconds)
      .then(res => {
        if (res && res.data && res.data.profile) {
          setUserProfile(res.data.profile);
          if (res.data.next_level) {
            setCurrentLevel(res.data.next_level);
          }
        }
      })
      .catch(err => {
        console.warn('Background sync:', err);
      });
  };

  // Handle Next Game action from win screen
  const handleNextGame = async (nextLevelNumber) => {
    const data = await fetchLevel(nextLevelNumber);
    setLevelData(data);
    setLastClearedLevelData(data);
    setCurrentLevel(nextLevelNumber);
    setScreen('game');
  };

  // Handle returning to Home
  const handleGoHome = async () => {
    setScreen('home');
    setActiveTab('main');
    const profile = await fetchUserProfile();
    if (profile) setUserProfile(profile);
  };

  return (
    <div className="app-shell">
      <DesktopNavbar
        currentLevel={levelData?.level_number || currentLevel}
        onOpenDaily={() => setDailyOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onSelectLevel={handleStartGame}
        onGoHome={handleGoHome}
        activeScreen={screen}
      />

      <main className="app-main-content">
        {screen === 'home' && (
          <HomeScreen
            currentLevel={currentLevel}
            onStartGame={handleStartGame}
            onOpenDaily={() => setDailyOpen(true)}
            onOpenProfile={() => setProfileOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {screen === 'game' && levelData && (
          <GameScreen
            levelData={levelData}
            onBack={handleGoHome}
            onLevelComplete={handleLevelComplete}
            onOpenSettings={() => setSettingsOpen(true)}
            onJumpLevel={handleStartGame}
            hardMode={hardMode}
            onToggleHardMode={handleToggleHardMode}
          />
        )}

        {screen === 'win' && (
          <LevelWinScreen
            completedLevel={lastClearedLevelData?.level_number || levelData?.level_number || 1}
            onNextGame={handleNextGame}
            onGoHome={handleGoHome}
            levelPreviewData={lastClearedLevelData}
          />
        )}
      </main>

      {/* Popups & Modals */}
      <DailyModal
        isOpen={dailyOpen}
        onClose={() => setDailyOpen(false)}
        onPlayDaily={() => {
          setDailyOpen(false);
          handleStartGame('daily');
        }}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={userProfile}
        currentLevel={currentLevel}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        hardMode={hardMode}
        onToggleHardMode={handleToggleHardMode}
        onRestartLevel={() => {
          if (levelData) {
            handleStartGame(levelData.level_number);
          }
        }}
      />
    </div>
  );
}
