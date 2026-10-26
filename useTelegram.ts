import { useState, useEffect, useCallback } from 'react';
import { TelegramUser, TelegramThemeParams, TelegramWebApp } from '../types/telegram';

export interface TelegramHookState {
  isTelegram: boolean;
  user: TelegramUser | null;
  initData: string;
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  verificationStatus: {
    checked: boolean;
    verified: boolean;
    warning?: string;
    reason?: string;
    loading: boolean;
  };
}

export function useTelegram() {
  const [tgState, setTgState] = useState<TelegramHookState>({
    isTelegram: false,
    user: null,
    initData: '',
    platform: 'unknown',
    version: '6.0',
    colorScheme: 'dark',
    themeParams: {},
    isExpanded: false,
    verificationStatus: {
      checked: false,
      verified: false,
      loading: false,
    },
  });

  const getTelegramWebApp = (): TelegramWebApp | null => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp;
    }
    return null;
  };

  useEffect(() => {
    const tg = getTelegramWebApp();

    if (tg && tg.initData !== undefined) {
      // Running inside genuine Telegram WebApp
      try {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation?.();

        const user = tg.initDataUnsafe?.user || null;

        // Apply Telegram theme variables to document root
        if (tg.themeParams) {
          const root = document.documentElement;
          if (tg.themeParams.bg_color) {
            root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
          }
          if (tg.themeParams.text_color) {
            root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
          }
          if (tg.themeParams.hint_color) {
            root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
          }
          if (tg.themeParams.button_color) {
            root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
          }
          if (tg.themeParams.button_text_color) {
            root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
          }
          if (tg.themeParams.secondary_bg_color) {
            root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color);
          }
        }

        setTgState({
          isTelegram: true,
          user,
          initData: tg.initData || '',
          platform: tg.platform || 'unknown',
          version: tg.version || '6.0',
          colorScheme: tg.colorScheme || 'dark',
          themeParams: tg.themeParams || {},
          isExpanded: tg.isExpanded ?? true,
          verificationStatus: {
            checked: false,
            verified: false,
            loading: false,
          },
        });
      } catch (err) {
        console.error('Error initializing Telegram WebApp:', err);
      }
    } else {
      // Preview mode in standard browser (e.g. AI Studio development environment)
      setTgState({
        isTelegram: false,
        user: {
          id: 108420991,
          first_name: 'Alex',
          last_name: 'Developer',
          username: 'alex_tma',
          language_code: 'en',
          is_premium: true,
        },
        initData: 'query_id=AAHdF60AAAAAAJ0XrQBnBqf3&user=%7B%22id%22%3A108420991%2C%22first_name%22%3A%22Alex%22%2C%22last_name%22%3A%22Developer%22%2C%22username%22%3A%22alex_tma%22%2C%22is_premium%22%3Atrue%7D&auth_date=1719200000&hash=preview_mock_hash_for_browser_mode',
        platform: 'web',
        version: '7.10',
        colorScheme: 'dark',
        themeParams: {
          bg_color: '#0f172a',
          text_color: '#f8fafc',
          hint_color: '#94a3b8',
          button_color: '#2563eb',
          button_text_color: '#ffffff',
          secondary_bg_color: '#1e293b',
        },
        isExpanded: true,
        verificationStatus: {
          checked: false,
          verified: false,
          loading: false,
        },
      });
    }
  }, []);

  // Haptic feedback wrappers
  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      const tg = getTelegramWebApp();
      try {
        tg?.HapticFeedback?.impactOccurred(style);
      } catch {}
    },
    notification: (type: 'success' | 'error' | 'warning') => {
      const tg = getTelegramWebApp();
      try {
        tg?.HapticFeedback?.notificationOccurred(type);
      } catch {}
    },
    selection: () => {
      const tg = getTelegramWebApp();
      try {
        tg?.HapticFeedback?.selectionChanged();
      } catch {}
    },
  };

  // Close app
  const close = useCallback(() => {
    const tg = getTelegramWebApp();
    tg?.close();
  }, []);

  // Backend verification check
  const verifyBackend = useCallback(async () => {
    setTgState((prev) => ({
      ...prev,
      verificationStatus: { ...prev.verificationStatus, loading: true },
    }));

    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tgState.initData }),
      });

      const data = await res.json();
      setTgState((prev) => ({
        ...prev,
        verificationStatus: {
          checked: true,
          verified: Boolean(data.verified),
          warning: data.warning,
          reason: data.reason,
          loading: false,
        },
      }));
      return data;
    } catch (err: any) {
      setTgState((prev) => ({
        ...prev,
        verificationStatus: {
          checked: true,
          verified: false,
          reason: err?.message || 'Network request failed',
          loading: false,
        },
      }));
      return { verified: false, reason: err?.message };
    }
  }, [tgState.initData]);

  return {
    ...tgState,
    haptic,
    close,
    verifyBackend,
    rawWebApp: getTelegramWebApp(),
  };
}
