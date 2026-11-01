import { useState, useEffect } from 'react';
import { Header, type CockpitTab } from './components/Header';
import { ArenaLeaderboard } from './components/ArenaLeaderboard';
import { ReflectiveThoughtEngine } from './components/ReflectiveThoughtEngine';
import { MemoryInspector } from './components/MemoryInspector';
import { ReceiptsList } from './components/ReceiptsList';
import { SettingsModal } from './components/SettingsModal';
import { tatumSui } from './services/tatumSui';
import { x402Payment } from './services/x402Payment';
import type { TatumMarketState, UserWalletState, X402Receipt } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<CockpitTab>('arena');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [receipts, setReceipts] = useState<X402Receipt[]>(() => x402Payment.getReceipts());
  const [marketState, setMarketState] = useState<TatumMarketState | null>(null);

  // Connected user wallet state on Sui Mainnet
  const [wallet, setWallet] = useState<UserWalletState>({
    address: '0x4f82a101b9ca990188efacba772109aa988112bc',
    balanceSui: 14.50,
    isConnected: true,
    network: 'mainnet'
  });

  // Fetch live market state on mount and poll
  useEffect(() => {
    const updateMarket = async () => {
      try {
        const state = await tatumSui.getMarketState();
        setMarketState(state);
      } catch {
        // Fallback handled inside tatumSui service
      }
    };

    updateMarket();
    const interval = setInterval(updateMarket, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePaymentSuccess = (receipt: X402Receipt) => {
    setWallet(prev => ({
      ...prev,
      balanceSui: Math.max(0, prev.balanceSui - receipt.amountSui)
    }));
    setReceipts([...x402Payment.getReceipts()]);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Top Cockpit Navigation & Global Telemetry */}
      <Header
        marketState={marketState}
        wallet={wallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unlockedCount={receipts.length}
        activeBrierScore={0.168}
      />

      {/* Main Cockpit Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'arena' && (
          <ArenaLeaderboard
            marketState={marketState}
            onNavigateToAudit={() => {
              setActiveTab('audit');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToX402={() => {
              setActiveTab('x402');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryInspector />
        )}

        {activeTab === 'audit' && (
          <ReflectiveThoughtEngine />
        )}

        {activeTab === 'x402' && (
          <ReceiptsList
            receipts={receipts}
            wallet={wallet}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </main>

      {/* Cockpit Footer */}
      <footer className="border-t border-slate-800/80 bg-[#030509]/95 py-6 px-4 text-[11px] text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-['Orbitron']">
              ROGUE<span className="text-cyan-400">TRADER</span>
            </span>
            <span className="text-slate-700">•</span>
            <span>Epistemic Arena • Tatum × Walrus Memory Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-slate-400">
            <span className="text-cyan-300">Walrus: relayer.memory.walrus.xyz</span>
            <span className="text-slate-700">•</span>
            <span className="text-purple-300">Tatum: sui-mainnet.gateway.tatum.io</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-300">x402 Micro-Settlement on Sui</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          // Re-trigger refresh if needed
        }}
      />
    </div>
  );
}

export default App;
