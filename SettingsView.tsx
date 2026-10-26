import React, { useState } from 'react';
import { monetagService } from '../services/monetagService';
import { MONETAG_ADS_ID, MONETAG_DEFAULT_SDK_URL } from '../config/monetag';
import { 
  Settings, 
  Tv, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Code, 
  Key, 
  ExternalLink, 
  Clock, 
  Sliders, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { TelegramUser } from '../types/telegram';

interface SettingsViewProps {
  user: TelegramUser | null;
  initData: string;
  isTelegram: boolean;
  onVerifyBackend: () => Promise<any>;
  verificationStatus: {
    checked: boolean;
    verified: boolean;
    warning?: string;
    reason?: string;
    loading: boolean;
  };
  onHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  initData,
  isTelegram,
  onVerifyBackend,
  verificationStatus,
  onHaptic,
}) => {
  const currentConfig = monetagService.getConfig();
  const [zoneIdInput, setZoneIdInput] = useState<string>(
    currentConfig.zoneId === 'PASTE_MY_MONETAG_ID_HERE' ? '' : currentConfig.zoneId
  );
  const [sdkUrlInput, setSdkUrlInput] = useState<string>(currentConfig.sdkUrl);
  const [autoPreload, setAutoPreload] = useState<boolean>(currentConfig.autoPreload);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(currentConfig.cooldownSeconds);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isTestingSdk, setIsTestingSdk] = useState<boolean>(false);
  const [sdkTestMessage, setSdkTestMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSave = async () => {
    onHaptic('medium');
    const finalZoneId = zoneIdInput.trim() || MONETAG_ADS_ID;
    const finalSdkUrl = sdkUrlInput.trim() || MONETAG_DEFAULT_SDK_URL;

    monetagService.updateConfig({
      zoneId: finalZoneId,
      sdkUrl: finalSdkUrl,
      autoPreload,
      cooldownSeconds: Math.max(5, cooldownSeconds),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Test load the SDK with the new configuration
    setIsTestingSdk(true);
    setSdkTestMessage(null);
    try {
      const result = await monetagService.init();
      setSdkTestMessage(result.message);
      if (result.success) {
        onHaptic('success');
      } else {
        onHaptic('error');
      }
    } catch {
      onHaptic('error');
      setSdkTestMessage('Failed to initialize SDK with given settings.');
    } finally {
      setIsTestingSdk(false);
    }
  };

  const handleCopyCodeSnippet = () => {
    onHaptic('light');
    const snippet = `// In file: /src/config/monetag.ts\nexport const MONETAG_ADS_ID = "${zoneIdInput.trim() || 'YOUR_ZONE_ID'}";\nexport const MONETAG_DEFAULT_SDK_URL = "${sdkUrlInput.trim()}";`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4 px-4 py-4 max-w-md mx-auto">
      {/* Monetag Integration Configuration Card */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-4 py-3.5 border-b border-slate-700/60 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Monetag Configuration</h2>
              <p className="text-[11px] text-slate-400">Official TMA Ad Zone & SDK</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Zone ID Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
              <span>Monetag Zone ID</span>
              <a
                href="https://monetag.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Monetag Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="text"
                value={zoneIdInput}
                onChange={(e) => setZoneIdInput(e.target.value)}
                placeholder="e.g. 8899123"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The numeric ID generated in your Monetag account for this Mini App.
            </p>
          </div>

          {/* Official SDK URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Monetag TMA SDK Script URL
            </label>
            <input
              type="text"
              value={sdkUrlInput}
              onChange={(e) => setSdkUrlInput(e.target.value)}
              placeholder="https://alwingulla.com/88/tag.min.js"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Default official script host: <code className="text-slate-300">alwingulla.com/88/tag.min.js</code>
            </p>
          </div>

          {/* Settings Toggles */}
          <div className="space-y-3 pt-1 border-t border-slate-700/60">
            {/* Auto Preload Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Auto Preload Ad Inventory</div>
                <div className="text-[11px] text-slate-400">
                  Pre-fetches ad content silently so taps open immediately
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onHaptic('light');
                  setAutoPreload(!autoPreload);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoPreload ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoPreload ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Anti-spam Cooldown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ad Cooldown Protection</span>
                </span>
                <span className="text-xs font-mono text-purple-300 font-bold">
                  {cooldownSeconds}s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={cooldownSeconds}
                onChange={(e) => setCooldownSeconds(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5s</span>
                <span>15s (Recommended)</span>
                <span>60s</span>
              </div>
            </div>
          </div>

          {/* Save & Test Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isTestingSdk}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md transition"
            >
              {isTestingSdk ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying SDK Tag...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Settings Saved & Applied</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>Save & Test Monetag Connection</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status Message */}
          {sdkTestMessage && (
            <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-3 text-xs text-slate-300 flex items-start space-x-2">
              <span className="font-semibold text-blue-400">SDK Status:</span>
              <span className="flex-1 font-mono text-[11px]">{sdkTestMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Code Insertion Reference Box */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Hardcode in Source Code
            </h3>
          </div>
          <button
            onClick={handleCopyCodeSnippet}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          To bake your Zone ID into the codebase permanently, edit <code className="text-slate-200 font-mono">src/config/monetag.ts</code>:
        </p>

        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`// File: src/config/monetag.ts
export const MONETAG_ADS_ID = "${zoneIdInput.trim() || 'YOUR_ZONE_ID'}";`}
        </pre>
      </div>

      {/* Telegram Security & Backend HMAC Verification */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Telegram Authentication</h2>
            <p className="text-[11px] text-slate-400">Server-Side HMAC-SHA256 Security</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Telegram Mini Apps must <strong className="text-white">never</strong> trust client-provided user accounts. Real production apps validate the cryptographic <code className="text-blue-400 font-mono">initData</code> hash on the server using the bot token.
        </p>

        {/* Verification Trigger */}
        <button
          onClick={onVerifyBackend}
          disabled={verificationStatus.loading}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 flex items-center justify-center space-x-2 transition"
        >
          {verificationStatus.loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying with Backend /api/telegram/verify...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Validate initData Cryptography</span>
            </>
          )}
        </button>

        {/* Verification Result */}
        {verificationStatus.checked && (
          <div
            className={`rounded-xl p-3 text-xs border ${
              verificationStatus.verified
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="font-semibold flex items-center space-x-1.5 mb-1">
              {verificationStatus.verified ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>HMAC-SHA256 Authenticated Successfully</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Verification Note</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed font-sans">
              {verificationStatus.reason ||
                verificationStatus.warning ||
                'Validated by server.'}
            </p>
          </div>
        )}

        {/* Raw initData summary */}
        <div className="pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Raw Telegram initData String:
          </span>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 break-all max-h-20 overflow-y-auto mt-1">
            {initData || 'No initData present (running outside Telegram).'}
          </div>
        </div>
      </div>
    </div>
  );
};
