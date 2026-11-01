import type React from 'react';
import { Settings2 } from 'lucide-react';
import type { TatumMarketState } from '../types';

export type DeskTab = 'check' | 'memory' | 'x402';

const TABS: { id: DeskTab; label: string }[] = [
  { id: 'check', label: 'Check trade' },
  { id: 'memory', label: 'Memory' },
  { id: 'x402', label: 'x402' }
];

interface HeaderProps {
  marketState: TatumMarketState | null;
  activeTab: DeskTab;
  setActiveTab: (tab: DeskTab) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ marketState, activeTab, setActiveTab, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <button onClick={() => setActiveTab('check')} className="h-10 text-base font-medium tracking-tight text-fg">
          RogueTrader
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? 'page' : undefined}
              className={`h-8 rounded-lg px-3 text-sm transition-colors duration-150 ease-out ${
                activeTab === t.id ? 'active-surface text-fg' : 'text-fg-2 hover:text-fg'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          {marketState && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="num text-meta text-fg-2">
                SUI ${marketState.suiPrice.toFixed(3)}{' '}
                <span className={marketState.change24h >= 0 ? 'text-pos' : 'text-neg'}>
                  {marketState.change24h >= 0 ? '+' : ''}
                  {marketState.change24h.toFixed(2)}%
                </span>
              </span>
              <span className="keycap" title={marketState.isTatumRpc ? 'Tatum Sui gateway' : 'Public Sui RPC fallback'}>
                <span className="live-dot" aria-hidden />
                <span>ckpt</span>
                {marketState.latestCheckpoint.toLocaleString('en-US')}
              </span>
            </div>
          )}
          <button
            onClick={onOpenSettings}
            aria-label="Network settings"
            className="flex size-10 items-center justify-center rounded-lg text-fg-3 transition-colors duration-150 ease-out hover:bg-raised hover:text-fg"
          >
            <Settings2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile: compact segmented control */}
      <div className="px-4 pb-3 md:hidden">
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-deep p-1" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`h-10 rounded-md text-sm transition-colors duration-150 ease-out ${
                activeTab === t.id ? 'active-surface text-fg' : 'text-fg-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
