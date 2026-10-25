import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArenaLeaderboard } from './components/ArenaLeaderboard';
import { ReflectiveThoughtEngine } from './components/ReflectiveThoughtEngine';
import { MemoryInspector } from './components/MemoryInspector';
import { ReceiptsList } from './components/ReceiptsList';
import { X402PaywallModal } from './components/X402PaywallModal';
import { SettingsModal } from './components/SettingsModal';
import { agentEngine } from './services/agentEngine';
import { tatumSui } from './services/tatumSui';
import { x402Payment } from './services/x402Payment';
import type { AgentProfile, AgentId, TatumMarketState, UserWalletState, X402Receipt } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'arena' | 'reflection' | 'memory' | 'receipts'>('arena');
  const [agents, setAgents] = useState<AgentProfile[]>(() => agentEngine.getAgents());
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('alphasui');
  const [paywallAgent, setPaywallAgent] = useState<AgentProfile | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [receipts, setReceipts] = useState<X402Receipt[]>(() => x402Payment.getReceipts());
  const [marketState, setMarketState] = useState<TatumMarketState | null>(null);

  // Simulated connected user wallet state on Sui Mainnet
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
      } catch (e) {
        console.warn('Market fetch error:', e);
      }
    };

    updateMarket();
    const interval = setInterval(updateMarket, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectAgentForReflection = (agentId: AgentId) => {
    setSelectedAgentId(agentId);
    setActiveTab('reflection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (receipt: X402Receipt) => {
    // Deduct user balance
    setWallet(prev => ({
      ...prev,
      balanceSui: Math.max(0, prev.balanceSui - receipt.amountSui)
    }));

    // Refresh agent state
    setAgents([...agentEngine.getAgents()]);
    setReceipts([...x402Payment.getReceipts()]);
  };

  const unlockedCount = agents.filter(a => a.currentThesis.isUnlocked).length;

  return (
    <div className="min-h-screen bg-[#030407] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navigation Header */}
      <Header
        marketState={marketState}
        wallet={wallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unlockedCount={unlockedCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'arena' && (
          <ArenaLeaderboard
            agents={agents}
            onSelectAgentForReflection={handleSelectAgentForReflection}
            onOpenPaywall={agent => setPaywallAgent(agent)}
          />
        )}

        {activeTab === 'reflection' && (
          <ReflectiveThoughtEngine
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onPaywallClick={agent => setPaywallAgent(agent)}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryInspector />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsList
            receipts={receipts}
            agents={agents}
            onOpenPaywall={agent => setPaywallAgent(agent)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#030407] py-6 px-4 text-[11px] text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-['Orbitron']">ROGUE TRADER</span>
            <span className="text-zinc-700">•</span>
            <span>Tatum × Walrus Memory Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-zinc-400">
            <span className="text-cyan-400">Walrus: relayer.memory.walrus.xyz</span>
            <span className="text-zinc-700">•</span>
            <span className="text-purple-400">Tatum: sui-mainnet.gateway.tatum.io</span>
            <span className="text-zinc-700">•</span>
            <span className="text-emerald-400">x402 on Sui</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <X402PaywallModal
        agent={paywallAgent}
        wallet={wallet}
        onClose={() => setPaywallAgent(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          setAgents([...agentEngine.getAgents()]);
        }}
      />
    </div>
  );
}

export default App;
