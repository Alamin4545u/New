import React, { useState } from 'react';
import { 
  HelpCircle, 
  Tv, 
  Bot, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Smartphone,
  Lock,
  Layers
} from 'lucide-react';

interface HelpViewProps {
  onHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onHaptic }) => {
  const [openSection, setOpenSection] = useState<string>('monetag');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    onHaptic('light');
    setOpenSection(openSection === id ? '' : id);
  };

  const handleCopy = (text: string, label: string) => {
    onHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-4 px-4 py-4 max-w-md mx-auto">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-tr from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-4 shadow-lg">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <HelpCircle className="w-5 h-5 text-blue-100" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Setup & Deployment Guide</h2>
            <p className="text-[11px] text-blue-200/80">Monetag Publisher & Telegram Mini Apps</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Follow these verified steps to obtain your Monetag Zone ID, connect with BotFather, and test on official Telegram Android and iOS apps.
        </p>
      </div>

      {/* Accordion 1: Monetag Account & Zone Setup */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('monetag')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Tv className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">1. Get Your Monetag Zone ID</span>
          </div>
          {openSection === 'monetag' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSection === 'monetag' && (
          <div className="p-4 space-y-3 border-t border-slate-700/60 text-xs text-slate-300">
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>
                <strong className="text-white">Register / Sign in:</strong> Go to{' '}
                <a
                  href="https://monetag.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline inline-flex items-center space-x-0.5"
                >
                  <span>Monetag.com</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                </a>{' '}
                as a Publisher.
              </li>
              <li>
                <strong className="text-white">Add Website / Domain:</strong> Under "Sites", add the HTTPS URL where your Mini App is hosted.
              </li>
              <li>
                <strong className="text-white">Create Ad Zone:</strong> Select your verified site, click <span className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">Add Zone</span>, and choose <span className="text-emerald-400 font-semibold">Telegram Mini App</span> (or <span className="text-blue-300 font-semibold">Rewarded Interstitial</span> / <span className="text-blue-300 font-semibold">In-App Interstitial</span>).
              </li>
              <li>
                <strong className="text-white">Copy Numeric Zone ID:</strong> Monetag will generate an ID like <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">8899123</code>.
              </li>
              <li>
                <strong className="text-white">Insert in App:</strong> Paste the ID into the <strong>Settings tab</strong> or into <code className="text-blue-300 font-mono">src/config/monetag.ts</code>.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Accordion 2: Compatible Ad Formats */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('formats')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">2. Compatible Monetag Ad Formats</span>
          </div>
          {openSection === 'formats' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSection === 'formats' && (
          <div className="p-4 space-y-2.5 border-t border-slate-700/60 text-xs text-slate-300">
            <p className="leading-relaxed">
              Telegram Mini Apps run inside an in-app WebView sandbox. Here is the verified compatibility breakdown:
            </p>
            <div className="space-y-2 mt-2">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rewarded Interstitial (SDK type: 'end')</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Full-screen modal video/display ad. Optimal for Telegram Mini Apps. User watches ad and closes modal safely without leaving Telegram.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>In-App Interstitial (SDK type: 'inApp')</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Shows between levels or user screen transitions inside the webview.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rewarded Popup (SDK type: 'pop')</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  In-app lightweight popup dialog managed by the Monetag TMA SDK.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <div className="font-semibold text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Traditional Popunder / OnClick (NOT Recommended)</span>
                </div>
                <p className="text-[11px] text-rose-200/80 mt-0.5">
                  Telegram iOS and Android disable background browser tabs or catch <code className="text-rose-100">window.open</code>. Do not use standard popunders in TMA; stick to the official TMA SDK.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: BotFather Telegram Setup */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('botfather')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">3. Connect App via @BotFather</span>
          </div>
          {openSection === 'botfather' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSection === 'botfather' && (
          <div className="p-4 space-y-3 border-t border-slate-700/60 text-xs text-slate-300">
            <p className="leading-relaxed">
              To launch this Mini App inside Telegram, register it with the official Telegram bot creator:
            </p>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>
                Open Telegram and search for <strong className="text-white">@BotFather</strong>.
              </li>
              <li>
                Send <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-400 font-mono">/newbot</code> to create a bot (or choose an existing bot).
              </li>
              <li>
                Send <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-400 font-mono">/newapp</code> to register a Mini App.
              </li>
              <li>Select your bot from the list.</li>
              <li>Enter a Title and Description for your Mini App.</li>
              <li>Upload a 640x360 image asset as requested by BotFather.</li>
              <li>
                When asked for the <strong className="text-white">Web App URL</strong>, enter your HTTPS hosting URL.
              </li>
              <li>Choose a short name (e.g. <code className="text-blue-300 font-mono">ads</code>). BotFather will provide your direct link: <code className="text-emerald-400 font-mono">t.me/YourBot/ads</code>!</li>
            </ol>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Optional: Set Menu Button</span>
                <code className="text-[11px] text-sky-300 font-mono">/setmenubutton</code>
              </div>
              <button
                onClick={() => handleCopy('/setmenubutton', 'menubutton')}
                className="text-[11px] text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-slate-800"
              >
                {copiedText === 'menubutton' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 4: HTTPS Hosting */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('https')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">4. HTTPS Deployment Instructions</span>
          </div>
          {openSection === 'https' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSection === 'https' && (
          <div className="p-4 space-y-3 border-t border-slate-700/60 text-xs text-slate-300">
            <p className="leading-relaxed">
              <strong className="text-white">HTTPS is strictly mandatory</strong> for Telegram WebApps and Monetag ad networks. Plain HTTP URLs will be blocked by both Telegram and ad CDNs.
            </p>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-white">Google AI Studio Hosting (Instant HTTPS)</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This applet runs automatically on a secure Google Cloud Run HTTPS URL (available in your app settings/environment). You can use this URL directly in BotFather!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-white">Vercel / Netlify / VPS</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Run <code className="text-blue-300 font-mono">npm run build</code>. The output directory is <code className="text-blue-300 font-mono">dist/</code>. Push to GitHub and deploy to Vercel/Netlify for free automatic SSL.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 5: Troubleshooting Guide */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('troubleshooting')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">5. Troubleshooting Ads Not Loading</span>
          </div>
          {openSection === 'troubleshooting' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSection === 'troubleshooting' && (
          <div className="p-4 space-y-3 border-t border-slate-700/60 text-xs text-slate-300">
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 block">1. Adblocker / Brave Shields:</strong>
                <span className="text-[11px] text-slate-400">
                  Adblockers (uBlock, AdGuard, Brave Shields) block <code className="text-slate-300">alwingulla.com</code> and Monetag CDNs. Disable your adblocker during testing.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 block">2. Monetag Zone Approval:</strong>
                <span className="text-[11px] text-slate-400">
                  New ad zones in Monetag may take 15–60 minutes for the ad inventory index to activate. Check your Monetag dashboard to ensure the zone status is "Active".
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 block">3. Regional Inventory ("No Fill"):</strong>
                <span className="text-[11px] text-slate-400">
                  If Monetag has no active advertising campaigns for your country/IP, the SDK returns "no fill" or unavailable. This is normal behavior, not a code defect.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 block">4. Domain Mismatch:</strong>
                <span className="text-[11px] text-slate-400">
                  In Monetag, your Zone must belong to the exact domain serving the web app. If you change domains, verify the domain in Monetag Sites.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 6: Testing Checklist */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('checklist')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">6. Real Device Testing Checklist</span>
          </div>
          {openSection === 'checklist' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSection === 'checklist' && (
          <div className="p-4 space-y-2 border-t border-slate-700/60 text-xs text-slate-300">
            {[
              'App is hosted on valid HTTPS with zero SSL certificate errors.',
              'Zone ID configured in src/config/monetag.ts or Settings tab.',
              'Bot created in @BotFather with Web App URL linked via /newapp.',
              'Opened from official Telegram app on Android or iOS (not restricted in-app browser).',
              'User first name and profile render cleanly in the header.',
              'Tapping "Show Ad" requests Monetag ad without freezing or crashing.',
              'Anti-spam cooldown prevents continuous ad bombardment.',
              'Backend initData validation tested with /api/telegram/verify.',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2 py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-[11px] text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
