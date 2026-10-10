'use client';

import React, { useState } from 'react';
import { X, User, Trophy, Star, Zap, Heart, LogOut, CheckCircle, Loader2, LogIn } from 'lucide-react';
import { sounds } from '../game/soundEffects';
import { signInWithGoogle, signOutUser } from '../services/firebase';

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  currentLevel,
  onProfileUpdate,
  onOpenAuth,
  onSignOut
}) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const isAuthenticated = Boolean(profile?.email || (profile?.uid && profile?.uid !== 'guest'));

  const handleGoogleSignIn = async () => {
    sounds.playTap();
    setLoading(true);
    setAuthError('');
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        sounds.playSuccess?.();
        if (onProfileUpdate) {
          await onProfileUpdate({
            uid: res.user.uid,
            username: res.user.displayName || 'Arrow Player',
            email: res.user.email,
            photoURL: res.user.photoURL,
            provider: 'google'
          });
        }
      } else if (res.error && !res.error.includes('cancelled')) {
        setAuthError(res.error);
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    sounds.playTap();
    setLoading(true);
    setAuthError('');
    try {
      await signOutUser();
      if (onProfileUpdate) {
        await onProfileUpdate({
          uid: null,
          username: 'Guest Player',
          email: null,
          photoURL: null,
          provider: 'guest'
        });
      }
      if (onSignOut) {
        onSignOut();
      }
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px', width: '92%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={22} color="#2563eb" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Player Profile</h3>
          </div>
          <button
            onClick={() => { sounds.playTap(); onClose(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Identity / Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Profile"
              referrerPolicy="no-referrer"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #3b82f6',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                marginBottom: '10px'
              }}
            />
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                marginBottom: '10px'
              }}
            >
              🏹
            </div>
          )}

          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px', color: '#0f172a', textAlign: 'center' }}>
            {profile?.username || (isAuthenticated ? 'Arrow Player' : 'Guest Player')}
          </h4>

          {profile?.email ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16a34a', fontWeight: 500, marginBottom: '8px' }}>
              <CheckCircle size={13} color="#16a34a" />
              <span>{profile.email}</span>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>
              Sign In required to play games
            </span>
          )}
        </div>

        {/* Authentication Actions */}
        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? <Loader2 size={16} className="spin-animate" /> : <LogOut size={16} />}
              <span>Sign Out</span>
            </button>
          ) : (
            <>
              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '11px 16px',
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease'
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

              {/* Sign In / Sign Up with Email Button */}
              <button
                onClick={() => {
                  sounds.playTap();
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  color: '#2563eb',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <LogIn size={15} />
                <span>Sign In / Sign Up with Email</span>
              </button>
            </>
          )}

          {authError && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626', textAlign: 'center' }}>
              {authError}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          width: '100%',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', marginBottom: '4px' }}>
              <Trophy size={16} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Current Level</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Level {currentLevel}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', marginBottom: '4px' }}>
              <Star size={16} fill="#f59e0b" />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Total Stars</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {profile?.stars || 0} ⭐
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', marginBottom: '4px' }}>
              <Heart size={16} fill="#ef4444" />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Lives Max</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              3 Hearts
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', marginBottom: '4px' }}>
              <Zap size={16} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Hints</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {profile?.hints || 2} Left
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => { sounds.playTap(); onClose(); }} style={{ width: '100%' }}>
          Done
        </button>
      </div>
    </div>
  );
}
