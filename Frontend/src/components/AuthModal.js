'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { sounds } from '../game/soundEffects';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebase';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'signin',
  title = 'Sign In to Play',
  subtitle = 'Create an account or sign in with Google to play Arrow Puzzle and save your progress.'
}) {
  const [tab, setTab] = useState(initialTab); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [configErrorHelp, setConfigErrorHelp] = useState(false);

  if (!isOpen) return null;

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
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          width: '92%',
          padding: '28px 24px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} /> Play Access
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
              {title}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              {subtitle}
            </p>
          </div>
          {onClose && (
            <button
              onClick={() => { sounds.playTap?.(); onClose(); }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          width: '100%',
          marginTop: '10px',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === 'signin' ? '#ffffff' : 'transparent',
              color: tab === 'signin' ? '#2563eb' : '#64748b',
              boxShadow: tab === 'signin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === 'signup' ? '#ffffff' : 'transparent',
              color: tab === 'signup' ? '#2563eb' : '#64748b',
              boxShadow: tab === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Continue with Google Button (Available in BOTH tabs) */}
        <div style={{ width: '100%', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#ffffff',
              color: '#1f2937',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4285F4';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(66, 133, 244, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            {loading ? (
              <Loader2 size={18} className="spin-animate" color="#4285F4" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          margin: '4px 0 14px',
          color: '#94a3b8',
          fontSize: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span>or with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '12.5px',
            width: '100%',
            marginBottom: '14px',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Firebase Configuration Notice</strong>
                <p style={{ margin: '2px 0 0', color: '#b91c1c' }}>{error}</p>
              </div>
            </div>
            {configErrorHelp && (
              <button
                type="button"
                onClick={handleDemoSignIn}
                style={{
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

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tab === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Player Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. Arrow Hunter"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={tab === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 36px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <Loader2 size={18} className="spin-animate" />
            ) : tab === 'signin' ? (
              <>
                <LogIn size={16} />
                <span>Sign In & Play</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account & Play</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          {tab === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
