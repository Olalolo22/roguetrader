import { useState, useEffect } from 'react';
import { Header, type DeskTab } from './components/Header';
import { CheckTrade } from './components/CheckTrade';
import { MemoryInspector } from './components/MemoryInspector';
import { ReceiptsList } from './components/ReceiptsList';
import { SettingsModal } from './components/SettingsModal';
import { tatumSui } from './services/tatumSui';
import { x402Payment } from './services/x402Payment';
import type { TatumMarketState, UserWalletState, X402Receipt } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<DeskTab>('check');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [receipts, setReceipts] = useState<X402Receipt[]>(() => x402Payment.getReceipts());
  const [marketState, setMarketState] = useState<TatumMarketState | null>(null);

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
      <Header marketState={marketState} activeTab={activeTab} setActiveTab={go} onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-6">
        {activeTab === 'check' && <CheckTrade marketState={marketState} />}
        {activeTab === 'memory' && <MemoryInspector />}
        {activeTab === 'x402' && (
          <ReceiptsList receipts={receipts} wallet={wallet} onPaymentSuccess={handlePaymentSuccess} />
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-meta text-fg-3 sm:flex-row sm:justify-between sm:px-6">
          <span>RogueTrader · Tatum × Walrus Memory hackathon</span>
          <span className="num break-all">relayer.memory.walrus.xyz · sui-mainnet.gateway.tatum.io</span>
        </div>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSaved={() => {}} />
    </div>
  );
}

export default App;
