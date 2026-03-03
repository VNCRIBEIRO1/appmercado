'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 seconds of first visit
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-brand-600 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3">
        <Download className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Instalar MercadoApp</p>
          <p className="text-xs text-brand-100">
            Acesse rapidamente na tela inicial
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-white text-brand-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-50 transition"
        >
          Instalar
        </button>
        <button onClick={handleDismiss} className="text-brand-200 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
