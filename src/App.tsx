import { useState, useEffect } from 'react';
import { Header, type CockpitTab } from './components/Header';
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
  const [activeTab, setActiveTab] = useState<CockpitTab>('arena');
  const [agents, setAgents] = useState<AgentProfile[]>(() => agentEngine.getAgents());
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('alphasui');
  const [paywallAgent, setPaywallAgent] = useState<AgentProfile | null>(null);
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

  const handleSelectAgentForReflection = (agentId: AgentId) => {
    setSelectedAgentId(agentId);
    setActiveTab('reflection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (receipt: X402Receipt) => {
    setWallet(prev => ({
      ...prev,
      balanceSui: Math.max(0, prev.balanceSui - receipt.amountSui)
    }));

    setAgents([...agentEngine.getAgents()]);
    setReceipts([...x402Payment.getReceipts()]);
  };

  const unlockedCount = agents.filter(a => a.currentThesis.isUnlocked).length;
  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Top Cockpit Navigation & Global Telemetry */}
      <Header
        marketState={marketState}
        wallet={wallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unlockedCount={unlockedCount}
        activeBrierScore={activeAgent.brierScore}
      />

      {/* Main Cockpit Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'arena' && (
          <ArenaLeaderboard
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onSelectAgentForReflection={handleSelectAgentForReflection}
            onOpenPaywall={agent => setPaywallAgent(agent)}
            onNavigateX402={() => {
              setActiveTab('x402');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            marketState={marketState}
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

        {activeTab === 'x402' && (
          <ReceiptsList
            receipts={receipts}
            agents={agents}
            wallet={wallet}
            onPaymentSuccess={handlePaymentSuccess}
            onOpenPaywall={agent => setPaywallAgent(agent)}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryInspector />
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
            <span>Epistemic Trading Cockpit • Tatum × Walrus Memory Hackathon 2026</span>
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
