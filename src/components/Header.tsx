import type React from 'react';
import { Settings2, Sun, Moon } from 'lucide-react';
import type { TatumMarketState } from '../types';

export type DeskTab = 'overview' | 'check' | 'memory' | 'x402';

const TABS: { id: DeskTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'check', label: 'Check trade' },
  { id: 'memory', label: 'Memory' },
  { id: 'x402', label: 'x402' }
];

interface HeaderProps {
  marketState: TatumMarketState | null;
  activeTab: DeskTab;
  setActiveTab: (tab: DeskTab) => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  marketState,
  activeTab,
  setActiveTab,
  onOpenSettings,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <button
          onClick={() => setActiveTab('overview')}
          className="h-10 text-base font-medium tracking-tight text-fg cursor-pointer"
        >
          RogueTrader
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? 'page' : undefined}
              className={`h-8 rounded-lg px-3 text-sm transition-colors duration-150 ease-out cursor-pointer ${
                activeTab === t.id ? 'active-surface text-fg font-medium' : 'text-fg-2 hover:text-fg'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
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

          {/* Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex size-9 sm:size-10 items-center justify-center rounded-lg text-fg-3 transition-colors duration-150 ease-out hover:bg-raised hover:text-fg cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={1.5} className="text-fg-2 hover:text-fg" />
            ) : (
              <Moon size={16} strokeWidth={1.5} className="text-fg-2 hover:text-fg" />
            )}
          </button>

          {/* Network Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Network settings"
            title="Network settings"
            className="flex size-9 sm:size-10 items-center justify-center rounded-lg text-fg-3 transition-colors duration-150 ease-out hover:bg-raised hover:text-fg cursor-pointer"
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
              className={`h-9 rounded-md text-sm transition-colors duration-150 ease-out cursor-pointer ${
                activeTab === t.id ? 'active-surface text-fg font-medium' : 'text-fg-2'
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
