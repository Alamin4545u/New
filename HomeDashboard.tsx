import React, { useState, useEffect } from 'react';
import { monetagService } from '../services/monetagService';
import { MonetagAdType, MonetagAdStatus, AdActivityLog } from '../types/monetag';
import { 
  Play, 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Layers, 
  Info, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink,
  Flame,
  Radio
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigateToSettings: () => void;
  onNavigateToHelp: () => void;
  onHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigateToSettings,
  onNavigateToHelp,
  onHaptic,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<MonetagAdType>('end');
  const [status, setStatus] = useState<MonetagAdStatus>(monetagService.getStatus());
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [logs, setLogs] = useState<AdActivityLog[]>(monetagService.getLogs());
  const [cooldown, setCooldown] = useState<number>(monetagService.getCooldownRemaining());
  const [isShowingAd, setIsShowingAd] = useState<boolean>(false);
  const config = monetagService.getConfig();
  const isConfigured = monetagService.isConfigured();

  // Subscribe to service status changes
  useEffect(() => {
    const unsubStatus = monetagService.onStatusChange((newStatus, message) => {
      setStatus(newStatus);
      if (message) setStatusMessage(message);
    });

    const unsubLogs = monetagService.onLogsChange((newLogs) => {
      setLogs(newLogs);
    });

    // Cooldown countdown tick
    const interval = setInterval(() => {
      const remaining = monetagService.getCooldownRemaining();
      setCooldown(remaining);
    }, 1000);

    return () => {
      unsubStatus();
      unsubLogs();
      clearInterval(interval);
    };
  }, []);

  const handleShowAd = async () => {
    if (cooldown > 0) {
      onHaptic('error');
      return;
    }

    onHaptic('medium');
    setIsShowingAd(true);

    try {
      const result = await monetagService.showAd(selectedFormat);
      if (result.success) {
        onHaptic('success');
      } else {
        onHaptic('error');
      }
    } catch {
      onHaptic('error');
    } finally {
      setIsShowingAd(false);
      setCooldown(monetagService.getCooldownRemaining());
    }
  };

  const getStatusBadge = () => {
    if (!isConfigured) {
      return {
        label: 'Setup Required',
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
        icon: AlertCircle,
      };
    }

    switch (status) {
      case 'ready':
        return {
          label: 'Ad Ready',
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
          icon: CheckCircle2,
        };
      case 'loading_sdk':
      case 'loading_ad':
      case 'showing':
        return {
          label: 'Loading...',
          bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400 animate-spin',
          icon: RefreshCw,
        };
      case 'unavailable':
        return {
          label: 'Unavailable',
          bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
          dot: 'bg-orange-400',
          icon: Clock,
        };
      case 'error':
        return {
          label: 'Error',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: ShieldAlert,
        };
      case 'cooldown':
        return {
          label: `Cooldown (${cooldown}s)`,
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
          icon: Clock,
        };
      default:
        return {
          label: 'Initializing',
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600',
          dot: 'bg-slate-400',
          icon: RefreshCw,
        };
    }
  };

  const badge = getStatusBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-4 px-4 py-4 max-w-md mx-auto">
      {/* Top Configuration Alert if default placeholder */}
      {!isConfigured && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 mt-0.5 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-200">
                Monetag Zone ID Needed
              </h3>
              <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                Your ad zone is currently set to the placeholder{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/40 text-[11px] font-mono text-amber-300">
                  PASTE_MY_MONETAG_ID_HERE
                </code>
                . Insert your real Zone ID in Settings to load live ads.
              </p>
              <button
                onClick={() => {
                  onHaptic('light');
                  onNavigateToSettings();
                }}
                className="mt-2.5 inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                <span>Configure Monetag ID</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Monetag Advertising Card */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl overflow-hidden backdrop-blur-sm">
        {/* Card Header */}
        <div className="px-4 py-3.5 border-b border-slate-700/60 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Monetag Advertising</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Zone: {isConfigured ? config.zoneId : 'Not Configured'}
              </p>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-4">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Select TMA-Supported Format</span>
              <span className="text-[10px] text-slate-400 font-normal">Official Monetag SDK</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'end', label: 'Rewarded', sub: "type: 'end'", icon: Sparkles, tip: 'Official' },
                { id: 'inApp', label: 'In-App', sub: "type: 'inApp'", icon: Layers, tip: 'Interstitial' },
                { id: 'pop', label: 'Popup', sub: "type: 'pop'", icon: Radio, tip: 'In-App Pop' },
              ].map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                const FmtIcon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      onHaptic('light');
                      setSelectedFormat(fmt.id as MonetagAdType);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                        : 'bg-slate-900/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FmtIcon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                        {fmt.tip}
                      </span>
                    </div>
                    <div className="text-xs font-bold leading-tight">{fmt.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{fmt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary "Show Ads" Action Button */}
          <div className="pt-1">
            <button
              onClick={handleShowAd}
              disabled={isShowingAd || cooldown > 0 || !isConfigured}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2.5 shadow-lg transition-all active:scale-[0.98] ${
                !isConfigured
                  ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/50'
                  : cooldown > 0
                  ? 'bg-slate-800 text-purple-300 border border-purple-500/30 cursor-not-allowed'
                  : isShowingAd
                  ? 'bg-blue-700 text-white cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 shadow-md ring-1 ring-white/10'
              }`}
            >
              {isShowingAd ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Requesting Monetag Ad...</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span>Cooldown ({cooldown}s remaining)</span>
                </>
              ) : !isConfigured ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>Insert Monetag Zone ID First</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Show Ad ({selectedFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>

          {/* Status Details / Feedback Banner */}
          {statusMessage && (
            <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-3 text-xs flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-slate-300 leading-relaxed font-sans">
                <span className="font-semibold text-slate-200">Diagnostics: </span>
                {statusMessage}
              </div>
            </div>
          )}

          {/* Anti-spam and Policy Guard Notice */}
          <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Complies with Monetag policies: {config.cooldownSeconds}s cooldown frequency cap, no forced redirects, asynchronous execution.
            </span>
          </div>
        </div>
      </div>

      {/* Format Compatibility Matrix (Crucial for TMA) */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Monetag TMA Compatibility Guide
            </h3>
          </div>
          <button
            onClick={() => {
              onHaptic('light');
              onNavigateToHelp();
            }}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-0.5"
          >
            <span>Full Guide</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-2.5">
            <span className="text-emerald-400 font-bold">✓</span>
            <div>
              <div className="font-semibold text-emerald-200">Rewarded & In-App Interstitials</div>
              <div className="text-[11px] text-emerald-300/80">
                100% compatible. Monetag's TMA SDK handles modal presentation inside Telegram WebView.
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-2.5">
            <span className="text-emerald-400 font-bold">✓</span>
            <div>
              <div className="font-semibold text-emerald-200">In-Page Push (IPP) & Vignette</div>
              <div className="text-[11px] text-emerald-300/80">
                100% compatible. Renders as native floating overlays within the app viewport.
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start space-x-2.5">
            <span className="text-amber-400 font-bold">⚠</span>
            <div>
              <div className="font-semibold text-amber-200">Popunder / OnClick (Browser Tabs)</div>
              <div className="text-[11px] text-amber-300/80">
                Not recommended for TMA. Telegram mobile WebViews block unexpected tab opening. Use Rewarded Interstitials instead.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Interaction Log / Transparency Panel */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ad Activity Log ({logs.length})
            </h3>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => {
                onHaptic('light');
                monetagService.clearLogs();
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Clear Log
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-900/30 border border-slate-800/80">
            <p className="text-xs text-slate-400">No ad events recorded this session.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Tap "Show Ad" above to trigger an ad event.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'success'
                        ? 'bg-emerald-400'
                        : log.status === 'cooldown'
                        ? 'bg-purple-400'
                        : log.status === 'no_fill'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-slate-200 uppercase text-[10px]">
                      {log.type}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                      {log.timestamp}
                    </span>
                    <p className="text-[11px] text-slate-300 truncate max-w-[210px]">
                      {log.details}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                    log.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : log.status === 'cooldown'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
