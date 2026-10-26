import React from 'react';
import { Tv, Settings, HelpCircle, Shield } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'settings' | 'help';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onHaptic: (type: 'light' | 'medium' | 'heavy' | 'selection') => void;
  isConfigured: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  onHaptic,
  isConfigured,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Tv },
    { 
      id: 'settings' as ActiveTab, 
      label: 'Settings', 
      icon: Settings,
      alert: !isConfigured 
    },
    { id: 'help' as ActiveTab, label: 'Guide & Setup', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-3 px-3 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onHaptic('selection');
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <TabIcon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.alert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-900 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
