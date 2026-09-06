'use client';

import { useEffect, useState } from 'react';

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('✅ Arrow Puzzle PWA Service Worker active:', reg.scope);
          })
          .catch((err) => {
            console.warn('⚠️ Service Worker registration failed:', err);
          });
      });
    }

    // 2. Track Online / Offline status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // 3. Capture PWA Install Prompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Only show install prompt banner if not standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (!isStandalone) {
          setShowInstallBanner(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  return (
    <>
      {/* Offline Status Badge */}
      {isOffline && (
        <div className="offline-indicator-banner">
          <span className="offline-dot" />
          <span>Offline Mode Active • Playing local levels</span>
        </div>
      )}

      {/* PWA Install Banner (Mobile & Tablet) */}
      {showInstallBanner && (
        <div className="pwa-install-toast">
          <div className="pwa-toast-info">
            <img src="/icons/icon-192x192.png" alt="App Icon" className="pwa-toast-icon" />
            <div className="pwa-toast-text">
              <span className="pwa-toast-title">Install Arrow Puzzle</span>
              <span className="pwa-toast-sub">Play offline anytime in fullscreen</span>
            </div>
          </div>
          <div className="pwa-toast-actions">
            <button className="pwa-toast-dismiss" onClick={() => setShowInstallBanner(false)}>
              Later
            </button>
            <button className="pwa-toast-install" onClick={handleInstallClick}>
              Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}
