import { useState, useEffect } from 'react';
import { Header, type DeskTab } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { CheckTrade } from './components/CheckTrade';
import { MemoryInspector } from './components/MemoryInspector';
import { ReceiptsList } from './components/ReceiptsList';
import { SettingsModal } from './components/SettingsModal';
import { tatumSui } from './services/tatumSui';
import { x402Payment } from './services/x402Payment';
import type { TatumMarketState, UserWalletState, X402Receipt } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<DeskTab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [receipts, setReceipts] = useState<X402Receipt[]>(() => x402Payment.getReceipts());
  const [marketState, setMarketState] = useState<TatumMarketState | null>(null);

  // Dark / Light Theme State with LocalStorage Persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roguetrader-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    }
    return 'dark'; // default to graphite execution desk
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('roguetrader-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Demo payer wallet on Sui mainnet
  const [wallet, setWallet] = useState<UserWalletState>({
    address: '0x4f82a101b9ca990188efacba772109aa988112bc',
    balanceSui: 14.5,
    isConnected: true,
    network: 'mainnet'
  });

  // Fetch live market state on mount and poll
  useEffect(() => {
    const updateMarket = async () => {
      try {
        setMarketState(await tatumSui.getMarketState());
      } catch {
        // Fallback handled inside tatumSui service
      }
    };
    updateMarket();
    const interval = setInterval(updateMarket, 15000);
    return () => clearInterval(interval);
  }, []);

  const go = (tab: DeskTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const handlePaymentSuccess = (receipt: X402Receipt) => {
    setWallet(prev => ({ ...prev, balanceSui: Math.max(0, prev.balanceSui - receipt.amountSui) }));
    setReceipts([...x402Payment.getReceipts()]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      <Header
        marketState={marketState}
        activeTab={activeTab}
        setActiveTab={go}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-6">
        {activeTab === 'overview' && (
          <LandingPage
            marketState={marketState}
            theme={theme}
            onLaunchDesk={() => go('check')}
            onInspectMemory={() => go('memory')}
            onViewReceipts={() => go('x402')}
          />
        )}
        {activeTab === 'check' && <CheckTrade marketState={marketState} theme={theme} />}
        {activeTab === 'memory' && <MemoryInspector />}
        {activeTab === 'x402' && (
          <ReceiptsList receipts={receipts} wallet={wallet} onPaymentSuccess={handlePaymentSuccess} />
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-meta text-fg-3 sm:flex-row sm:justify-between sm:px-6">
          <span>RogueTrader · Pre-Trade Risk Guard on Sui</span>
          <span className="num break-all">Powered by Walrus Memory &amp; Tatum · HTTP 402 (x402) Ready</span>
        </div>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSaved={() => {}} />
    </div>
  );
}

export default App;
