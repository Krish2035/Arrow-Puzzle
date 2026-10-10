'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from '../components/HomeScreen';
import LoginScreen from '../components/LoginScreen';
import GameScreen from '../components/GameScreen';
import LevelWinScreen from '../components/LevelWinScreen';
import DailyModal from '../components/DailyModal';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import AuthModal from '../components/AuthModal';
import DesktopNavbar from '../components/DesktopNavbar';
import { fetchLevel, submitLevelWin, fetchDailyChallenge, fetchUserProfile, syncUserProfile } from '../services/api';
import { subscribeToAuthChanges } from '../services/firebase';

export default function Page() {
  // Navigation states: 'login' | 'home' | 'game' | 'win'
  const [screen, setScreen] = useState('login');
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');
  const [pendingLevel, setPendingLevel] = useState(null);
  const [hardMode, setHardMode] = useState(false);

  // Determine if user is logged in
  const isAuthenticated = Boolean(userProfile?.email || (userProfile?.uid && userProfile?.uid !== 'guest'));

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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      if (authUser) {
        const synced = await syncUserProfile({
          uid: authUser.uid,
          username: authUser.displayName,
          email: authUser.email,
          photoURL: authUser.photoURL,
          provider: authUser.provider || 'firebase'
        });
        setUserProfile(prev => ({ ...prev, ...synced }));
        // When authenticated user is detected, move from login to home
        setScreen(prev => (prev === 'login' ? 'home' : prev));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load initial profile and level data
  useEffect(() => {
    async function loadInitial() {
      let startLvl = 3;
      let initialView = 'login';

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

      // Only enter game if authenticated; otherwise first screen is login
      const hasAuth = Boolean(profile?.email || (profile?.uid && profile?.uid !== 'guest'));
      if (hasAuth) {
        if (initialView !== 'home' && initialView !== 'login') {
          setScreen(initialView);
        } else {
          setScreen('home');
        }
      } else {
        setScreen('login');
      }
    }
    loadInitial();
  }, []);

  // Actual launch logic once authenticated
  const startActualGame = async (levelNumberOrType) => {
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

  // Handle starting a game (Gated by Authentication)
  const handleStartGame = async (levelNumberOrType) => {
    if (!isAuthenticated) {
      // Without login or signup, user will not be able to play the game!
      setPendingLevel(levelNumberOrType);
      setAuthModalTab('signin');
      setAuthModalOpen(true);
      return;
    }
    await startActualGame(levelNumberOrType);
  };

  // Triggered upon successful Sign In, Sign Up, or Google Sign-In
  const handleAuthSuccess = async (authUser) => {
    const synced = await syncUserProfile({
      uid: authUser.uid,
      username: authUser.displayName,
      email: authUser.email,
      photoURL: authUser.photoURL,
      provider: authUser.provider || 'firebase'
    });
    setUserProfile(prev => ({ ...prev, ...synced }));
    setAuthModalOpen(false);

    // If user clicked to play a level, seamlessly launch it now; otherwise go to home
    if (pendingLevel !== null) {
      const targetLevel = pendingLevel;
      setPendingLevel(null);
      await startActualGame(targetLevel);
    } else {
      setScreen('home');
    }
  };

  // Handle completing a level
  const handleLevelComplete = useCallback((clearedLevelNumber, heartsLeft, timeSeconds) => {
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
  }, [currentLevel, levelData]);

  // Handle Next Game action from win screen
  const handleNextGame = async (nextLevelNumber) => {
    if (!isAuthenticated) {
      setPendingLevel(nextLevelNumber);
      setAuthModalTab('signin');
      setAuthModalOpen(true);
      return;
    }
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

  // Handle Profile Update / Google Login Sync
  const handleProfileUpdate = async (updatedData) => {
    const synced = await syncUserProfile(updatedData);
    setUserProfile(prev => ({ ...prev, ...synced }));
  };

  const openAuthModal = (tab = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="app-shell">
      {screen !== 'login' && (
        <DesktopNavbar
          currentLevel={levelData?.level_number || currentLevel}
          onOpenDaily={() => {
            if (!isAuthenticated) {
              setPendingLevel('daily');
              openAuthModal('signin');
            } else {
              setDailyOpen(true);
            }
          }}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAuth={openAuthModal}
          onSelectLevel={handleStartGame}
          onGoHome={handleGoHome}
          activeScreen={screen}
          profile={userProfile}
        />
      )}

      <main className="app-main-content">
        {screen === 'login' && (
          <LoginScreen
            onAuthSuccess={handleAuthSuccess}
            onContinueAsGuest={() => setScreen('home')}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            currentLevel={currentLevel}
            onStartGame={handleStartGame}
            onOpenDaily={() => {
              if (!isAuthenticated) {
                setPendingLevel('daily');
                openAuthModal('signin');
              } else {
                setDailyOpen(true);
              }
            }}
            onOpenProfile={() => {
              if (!isAuthenticated) {
                openAuthModal('signin');
              } else {
                setProfileOpen(true);
              }
            }}
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

      {/* Authentication Modal (Sign In / Sign Up & Continue with Google) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingLevel(null);
        }}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalTab}
        title={authModalTab === 'signin' ? 'Sign In to Play' : 'Sign Up to Play'}
        subtitle="Sign in or create an account to start playing Arrow Puzzle mazes and save your scores."
      />

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
        onProfileUpdate={handleProfileUpdate}
        onOpenAuth={openAuthModal}
        onSignOut={() => setScreen('login')}
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
