/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { monetagService } from './services/monetagService';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { Navigation, ActiveTab } from './components/Navigation';
import { Info, ExternalLink } from 'lucide-react';

export default function App() {
  const {
    isTelegram,
    user,
    initData,
    platform,
    haptic,
    verifyBackend,
    verificationStatus,
    rawWebApp,
  } = useTelegram();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isConfigured, setIsConfigured] = useState<boolean>(monetagService.isConfigured());

  // Initialize Monetag SDK on startup
  useEffect(() => {
    monetagService.init();

    const unsub = monetagService.onStatusChange(() => {
      setIsConfigured(monetagService.isConfigured());
    });

    return () => unsub();
  }, []);

  // Telegram native BackButton integration
  useEffect(() => {
    if (!rawWebApp?.BackButton) return;

    if (activeTab !== 'dashboard') {
      try {
        rawWebApp.BackButton.show();
        const handleBackClick = () => {
          haptic.selection();
          setActiveTab('dashboard');
        };
        rawWebApp.BackButton.onClick(handleBackClick);

        return () => {
          try {
            rawWebApp.BackButton.offClick(handleBackClick);
          } catch {}
        };
      } catch (err) {
        console.error('Error attaching Telegram BackButton:', err);
      }
    } else {
      try {
        rawWebApp.BackButton.hide();
      } catch {}
    }
  }, [activeTab, rawWebApp, haptic]);

  const handleHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error') => {
    if (type === 'selection') {
      haptic.selection();
    } else if (type === 'success' || type === 'error') {
      haptic.notification(type);
    } else {
      haptic.impact(type);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <div>
        {/* Browser Sandbox Banner when not in Telegram */}
        {!isTelegram && (
          <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-b border-blue-500/20 px-3 py-1.5 text-[11px] text-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">
                Browser Preview Mode • Ready for live Telegram testing
              </span>
            </div>
            <button
              onClick={() => setActiveTab('help')}
              className="underline text-blue-300 hover:text-white shrink-0 ml-2 font-medium"
            >
              How to test in Telegram
            </button>
          </div>
        )}

        <Header user={user} isTelegram={isTelegram} platform={platform} />

        {/* Tab Content */}
        <main className="pb-24 pt-2">
          {activeTab === 'dashboard' && (
            <HomeDashboard
              onNavigateToSettings={() => setActiveTab('settings')}
              onNavigateToHelp={() => setActiveTab('help')}
              onHaptic={handleHaptic}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              initData={initData}
              isTelegram={isTelegram}
              onVerifyBackend={verifyBackend}
              verificationStatus={verificationStatus}
              onHaptic={handleHaptic}
            />
          )}

          {activeTab === 'help' && <HelpView onHaptic={handleHaptic} />}
        </main>
      </div>

      {/* Mobile-First Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onHaptic={handleHaptic}
        isConfigured={isConfigured}
      />
    </div>
  );
}
