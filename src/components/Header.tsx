import type React from 'react';
import { Database, Cpu, Wallet, Settings, ShieldCheck, Radio } from 'lucide-react';
import type { TatumMarketState, UserWalletState } from '../types';

interface HeaderProps { marketState: TatumMarketState | null; wallet: UserWalletState; activeTab: 'arena' | 'reflection' | 'memory' | 'receipts'; setActiveTab: (tab: 'arena' | 'reflection' | 'memory' | 'receipts') => void; onOpenSettings: () => void; unlockedCount: number; }

export const Header: React.FC<HeaderProps> = ({ marketState, wallet, activeTab, setActiveTab, onOpenSettings, unlockedCount }) => {
  const tabs = [
    { id: 'arena' as const, label: 'ARENA', icon: Radio },
    { id: 'reflection' as const, label: 'REFLECTION', icon: Cpu },
    { id: 'memory' as const, label: 'WALRUS MEMORY', icon: Database },
    { id: 'receipts' as const, label: 'x402 RECEIPTS', icon: ShieldCheck },
  ];
  return <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(4,17,19,.94)] backdrop-blur-xl">
    <div className="border-b border-[var(--line-soft)] px-3 sm:px-5 py-1.5 flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap font-mono text-[9px] tracking-[.12em]">
      <div className="flex items-center gap-4 text-[var(--paper-muted)]"><span className="flex items-center gap-2 text-[var(--cyan)]"><span className="pulse-indicator" /> LIVE EPISTEMIC FEED</span><span className="hidden sm:inline">CHECKPOINT <b className="text-[var(--paper)]">#{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}</b></span><span className="hidden md:inline">SUI <b className="text-[var(--paper)]">${marketState?.suiPrice.toFixed(3) || '3.842'}</b> <span className="text-[var(--acid)]">+{marketState?.change24h || '4.2'}%</span></span></div>
      <div className="hidden md:flex items-center gap-3"><span className="text-[var(--cyan-dim)]">TATUM / MAINNET</span><span className="text-[var(--line)]">|</span><span className="text-[var(--acid)]">TRACK 01: MARKETS</span><span className="text-[var(--line)]">|</span><span className="text-[var(--amber)]">BOUNTY ACTIVE</span></div>
    </div>
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-3 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
      <div className="flex items-center justify-between gap-5"><div className="flex items-center gap-3"><div className="size-9 border border-[var(--cyan)] bg-[var(--cyan)] text-[var(--ink)] grid place-items-center"><Cpu className="size-5" /></div><div><div className="font-mono font-bold tracking-[.16em] text-sm text-[var(--paper)]">ROGUE<span className="text-[var(--cyan)]">TRADER</span></div><div className="label-micro">EPISTEMIC ARENA / BUILD 01</div></div></div><div className="lg:hidden flex items-center gap-2 font-mono text-[10px] text-[var(--paper)]"><Wallet className="size-3 text-[var(--cyan)]" />{wallet.balanceSui.toFixed(2)} SUI</div></div>
      <nav className="flex items-center gap-1 overflow-x-auto border border-[var(--line)] bg-[rgba(0,0,0,.22)] p-1" aria-label="Primary navigation">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`shrink-0 flex items-center gap-2 px-3 py-2 text-[10px] font-mono tracking-[.08em] transition-colors ${activeTab === id ? 'bg-[var(--cyan)] text-[var(--ink)]' : 'text-[var(--paper-muted)] hover:text-[var(--cyan)]'}`}><Icon className="size-3" />{label}{id === 'receipts' && unlockedCount > 0 && <span className="bg-[var(--ink)] text-[var(--cyan)] px-1">{unlockedCount}</span>}</button>)}</nav>
      <div className="hidden lg:flex items-center gap-3 font-mono text-[10px]"><div className="flex items-center gap-2 border border-[var(--line)] px-3 py-2"><Wallet className="size-3 text-[var(--cyan)]" /><span>{wallet.balanceSui.toFixed(2)} SUI</span><span className="text-[var(--paper-muted)]">{wallet.address.slice(0, 5)}…{wallet.address.slice(-4)}</span></div><button onClick={onOpenSettings} className="border border-[var(--line)] p-2 text-[var(--paper-muted)] hover:text-[var(--cyan)]" aria-label="Open settings"><Settings className="size-3.5" /></button></div>
    </div>
  </header>;
};
