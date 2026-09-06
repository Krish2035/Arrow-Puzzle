'use client';

import React from 'react';
import { X, User, Trophy, Star, Zap, Heart } from 'lucide-react';
import { sounds } from '../game/soundEffects';

export default function ProfileModal({ isOpen, onClose, profile, currentLevel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={22} color="#2563eb" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Player Profile</h3>
          </div>
          <button
            onClick={() => { sounds.playTap(); onClose(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar */}
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

        <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px', color: '#0f172a' }}>
          {profile?.username || 'Arrow Master'}
        </h4>
        <span style={{ fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
          Arrow Puzzle Explorer
        </span>

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
              {profile?.stars || 6} ⭐
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
