import React from 'react';
import { TelegramUser } from '../types/telegram';
import { Smartphone, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: TelegramUser | null;
  isTelegram: boolean;
  platform: string;
}

export const Header: React.FC<HeaderProps> = ({ user, isTelegram, platform }) => {
  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getPlatformLabel = (plat: string) => {
    switch (plat?.toLowerCase()) {
      case 'android':
        return 'Telegram Android';
      case 'ios':
        return 'Telegram iOS';
      case 'tdesktop':
        return 'Telegram Desktop';
      case 'macos':
        return 'Telegram macOS';
      case 'weba':
      case 'web':
        return 'Telegram Web';
      default:
        return isTelegram ? 'Telegram Mini App' : 'Browser Preview';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* App Title & Status */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight">Monetag TMA</h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Official SDK
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <Smartphone className="w-3 h-3 text-slate-500" />
              <span>{getPlatformLabel(platform)}</span>
            </div>
          </div>
        </div>

        {/* Telegram User Profile Pill */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full pl-1.5 pr-3 py-1 shadow-sm">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.first_name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/40"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
              {user ? getInitials(user.first_name, user.last_name) : <UserIcon className="w-3.5 h-3.5" />}
            </div>
          )}

          <div className="text-left flex flex-col justify-center">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[85px]">
                {user ? user.first_name : 'Guest'}
              </span>
              {user?.is_premium && (
                <span title="Telegram Premium" className="text-[10px] text-amber-400 font-bold">
                  ★
                </span>
              )}
            </div>
            {user?.username && (
              <span className="text-[9px] text-slate-400 font-mono -mt-0.5">
                @{user.username}
              </span>
            )}
          </div>

          <span title="Telegram Authenticated">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
          </span>
        </div>
      </div>
    </header>
  );
};
