/**
 * Official Monetag SDK Integration Service for Telegram Mini Apps
 * 
 * Complies with official Monetag TMA SDK documentation:
 * - Script tag: <script src="https://domain.com/sdk.js" data-zone="XXX" data-sdk="show_XXX" async></script>
 * - Execution: window['show_' + zoneId]({ type: 'end' | 'inApp' | 'pop' | 'preload' })
 * - Returns Promise resolving on completion or rejecting on error/no-fill
 */

import { MONETAG_ADS_ID, MONETAG_DEFAULT_SDK_URL, MIN_AD_INTERVAL_SECONDS } from '../config/monetag';
import { MonetagAdType, MonetagAdStatus, MonetagAdResult, AdActivityLog, MonetagConfig } from '../types/monetag';

const CONFIG_STORAGE_KEY = 'monetag_tma_config';
const LOGS_STORAGE_KEY = 'monetag_tma_logs';

class MonetagService {
  private config: MonetagConfig;
  private currentStatus: MonetagAdStatus = 'unconfigured';
  private lastAdTimestamp = 0;
  private statusListeners: Array<(status: MonetagAdStatus, message?: string) => void> = [];
  private logListeners: Array<(logs: AdActivityLog[]) => void> = [];
  private logs: AdActivityLog[] = [];
  private scriptLoaded = false;
  private isPreloaded = false;

  constructor() {
    this.config = this.loadConfig();
    this.logs = this.loadLogs();
  }

  public getConfig(): MonetagConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<MonetagConfig>): void {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // Ignore localStorage errors
    }
    // Reset script loaded flag if zone or SDK URL changed
    this.scriptLoaded = false;
    this.isPreloaded = false;
    this.init();
  }

  private loadConfig(): MonetagConfig {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          zoneId: parsed.zoneId || MONETAG_ADS_ID,
          sdkUrl: parsed.sdkUrl || MONETAG_DEFAULT_SDK_URL,
          autoPreload: parsed.autoPreload ?? true,
          cooldownSeconds: parsed.cooldownSeconds ?? MIN_AD_INTERVAL_SECONDS,
        };
      }
    } catch {
      // Fallback to constants
    }
    return {
      zoneId: MONETAG_ADS_ID,
      sdkUrl: MONETAG_DEFAULT_SDK_URL,
      autoPreload: true,
      cooldownSeconds: MIN_AD_INTERVAL_SECONDS,
    };
  }

  private loadLogs(): AdActivityLog[] {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private addLog(entry: Omit<AdActivityLog, 'id' | 'timestamp'>): void {
    const newLog: AdActivityLog = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    this.logs = [newLog, ...this.logs.slice(0, 24)];
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs));
    } catch {
      // Ignore
    }
    this.logListeners.forEach((listener) => listener(this.logs));
  }

  public isConfigured(): boolean {
    const id = this.config.zoneId?.trim();
    return Boolean(id && id !== 'PASTE_MY_MONETAG_ID_HERE' && id !== '');
  }

  public getStatus(): MonetagAdStatus {
    return this.currentStatus;
  }

  private setStatus(status: MonetagAdStatus, message?: string): void {
    this.currentStatus = status;
    this.statusListeners.forEach((listener) => listener(status, message));
  }

  public onStatusChange(callback: (status: MonetagAdStatus, message?: string) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public onLogsChange(callback: (logs: AdActivityLog[]) => void): () => void {
    this.logListeners.push(callback);
    callback(this.logs);
    return () => {
      this.logListeners = this.logListeners.filter((cb) => cb !== callback);
    };
  }

  public getLogs(): AdActivityLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem(LOGS_STORAGE_KEY);
    } catch {}
    this.logListeners.forEach((cb) => cb([]));
  }

  /**
   * Initializes the Monetag official SDK asynchronously
   */
  public async init(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      this.setStatus('unconfigured', 'Monetag Zone ID is not configured.');
      return { success: false, message: 'Monetag Zone ID is required.' };
    }

    const zoneId = this.config.zoneId.trim();
    const sdkFunctionName = `show_${zoneId}`;

    // If already loaded in window
    if (typeof (window as any)[sdkFunctionName] === 'function') {
      this.scriptLoaded = true;
      this.setStatus('ready', 'Monetag SDK ready.');
      if (this.config.autoPreload && !this.isPreloaded) {
        this.preload('preload');
      }
      return { success: true, message: 'Monetag SDK already initialized.' };
    }

    this.setStatus('loading_sdk', 'Injecting official Monetag SDK...');

    return new Promise((resolve) => {
      // Check existing script tag
      const existingScript = document.querySelector(`script[data-zone="${zoneId}"]`);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = this.config.sdkUrl;
      script.setAttribute('data-zone', zoneId);
      script.setAttribute('data-sdk', sdkFunctionName);
      script.async = true;

      // Fail-safe timeout in case of adblockers or network cutoff
      const timeoutId = setTimeout(() => {
        if (!this.scriptLoaded) {
          const errMsg = 'SDK script load timed out. Check adblocker or network.';
          this.setStatus('error', errMsg);
          this.addLog({
            type: 'preload',
            zoneId,
            status: 'failed',
            details: 'Script load timeout (8s) - possible adblocker or unreachable CDN.',
          });
          resolve({ success: false, message: errMsg });
        }
      }, 8000);

      script.onload = () => {
        clearTimeout(timeoutId);
        this.scriptLoaded = true;

        // Small delay to let the SDK define its global method
        setTimeout(() => {
          if (typeof (window as any)[sdkFunctionName] === 'function') {
            this.setStatus('ready', `Ad handler ${sdkFunctionName} ready.`);
            if (this.config.autoPreload && !this.isPreloaded) {
              this.preload('preload');
            }
            resolve({ success: true, message: 'Monetag SDK loaded successfully.' });
          } else {
            // Function might still be initializing or zone format differs
            this.setStatus('ready', 'SDK loaded. Ready for ad triggers.');
            resolve({ success: true, message: 'SDK loaded.' });
          }
        }, 150);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        const errMsg = 'Failed to load Monetag SDK script. Domain may be blocked or invalid.';
        this.setStatus('error', errMsg);
        this.addLog({
          type: 'preload',
          zoneId,
          status: 'failed',
          details: `CDN load error: ${this.config.sdkUrl}. AdBlock or CORS/SSL failure.`,
        });
        resolve({ success: false, message: errMsg });
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Preload ad inventory silently
   */
  public async preload(type: MonetagAdType = 'preload'): Promise<void> {
    if (!this.isConfigured() || !this.scriptLoaded) return;
    const zoneId = this.config.zoneId.trim();
    const sdkFunction = (window as any)[`show_${zoneId}`];

    if (typeof sdkFunction === 'function') {
      try {
        await sdkFunction({ type: 'preload' });
        this.isPreloaded = true;
      } catch {
        // Preload fails silently without disturbing user
      }
    }
  }

  /**
   * Shows an official Monetag ad in the specified format
   * @param type 'end' (Rewarded Interstitial) | 'inApp' (In-App Interstitial) | 'pop' (Rewarded Popup)
   */
  public async showAd(type: MonetagAdType = 'end'): Promise<MonetagAdResult> {
    const zoneId = this.config.zoneId.trim();

    // 1. Check configuration
    if (!this.isConfigured()) {
      this.setStatus('unconfigured', 'Configure your Monetag Zone ID first.');
      return {
        success: false,
        message: 'Monetag Zone ID is not configured. Go to Settings or update src/config/monetag.ts.',
        timestamp: Date.now(),
        type,
        zoneId: 'none',
      };
    }

    // 2. Anti-spam / Cooldown check to prevent policy violations
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastAdTimestamp) / 1000);
    const requiredCooldown = this.config.cooldownSeconds;

    if (this.lastAdTimestamp > 0 && elapsedSeconds < requiredCooldown) {
      const remaining = requiredCooldown - elapsedSeconds;
      const msg = `Please wait ${remaining}s before requesting another ad (anti-spam policy).`;
      this.setStatus('cooldown', msg);
      this.addLog({
        type,
        zoneId,
        status: 'cooldown',
        details: `Rejected due to frequency cap: wait ${remaining}s.`,
      });
      return {
        success: false,
        message: msg,
        timestamp: now,
        type,
        zoneId,
      };
    }

    // 3. Ensure SDK is loaded
    if (!this.scriptLoaded) {
      const initResult = await this.init();
      if (!initResult.success) {
        return {
          success: false,
          message: initResult.message,
          timestamp: now,
          type,
          zoneId,
        };
      }
    }

    const sdkFunctionName = `show_${zoneId}`;
    const showFn = (window as any)[sdkFunctionName];

    if (typeof showFn !== 'function') {
      const err = `Global function ${sdkFunctionName} not found. Check if Zone ID matches Monetag account.`;
      this.setStatus('error', err);
      this.addLog({
        type,
        zoneId,
        status: 'failed',
        details: `Missing window.${sdkFunctionName}. Make sure Zone ID is registered for Telegram Mini App.`,
      });
      return {
        success: false,
        message: err,
        timestamp: now,
        type,
        zoneId,
      };
    }

    // 4. Trigger the ad with safety timeout
    this.setStatus('loading_ad', `Requesting ${type} ad from Monetag...`);

    try {
      // 18-second timeout for ad serving & presentation
      const adPromise = showFn({
        type,
        requestVar: 'tma_button',
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Monetag ad request timed out (18s).')), 18000);
      });

      this.setStatus('showing', `Displaying ${type} ad...`);
      const result: any = await Promise.race([adPromise, timeoutPromise]);

      this.lastAdTimestamp = Date.now();
      this.setStatus('ready', 'Ad interaction completed.');

      const rewardEventType = result?.reward_event_type;
      const estimatedPrice = result?.estimated_price;

      this.addLog({
        type,
        zoneId,
        status: 'success',
        details: `Ad completed. Event: ${rewardEventType || 'completed'}`,
        rewardType: rewardEventType,
      });

      // Silently preload next ad if enabled
      if (this.config.autoPreload) {
        setTimeout(() => this.preload('preload'), 2000);
      }

      return {
        success: true,
        reward_event_type: rewardEventType,
        estimated_price: estimatedPrice,
        message: 'Ad finished successfully.',
        timestamp: Date.now(),
        type,
        zoneId,
      };
    } catch (error: any) {
      const errorMsg = error?.message || 'Ad could not be loaded.';
      
      // Determine if error is no-fill or system error
      const isNoFill = errorMsg.toLowerCase().includes('inventory') ||
                       errorMsg.toLowerCase().includes('no fill') ||
                       errorMsg.toLowerCase().includes('unavailable');

      const status: MonetagAdStatus = isNoFill ? 'unavailable' : 'error';
      this.setStatus(status, errorMsg);

      this.addLog({
        type,
        zoneId,
        status: isNoFill ? 'no_fill' : 'failed',
        details: errorMsg,
      });

      return {
        success: false,
        message: errorMsg,
        timestamp: Date.now(),
        type,
        zoneId,
      };
    }
  }

  public getCooldownRemaining(): number {
    if (!this.lastAdTimestamp) return 0;
    const elapsed = Math.floor((Date.now() - this.lastAdTimestamp) / 1000);
    const remaining = this.config.cooldownSeconds - elapsed;
    return remaining > 0 ? remaining : 0;
  }
}

export const monetagService = new MonetagService();
