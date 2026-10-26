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
  const [wallet, setWallet] = useState<UserWalletState>({ address: '0x4f82a101b9ca990188efacba772109aa988112bc', balanceSui: 14.50, isConnected: true, network: 'mainnet' });

  useEffect(() => {
    const updateMarket = async () => { try { setMarketState(await tatumSui.getMarketState()); } catch (e) { console.warn('Market fetch error:', e); } };
    updateMarket();
    const interval = setInterval(updateMarket, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectAgentForReflection = (agentId: AgentId) => { setSelectedAgentId(agentId); setActiveTab('reflection'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handlePaymentSuccess = (receipt: X402Receipt) => {
    setWallet(prev => ({ ...prev, balanceSui: Math.max(0, prev.balanceSui - receipt.amountSui) }));
    setAgents([...agentEngine.getAgents()]);
    setReceipts([...x402Payment.getReceipts()]);
  };
  const unlockedCount = agents.filter(a => a.currentThesis.isUnlocked).length;

  return (
    <div className="arena-shell min-h-screen flex flex-col bg-transparent text-[var(--paper)]">
      <Header marketState={marketState} wallet={wallet} activeTab={activeTab} setActiveTab={setActiveTab} onOpenSettings={() => setIsSettingsOpen(true)} unlockedCount={unlockedCount} />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-5">
        {activeTab === 'arena' && <ArenaLeaderboard agents={agents} onSelectAgentForReflection={handleSelectAgentForReflection} onOpenPaywall={agent => setPaywallAgent(agent)} />}
        {activeTab === 'reflection' && <ReflectiveThoughtEngine agents={agents} selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} onPaywallClick={agent => setPaywallAgent(agent)} />}
        {activeTab === 'memory' && <MemoryInspector />}
        {activeTab === 'receipts' && <ReceiptsList receipts={receipts} agents={agents} onOpenPaywall={agent => setPaywallAgent(agent)} />}
      </main>
      <footer className="border-t border-[var(--line)] bg-[rgba(4,17,19,.92)] px-4 py-4 text-[10px] font-mono text-[var(--paper-muted)]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between gap-2">
          <span><b className="text-[var(--cyan)] tracking-[.18em]">ROGUE TRADER</b> / TOTAL RECALL 2026</span>
          <span className="text-[var(--cyan-dim)]">WALRUS MEMORY · TATUM SUI · x402 SETTLEMENT</span>
        </div>
      </footer>
      <X402PaywallModal agent={paywallAgent} wallet={wallet} onClose={() => setPaywallAgent(null)} onPaymentSuccess={handlePaymentSuccess} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSaved={() => setAgents([...agentEngine.getAgents()])} />
    </div>
  );
}
export default App;
