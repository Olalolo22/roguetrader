import type React from 'react';
import { Database, Cpu, Wallet, Settings, ShieldCheck, Zap, Activity } from 'lucide-react';
import type { TatumMarketState, UserWalletState } from '../types';

interface HeaderProps {
  marketState: TatumMarketState | null;
  wallet: UserWalletState;
  activeTab: 'arena' | 'reflection' | 'memory' | 'receipts';
  setActiveTab: (tab: 'arena' | 'reflection' | 'memory' | 'receipts') => void;
  onOpenSettings: () => void;
  unlockedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  marketState,
  wallet,
  activeTab,
  setActiveTab,
  onOpenSettings,
  unlockedCount
}) => {
  return (
    <header className="border-b border-white/[0.08] bg-[#030407]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Micro Telemetry Strip */}
      <div className="border-b border-white/[0.04] px-4 py-1 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Walrus Relayer */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-500">WALRUS:</span>
            <span className="text-cyan-400 font-medium">relayer.memory.walrus.xyz</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              MAINNET
            </span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">•</span>

          {/* Tatum Sui Gateway */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-500">TATUM SUI:</span>
            <span className="text-zinc-300">#{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}</span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">•</span>

          {/* SUI Price Feed */}
          {marketState && (
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-zinc-500">SUI:</span>
              <span className="text-zinc-200 font-semibold">${marketState.suiPrice.toFixed(3)}</span>
              <span className="text-emerald-400 text-[10px]">(+{marketState.change24h}%)</span>
            </div>
          )}
        </div>

        {/* Bounty Tags */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> Track 1: Markets
          </span>
          <span className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> x402 on Sui ($500)
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.12] flex items-center justify-center shadow-inner">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-white font-['Orbitron']">
              ROGUE<span className="text-cyan-400">TRADER</span>
            </span>
            <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-400 uppercase tracking-widest">
              v1.0
            </span>
          </div>
        </div>

        {/* Linear-style Segment Control */}
        <nav className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'arena'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('reflection')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'reflection'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Epistemic Engine
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            Walrus Memory
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'receipts'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            x402 Ledger
            {unlockedCount > 0 && (
              <span className="px-1 rounded-full bg-emerald-400 text-[9px] text-black font-bold font-mono">
                {unlockedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Wallet & Settings */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/[0.08] px-2.5 py-1 rounded-lg text-xs font-mono">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-100 font-semibold">{wallet.balanceSui.toFixed(2)} SUI</span>
            <span className="text-zinc-500 text-[10px] hidden sm:inline">
              {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            title="Configure Tatum & Walrus Endpoints"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
