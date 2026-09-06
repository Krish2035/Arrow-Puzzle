'use client';

import React from 'react';
import { X, Calendar, CheckCircle2, Trophy } from 'lucide-react';
import { sounds } from '../game/soundEffects';

export default function DailyModal({ isOpen, onClose, onPlayDaily }) {
  if (!isOpen) return null;

  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = 30;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#2563eb" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Daily Challenge</h3>
          </div>
          <button
            onClick={() => { sounds.playTap(); onClose(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px', textAlign: 'left', width: '100%' }}>
          Complete daily arrow puzzles to keep your streak and earn golden stars!
        </p>

        {/* Days grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          width: '100%',
          marginBottom: '20px'
        }}>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((day) => {
            const isToday = day === currentDay;
            const isPast = day < currentDay;
            return (
              <div
                key={day}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: isToday
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : isPast
                    ? '#ecfdf5'
                    : '#f8fafc',
                  border: isToday
                    ? '2px solid #60a5fa'
                    : isPast
                    ? '1px solid #a7f3d0'
                    : '1px solid #e2e8f0',
                  color: isToday ? '#ffffff' : isPast ? '#059669' : '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: isToday ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isToday) {
                    sounds.playTap();
                    onPlayDaily();
                  }
                }}
              >
                <span>{day}</span>
                {isPast ? (
                  <CheckCircle2 size={13} color="#059669" />
                ) : isToday ? (
                  <span style={{ fontSize: '9px', fontWeight: 800 }}>PLAY</span>
                ) : null}
              </div>
            );
          })}
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            sounds.playTap();
            onPlayDaily();
          }}
          style={{ width: '100%', padding: '12px' }}
        >
          Play Today's Puzzle
        </button>
      </div>
    </div>
  );
}
