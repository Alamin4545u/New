/**
 * Official Monetag Advertising SDK types for Telegram Mini Apps
 */

export type MonetagAdType = 'end' | 'inApp' | 'pop' | 'preload' | 'start';

export type MonetagAdStatus = 
  | 'unconfigured' // Placeholder ID still set
  | 'loading_sdk'  // Script tag being injected/fetched
  | 'ready'        // SDK loaded, show_ZONEID function is on window, ready to trigger
  | 'loading_ad'   // User tapped show ad, requesting ad from Monetag servers
  | 'showing'      // Ad active on screen
  | 'completed'    // Ad finished showing
  | 'unavailable'  // No fill/inventory returned
  | 'error'        // Network error / blocked by adblock / script failed
  | 'cooldown';    // Enforcing anti-spam delay between ad views

export interface MonetagAdResult {
  success: boolean;
  reward_event_type?: 'valued' | 'non_valued';
  estimated_price?: number;
  message?: string;
  timestamp: number;
  type: MonetagAdType;
  zoneId: string;
}

export interface AdActivityLog {
  id: string;
  timestamp: string;
  type: MonetagAdType;
  zoneId: string;
  status: 'success' | 'failed' | 'no_fill' | 'cooldown';
  details: string;
  rewardType?: string;
}

export interface MonetagConfig {
  zoneId: string;
  sdkUrl: string;
  autoPreload: boolean;
  cooldownSeconds: number;
}
