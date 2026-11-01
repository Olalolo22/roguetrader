import type React from 'react';
import {
  Database,
  Cpu,
  Wallet,
  Settings,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Terminal
} from 'lucide-react';
import type { TatumMarketState, UserWalletState } from '../types';

export type CockpitTab = 'arena' | 'memory' | 'audit' | 'x402';

interface HeaderProps {
  marketState: TatumMarketState | null;
  wallet: UserWalletState;
  activeTab: CockpitTab;
  setActiveTab: (tab: CockpitTab) => void;
  onOpenSettings: () => void;
  unlockedCount: number;
  activeBrierScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  marketState,
  wallet,
  activeTab,
  setActiveTab,
  onOpenSettings,
  unlockedCount,
  activeBrierScore = 0.168
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#030509]/95 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Global Telemetry Strip */}
      <div className="border-b border-slate-800/60 bg-[#050811] px-2.5 sm:px-6 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
          {/* Walrus Calibrated Brier Score */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="pulse-indicator bg-emerald-400"></span>
            <span className="text-slate-500 uppercase">Walrus Brier:</span>
            <span className="text-emerald-400 font-bold">{activeBrierScore.toFixed(3)}</span>
            <span className="hidden xs:inline text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
              -72% ERROR
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Tatum Sui Gateway Checkpoint */}
          <div className="flex items-center gap-1 shrink-0">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-500 uppercase hidden sm:inline">Sui Checkpoint:</span>
            <span className="text-cyan-300 font-bold">
              #{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Memory Protocol */}
          <div className="flex items-center gap-1 shrink-0">
            <Database className="w-3 h-3 text-purple-400" />
            <span className="text-slate-200 font-semibold">Walrus (@memwal Mainnet)</span>
          </div>

          {marketState && (
            <>
              <span className="text-slate-700 hidden md:inline">|</span>
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-500">SUI/USDC:</span>
                <span className="text-white font-bold">${marketState.suiPrice.toFixed(3)}</span>
                <span className="text-emerald-400 text-[10px]">(+{marketState.change24h}%)</span>
              </div>
            </>
          )}
        </div>

        {/* Bounty Alignment Pills */}
        <div className="hidden xl:flex items-center gap-2 pl-4 shrink-0">
          <span className="text-[10px] text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> Track 1: Markets ($1,000)
          </span>
          <span className="text-[10px] text-purple-300 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-400" /> Walrus Memory ($500)
          </span>
          <span className="text-[10px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> x402 on Sui ($500)
          </span>
        </div>
      </div>

      {/* Main Cockpit Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 lg:py-0 lg:h-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        {/* Left Brand + Mobile Wallet */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-base tracking-wider text-white font-['Orbitron'] truncate">
                  ROGUE<span className="text-cyan-400">TRADER</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 uppercase tracking-wider shrink-0">
                  EPISTEMIC ARENA
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block truncate">
                Walrus Persistent Memory Benchmark vs Stateless LLM • Tatum Sui Gateway
              </p>
            </div>
          </div>

          {/* Mobile Wallet & Settings */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-mono">
              <Wallet className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="text-white font-semibold">{wallet.balanceSui.toFixed(2)} SUI</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white"
              title="Gateway & Memory Keys"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center 4-Tab Cockpit Navigation: 2x2 Grid on Mobile, Inline Row on sm+ */}
        <nav className="grid grid-cols-2 sm:flex sm:items-center gap-1 bg-[#060a12] p-1 rounded-xl border border-slate-800/90 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Dual Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">Walrus Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">What Broke</span>
          </button>

          <button
            onClick={() => setActiveTab('x402')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'x402'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">x402 Pay</span>
            {unlockedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-[9px] text-black font-bold font-mono shrink-0">
                {unlockedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Desktop Right Wallet & Config */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#070c18] border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white font-bold">{wallet.balanceSui.toFixed(2)} SUI</span>
            <span className="text-slate-500 text-[10px]">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#070c18] hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Configure Tatum & Walrus Endpoints"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
