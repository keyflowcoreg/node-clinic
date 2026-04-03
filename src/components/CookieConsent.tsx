import React, { useState, useEffect, useCallback } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'node_clinic_cookie_consent';

function getStoredPreferences(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  // Dispatch custom event so other parts of the app can react
  window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: prefs }));
}

/**
 * Check if a specific cookie category has been consented to.
 * Use this before loading analytics/marketing scripts.
 */
export function hasConsent(category: 'analytics' | 'marketing'): boolean {
  const prefs = getStoredPreferences();
  return prefs ? prefs[category] : false;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredPreferences();
    if (!stored) {
      // Small delay so banner doesn't flash on initial load
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
  }, []);

  const handleSaveCustom = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
  }, [analytics, marketing]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999]"
      role="dialog"
      aria-label="Consenso cookie"
      aria-modal="false"
    >
      {/* Backdrop blur strip */}
      <div className="bg-[#1a1a1a]/95 backdrop-blur-md border-t border-[#8a8a8a]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          {/* Main banner */}
          {!showCustomize ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 pr-0 sm:pr-8">
                <h3 className="text-[#f5f0eb] text-sm font-semibold tracking-wide uppercase mb-1.5">
                  Informativa sui Cookie
                </h3>
                <p className="text-[#8a8a8a] text-sm leading-relaxed">
                  Utilizziamo cookie tecnici necessari per il funzionamento del sito e, con il tuo consenso,
                  cookie di analisi e marketing per migliorare la tua esperienza.{' '}
                  <a href="/cookies" className="text-[#f5f0eb] underline underline-offset-2 hover:text-white transition-colors">
                    Leggi la nostra Cookie Policy
                  </a>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowCustomize(true)}
                  className="px-5 py-2.5 text-sm font-medium text-[#f5f0eb] border border-[#8a8a8a]/40 rounded-lg hover:border-[#f5f0eb]/60 transition-all duration-200 whitespace-nowrap"
                >
                  Personalizza
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-5 py-2.5 text-sm font-medium text-[#f5f0eb] border border-[#8a8a8a]/40 rounded-lg hover:border-[#f5f0eb]/60 transition-all duration-200 whitespace-nowrap"
                >
                  Rifiuta Tutti
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 text-sm font-medium bg-[#f5f0eb] text-[#1a1a1a] rounded-lg hover:bg-white transition-all duration-200 whitespace-nowrap"
                >
                  Accetta Tutti
                </button>
              </div>
            </div>
          ) : (
            /* Customize panel */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[#f5f0eb] text-sm font-semibold tracking-wide uppercase">
                  Gestisci Preferenze Cookie
                </h3>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="text-[#8a8a8a] hover:text-[#f5f0eb] transition-colors text-sm"
                  aria-label="Chiudi personalizzazione"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Necessary */}
                <div className="border border-[#8a8a8a]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#f5f0eb] text-sm font-medium">Necessari</span>
                    <span className="text-xs text-[#8a8a8a] bg-[#8a8a8a]/15 px-2 py-0.5 rounded">
                      Sempre attivi
                    </span>
                  </div>
                  <p className="text-[#8a8a8a] text-xs leading-relaxed">
                    Essenziali per il funzionamento del sito. Non possono essere disattivati.
                  </p>
                </div>

                {/* Analytics */}
                <div className="border border-[#8a8a8a]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#f5f0eb] text-sm font-medium">Analitici</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#8a8a8a]/30 peer-checked:bg-[#f5f0eb] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1a1a] after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4"></div>
                    </label>
                  </div>
                  <p className="text-[#8a8a8a] text-xs leading-relaxed">
                    Ci aiutano a capire come i visitatori interagiscono con il sito.
                  </p>
                </div>

                {/* Marketing */}
                <div className="border border-[#8a8a8a]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#f5f0eb] text-sm font-medium">Marketing</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#8a8a8a]/30 peer-checked:bg-[#f5f0eb] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1a1a] after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4"></div>
                    </label>
                  </div>
                  <p className="text-[#8a8a8a] text-xs leading-relaxed">
                    Utilizzati per mostrarti annunci pertinenti ai tuoi interessi.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleRejectAll}
                  className="px-5 py-2.5 text-sm font-medium text-[#f5f0eb] border border-[#8a8a8a]/40 rounded-lg hover:border-[#f5f0eb]/60 transition-all duration-200"
                >
                  Rifiuta Tutti
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-5 py-2.5 text-sm font-medium bg-[#f5f0eb] text-[#1a1a1a] rounded-lg hover:bg-white transition-all duration-200"
                >
                  Salva Preferenze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
