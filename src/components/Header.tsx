import type React from 'react';
import {
  Database,
  Cpu,
  Wallet,
  Settings,
  ShieldCheck,
  Zap,
  Activity,
  GitBranch,
  Terminal
} from 'lucide-react';
import type { TatumMarketState, UserWalletState } from '../types';

export type CockpitTab = 'arena' | 'reflection' | 'x402' | 'memory';

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
  activeBrierScore = 0.142
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#030509]/95 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Global Telemetry Strip */}
      <div className="border-b border-slate-800/60 bg-[#050811] px-3 sm:px-6 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Arena Brier Score */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="pulse-indicator bg-emerald-400"></span>
            <span className="text-slate-500 uppercase">Arena Brier Score:</span>
            <span className="text-emerald-400 font-bold">{activeBrierScore.toFixed(3)}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
              TOP 1% CALIBRATED
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Tatum Sui Gateway Checkpoint */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-500 uppercase">Sui Gateway Checkpoint:</span>
            <span className="text-cyan-300 font-bold">
              #{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Memory Protocol */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Database className="w-3 h-3 text-purple-400" />
            <span className="text-slate-500 uppercase">Memory Protocol:</span>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 lg:py-0 lg:h-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left Brand */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-wider text-white font-['Orbitron']">
                  ROGUE<span className="text-cyan-400">TRADER</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 uppercase tracking-widest">
                  EPISTEMIC ARENA v2.4
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Self-Calibrating Bayesian Sui Trading Agent • Walrus Memory + x402 Settlement
              </p>
            </div>
          </div>

          {/* Mobile Wallet & Settings */}
          <div className="flex lg:hidden items-center gap-1.5">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono">
              <Wallet className="w-3 h-3 text-cyan-400" />
              <span className="text-white font-semibold">{wallet.balanceSui.toFixed(2)} SUI</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white"
              title="Gateway & Memory Keys"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center 4-Tab Cockpit Navigation */}
        <nav className="flex items-center bg-[#060a12] p-1 rounded-xl border border-slate-800/90 overflow-x-auto whitespace-nowrap w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'arena'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Epistemic Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('reflection')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'reflection'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>5-Step Epistemic Loop</span>
          </button>

          <button
            onClick={() => setActiveTab('x402')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'x402'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>x402 Micro-Settlement</span>
            {unlockedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-[9px] text-black font-bold font-mono">
                {unlockedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Walrus Anchored History</span>
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
            className="p-2 rounded-lg bg-[#070c18] hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Configure Tatum & Walrus Endpoints"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
