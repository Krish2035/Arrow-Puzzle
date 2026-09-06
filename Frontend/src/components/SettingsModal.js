import React, { useState } from 'react';
import { X, Volume2, VolumeX, RotateCcw, HelpCircle, Flame } from 'lucide-react';
import { sounds } from '../game/soundEffects';

export default function SettingsModal({
  isOpen,
  onClose,
  onRestartLevel,
  hardMode = false,
  onToggleHardMode
}) {
  const [muted, setMuted] = useState(sounds.muted);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextMuted = !muted;
    sounds.setMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) sounds.playTap();
  };

  const handleToggleHard = () => {
    sounds.playTap();
    if (onToggleHardMode) onToggleHardMode();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Settings</h3>
          <button
            onClick={() => { sounds.playTap(); onClose(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Options list */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Sound Toggle */}
          <div
            onClick={handleToggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {muted ? <VolumeX size={20} color="#ef4444" /> : <Volume2 size={20} color="#2563eb" />}
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Game Sounds</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: muted ? '#ef4444' : '#2563eb' }}>
              {muted ? 'OFF' : 'ON'}
            </span>
          </div>

          {/* Hard Mode Toggle */}
          {onToggleHardMode && (
            <div
              onClick={handleToggleHard}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: hardMode ? '#fff1f2' : '#f8fafc',
                borderRadius: '14px',
                cursor: 'pointer',
                border: hardMode ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame size={20} color={hardMode ? '#e11d48' : '#94a3b8'} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: hardMode ? '#be123c' : '#0f172a' }}>
                    Hard Mode
                  </span>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>2 Hearts • Precision Challenge</p>
                </div>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: hardMode ? '#ffffff' : '#64748b',
                background: hardMode ? '#e11d48' : '#e2e8f0',
                padding: '3px 10px',
                borderRadius: '20px'
              }}>
                {hardMode ? 'ON' : 'OFF'}
              </span>
            </div>
          )}

          {/* Restart Level */}
          {onRestartLevel && (
            <div
              onClick={() => {
                sounds.playTap();
                onRestartLevel();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: '14px',
                cursor: 'pointer',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RotateCcw size={20} color="#64748b" />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Restart Puzzle</span>
              </div>
            </div>
          )}

          {/* How to Play summary */}
          <div
            style={{
              padding: '12px 14px',
              background: '#eff6ff',
              borderRadius: '14px',
              border: '1px solid #bfdbfe',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', marginBottom: '4px' }}>
              <HelpCircle size={16} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>How to Play</span>
            </div>
            <p style={{ fontSize: '12px', color: '#3b82f6', lineHeight: 1.4 }}>
              Tap an arrow to shoot it off the board. If another arrow blocks its exit path, you lose a heart! Clear all arrows to win.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => { sounds.playTap(); onClose(); }} style={{ width: '100%' }}>
          Close
        </button>
      </div>
    </div>
  );
}
