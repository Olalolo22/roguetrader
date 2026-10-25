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
    <header className="border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Banner: Protocol Telemetry */}
      <div className="border-b border-slate-800/60 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Walrus Relayer Status */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-semibold">Walrus Relayer:</span>
            <span className="text-cyan-400">relayer.memory.walrus.xyz</span>
            <span className="bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 px-1.5 py-0.2 rounded text-[10px]">
              MAINNET
            </span>
          </div>

          {/* Tatum Sui Gateway Status */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-semibold">Tatum Sui RPC:</span>
            <span className="text-purple-400">{marketState?.gatewayHost || 'sui-mainnet.gateway.tatum.io'}</span>
            <span className="text-slate-400">
              Checkpoint #{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}
            </span>
          </div>

          {/* SUI Price Feed */}
          {marketState && (
            <div className="flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">SUI:</span>
              <span className="text-emerald-400 font-semibold">${marketState.suiPrice.toFixed(3)}</span>
              <span className="text-emerald-400/80 text-[11px]">(+{marketState.change24h}%)</span>
            </div>
          )}
        </div>

        {/* Track Bounties Badge */}
        <div className="flex items-center gap-2">
          <span className="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" /> Track 1: Markets & Sports
          </span>
          <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> x402 Sui Payments ($500)
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-wider text-white font-['Orbitron'] bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                ROGUE TRADER
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                EPISTEMIC ARENA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous AI Agents Calibrated via Walrus Memory • Unlocked with x402 on Sui
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'arena'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Arena Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('reflection')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'reflection'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Reflective Engine
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            Walrus Memory
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'receipts'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            x402 Receipts
            {unlockedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-black font-bold flex items-center justify-center">
                {unlockedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Side: Wallet & Settings */}
        <div className="flex items-center gap-2">
          {/* Wallet pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-white font-semibold">{wallet.balanceSui.toFixed(2)} SUI</span>
              <span className="text-slate-400 text-[10px]">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
            </div>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Configure Tatum API Key & Walrus Account"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
