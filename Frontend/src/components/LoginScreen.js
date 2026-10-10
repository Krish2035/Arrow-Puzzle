'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  FileVideo
} from 'lucide-react';
import { sounds } from '../game/soundEffects';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebase';

export default function LoginScreen({ onAuthSuccess, onContinueAsGuest }) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [configErrorHelp, setConfigErrorHelp] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Video state
  const [videoUrl, setVideoUrl] = useState('/resources/Arrow_Puzzle.mp4');
  const [videoFilename, setVideoFilename] = useState('Arrow_Puzzle.mp4');
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef(null);

  // Auto-detect video in frontend/resources
  useEffect(() => {
    let isMounted = true;
    async function checkVideo() {
      try {
        const res = await fetch('/api/resources', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.found && data.videoUrl) {
            setVideoUrl(data.videoUrl);
            setVideoFilename(data.filename || '');
            return;
          }
        }
      } catch (e) {
        // Fallback test for common filename
      }
    }

    checkVideo();
    // Poll every 3 seconds so if user adds the video file, it immediately detects it!
    const interval = setInterval(checkVideo, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTabSwitch = (newTab) => {
    sounds.playTap?.();
    setTab(newTab);
    setError('');
    setConfigErrorHelp(false);
  };

  const handleDemoSignIn = async () => {
    sounds.playTap?.();
    setLoading(true);
    const demoUser = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      displayName: displayName || (email ? email.split('@')[0] : 'Arrow Player'),
      email: email || 'player@arrowpuzzle.com',
      photoURL: null,
      provider: 'local'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('arrow_puzzle_local_auth_user', JSON.stringify(demoUser));
    }
    sounds.playSuccess?.();
    if (onAuthSuccess) {
      await onAuthSuccess(demoUser);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    sounds.playTap?.();
    setLoading(true);
    setError('');
    setConfigErrorHelp(false);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        sounds.playSuccess?.();
        if (onAuthSuccess) {
          await onAuthSuccess(res.user);
        }
      } else if (res.error && !res.error.includes('cancelled')) {
        setError(res.error);
        if (res.isConfigError || res.code === 'auth/configuration-not-found') {
          setConfigErrorHelp(true);
        }
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('configuration-not-found'))) {
        setConfigErrorHelp(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    sounds.playTap?.();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (tab === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.success && res.user) {
          sounds.playSuccess?.();
          if (onAuthSuccess) {
            await onAuthSuccess(res.user);
          }
        } else {
          setError(res.error || 'Failed to sign in.');
          if (res.code === 'auth/configuration-not-found') {
            setConfigErrorHelp(true);
          }
        }
      } else {
        const res = await signUpWithEmail(email, password, displayName || 'Arrow Master');
        if (res.success && res.user) {
          sounds.playSuccess?.();
          if (onAuthSuccess) {
            await onAuthSuccess(res.user);
          }
        } else {
          setError(res.error || 'Failed to create account.');
          if (res.code === 'auth/configuration-not-found') {
            setConfigErrorHelp(true);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-split-wrapper">
      {/* LEFT HALF: Video Showcase Section */}
      <div className="login-split-left">
        {videoUrl ? (
          <div className="login-video-container">
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted={videoMuted}
              playsInline
              className="login-video-element"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            />

            {/* Video Overlay Top Badge */}
            <div className="login-video-top-badge">
              <div className="login-hero-logo small" style={{ width: '32px', height: '32px' }}>
                <Compass size={18} color="#ffffff" strokeWidth={2.4} />
              </div>
              <span className="login-video-badge-text">Arrow Puzzle Showcase</span>
            </div>
          </div>
        ) : (
          /* Video Placeholder when user has not yet dropped their video into frontend/resources */
          <div className="login-video-placeholder">
            <div className="login-placeholder-inner">
              <div className="login-placeholder-icon-wrap">
                <Video size={42} color="#2563eb" />
                <span className="pulse-ping"></span>
              </div>

              <div className="login-badge-row" style={{ justifyContent: 'center' }}>
                <span className="hero-pill-badge">
                  <Sparkles size={14} className="hero-pill-icon" /> Video Section Ready
                </span>
              </div>

              <h2 className="login-placeholder-title">Gameplay Video Showcase</h2>
              <p className="login-placeholder-desc">
                Drop your video into the folder:
              </p>

              <div className="login-folder-code-box">
                <FileVideo size={18} color="#2563eb" />
                <code>Frontend/resources/</code>
                <span className="login-file-tag">.mp4 / .webm</span>
              </div>

              <div className="login-placeholder-hint">
                As soon as you add your video file to <strong>Frontend/resources/</strong>, it will automatically play here in real-time!
              </div>

              {/* Decorative mini animated arrow preview */}
              <div className="login-arrow-grid mini" style={{ maxWidth: '280px', marginTop: '20px' }}>
                <div className="login-arrow-cell cell-right active" title="Right">➔</div>
                <div className="login-arrow-cell cell-down" title="Down">➔</div>
                <div className="login-arrow-cell cell-up" title="Up">➔</div>
                <div className="login-arrow-cell cell-left" title="Left">➔</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT HALF: Sign In & Sign Up Form Section (50% Width) */}
      <div className="login-split-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-brand-group">
              <div className="login-hero-logo small">
                <Compass size={24} color="#ffffff" strokeWidth={2.4} />
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Arrow Puzzle
                </h1>
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#2563eb' }}>
                  100 Unique Levels • Daily Mazes
                </span>
              </div>
            </div>

            <h2 className="login-form-title">
              {tab === 'signin' ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p className="login-form-subtitle">
              {tab === 'signin'
                ? 'Sign in to access your puzzles, stars, and saved progress.'
                : 'Join Arrow Puzzle to solve 100+ levels and daily challenges.'}
            </p>
          </div>

          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="login-tabs">
            <button
              type="button"
              onClick={() => handleTabSwitch('signin')}
              className={`login-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`login-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="login-google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">or with email</span>
            <span className="login-divider-line" />
          </div>

          {/* Error Banner with helpful guidance */}
          {error && (
            <div className="login-error-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                <AlertCircle size={18} className="login-error-icon" style={{ marginTop: '2px' }} />
                <div>
                  <strong>Firebase Configuration Notice</strong>
                  <p style={{ margin: '2px 0 0', color: '#b91c1c', fontSize: '12.5px' }}>{error}</p>
                </div>
              </div>
              {configErrorHelp && (
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '9px 12px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <span>⚡ Instant Player Sign-In (Continue to Game)</span>
                </button>
              )}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="login-form">
            {tab === 'signup' && (
              <div className="login-field-group">
                <label className="login-label">Player Name</label>
                <div className="login-input-wrap">
                  <User size={18} className="login-input-icon" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. MazeMaster99"
                    className="login-input"
                  />
                </div>
              </div>
            )}

            <div className="login-field-group">
              <label className="login-label">Email Address</label>
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="login-field-group">
              <div className="login-label-row">
                <label className="login-label">Password</label>
                {tab === 'signin' && (
                  <span className="login-hint-text">Min 6 characters</span>
                )}
              </div>
              <div className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {tab === 'signup' && (
              <div className="login-field-group">
                <label className="login-label">Confirm Password</label>
                <div className="login-input-wrap">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="spin-animate" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'signin' ? 'Sign In to Arrow Puzzle' : 'Create Account & Play'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Guest exploration option */}
          {onContinueAsGuest && (
            <div className="login-guest-section">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap?.();
                  onContinueAsGuest();
                }}
                className="login-guest-btn"
              >
                Explore as Guest for now
              </button>
            </div>
          )}

          <div className="login-footer-info">
            <ShieldCheck size={14} color="#64748b" />
            <span>Secure authentication powered by Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
