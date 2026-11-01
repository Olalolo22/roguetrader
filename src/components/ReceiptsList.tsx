import { useState } from 'react';
import type React from 'react';
import {
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Zap,
  Lock,
  Unlock,
  CheckCircle2,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { X402Receipt, AgentProfile, UserWalletState } from '../types';
import { x402Payment } from '../services/x402Payment';

interface ReceiptsListProps {
  receipts: X402Receipt[];
  agents: AgentProfile[];
  wallet: UserWalletState;
  onPaymentSuccess: (receipt: X402Receipt) => void;
  onOpenPaywall: (agent: AgentProfile) => void;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  receipts,
  agents,
  wallet,
  onPaymentSuccess
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0].id);
  const [isSettlingInline, setIsSettlingInline] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const isUnlocked = activeAgent.currentThesis.isUnlocked;
  const latestAgentReceipt = receipts.find(r => r.agentId === activeAgent.id);

  const invoice = x402Payment.generateInvoice(
    activeAgent.id,
    activeAgent.unlockPriceSui,
    activeAgent.recipientAddress
  );

  const handleInlineSettle = async () => {
    setIsSettlingInline(true);
    try {
      const result = await x402Payment.settleInvoice(invoice, wallet.address);
      if (result.success && result.receipt) {
        confetti({
          particleCount: 65,
          spread: 55,
          origin: { y: 0.6 }
        });
        onPaymentSuccess(result.receipt);
      }
    } catch {
      // Handled via UI state
    } finally {
      setIsSettlingInline(false);
    }
  };

  const copyDigest = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleCurl = `curl -X GET "https://api.roguetrader.xyz/api/x402/mandate?agent=${activeAgent.id}" \\
  -H "X-PAYMENT: sui:${latestAgentReceipt?.txDigest || '0x992fa100eb81711200dfa8829011b9881023bc4a'}" \\
  -H "Accept: application/json"`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="cockpit-panel p-3.5 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 corner-ticks">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-lg font-bold text-white font-['Orbitron']">
              x402 Micro-Settlement Protocol (SUI)
            </h2>
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
              Agent Payments ($500 Bounty)
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono leading-relaxed">
            Pay-per-inference HTTP 402 negotiation on Sui Mainnet. Unlock calibrated position mandates with zero subscription custody.
          </p>
        </div>

        {/* Agent Selector Pills: 3 equal cols on mobile, inline on sm+ */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#04070e] p-1 rounded-xl border border-slate-800 w-full lg:w-auto">
          {agents.map(ag => (
            <button
              key={ag.id}
              onClick={() => setSelectedAgentId(ag.id)}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 cursor-pointer ${
                ag.id === activeAgent.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="truncate">{ag.avatar} {ag.name.split('-')[0]}</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400">({ag.unlockPriceSui} SUI)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side x402 Protocol Client & Position Mandate Stream Decryptor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* LEFT CARD: x402 Protocol Client (HTTP 402 Challenge -> 200 OK) */}
        <div className="cockpit-panel p-3.5 sm:p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-white font-['Orbitron'] truncate">
                  x402 Protocol Client
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ${
                  isUnlocked
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isUnlocked ? 'HTTP/1.1 200 OK' : 'HTTP/1.1 402 Payment Required'}
              </span>
            </div>

            {/* HTTP Request / Response Terminal */}
            <div className="p-3 sm:p-4 rounded-xl bg-[#03050a] border border-slate-800/90 font-mono text-[11px] sm:text-xs space-y-2 break-all">
              <div className="text-slate-400">
                <span className="text-cyan-400 font-bold">GET</span> /api/x402/mandate?agent={activeAgent.id} HTTP/1.1
              </div>
              <div className="text-slate-500">Host: api.roguetrader.xyz</div>

              {!isUnlocked ? (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-rose-400 font-bold">HTTP/1.1 402 Payment Required</div>
                  <div className="text-purple-300 text-[10px] sm:text-[11px] leading-relaxed">
                    WWW-Authenticate: {invoice.headerChallenge}
                  </div>
                  <div className="text-slate-400 text-[10px] sm:text-[11px] pt-1">
                    X-Sui-Recipient: <span className="text-cyan-300">{activeAgent.recipientAddress}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] sm:text-[11px]">
                    X-Price-Amount: <span className="text-emerald-400 font-bold">{activeAgent.unlockPriceSui} SUI</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-emerald-400 font-bold">HTTP/1.1 200 OK (Tatum Gateway Verified)</div>
                  <div className="text-cyan-300 text-[10px] sm:text-[11px]">
                    X-PAYMENT-RECEIPT: {latestAgentReceipt?.txDigest || '0x992fa100eb81711200dfa8829011b'}
                  </div>
                  <div className="text-emerald-300 text-[10px] sm:text-[11px]">
                    X-WALRUS-PROOF: walrus://blob/{activeAgent.currentThesis.walrusBlobHash}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 sm:pt-3">
            {!isUnlocked ? (
              <button
                onClick={handleInlineSettle}
                disabled={isSettlingInline}
                className="w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span>
                  {isSettlingInline
                    ? 'Verifying on Sui via Tatum...'
                    : `Sign & Broadcast ${activeAgent.unlockPriceSui} SUI Micropayment`}
                </span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs font-mono text-emerald-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Verified on Sui Mainnet
                </span>
                <span className="shrink-0">{activeAgent.unlockPriceSui} SUI Paid</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: Position Mandate Stream Decryptor */}
        <div className={`p-3.5 sm:p-5 space-y-4 flex flex-col justify-between ${isUnlocked ? 'cockpit-panel-emerald' : 'cockpit-panel'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                {isUnlocked ? (
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <h3 className="text-xs sm:text-sm font-bold text-white font-['Orbitron'] truncate">
                  Position Mandate Stream ({activeAgent.name})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 shrink-0">
                Brier: {activeAgent.brierScore.toFixed(3)}
              </span>
            </div>

            {!isUnlocked ? (
              <div className="p-5 sm:p-8 rounded-xl bg-[#04070e] border border-slate-800/80 text-center space-y-3 my-auto">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white font-['Orbitron']">
                    Mandate Stream Encrypted (HTTP 402)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
                    Authorize the {activeAgent.unlockPriceSui} SUI micropayment to decrypt {activeAgent.name}'s exact entry ladder, take-profit target, stop-loss invalidation, and Walrus proof blob.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 sm:space-y-4">
                <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-mono bg-[#03060c] p-3 sm:p-3.5 rounded-xl border border-emerald-500/30">
                  {activeAgent.currentThesis.fullAnalysis}
                </p>

                {/* 3-Box Mandate Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-[#03060c] border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Entry Zone</div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      {activeAgent.currentThesis.entryRange}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#03060c] border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 uppercase">Take Profit (TP)</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                      ${activeAgent.currentThesis.targetPrice} (+7.4%)
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#03060c] border border-rose-500/30">
                    <div className="text-[10px] text-rose-400 uppercase">Invalidation (SL)</div>
                    <div className="text-xs sm:text-sm font-bold text-rose-400 mt-0.5">
                      ${activeAgent.currentThesis.stopLoss} (-3.2%)
                    </div>
                  </div>
                </div>

                {/* Cryptographic Walrus Proof */}
                <div className="p-3 rounded-xl bg-[#03060c] border border-cyan-500/30 text-[11px] sm:text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-cyan-300 shrink-0">
                    <Database className="w-3.5 h-3.5 text-cyan-400" /> Cryptographic Proof:
                  </span>
                  <span className="text-slate-200 break-all">
                    walrus://blob/{activeAgent.currentThesis.walrusBlobHash}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Programmatic cURL Integration Card */}
      <div className="cockpit-panel p-3.5 sm:p-5 font-mono text-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-slate-400 border-b border-slate-800 pb-2 text-[10px]">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase truncate">
            <Terminal className="w-3.5 h-3.5 shrink-0" /> A2A Programmatic Query (x402 Header)
          </span>
          <button
            onClick={() => copyDigest('curl', sampleCurl)}
            className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 cursor-pointer shrink-0"
          >
            {copiedId === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'curl' ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <pre className="text-cyan-200 text-[10px] sm:text-[11px] overflow-x-auto p-3 bg-[#03050a] rounded-lg border border-slate-800/80 leading-relaxed">
          {sampleCurl}
        </pre>
      </div>

      {/* Verified Settlement Ledger */}
      <div className="cockpit-panel overflow-hidden">
        <div className="px-3.5 sm:px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <h3 className="font-bold text-white text-xs sm:text-sm font-['Orbitron'] flex items-center gap-2 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Verified Sui x402 Ledger ({receipts.length})</span>
          </h3>
          <span className="text-[11px] sm:text-xs font-mono text-emerald-400 font-bold shrink-0">
            Settled: {receipts.reduce((acc, r) => acc + r.amountSui, 0).toFixed(2)} SUI
          </span>
        </div>

        {receipts.length === 0 ? (
          <div className="p-5 sm:p-6 text-center text-xs font-mono text-slate-400">
            No x402 transactions signed in this session yet. Tap <strong>"Sign &amp; Broadcast {activeAgent.unlockPriceSui} SUI Micropayment"</strong> above to test live settlement.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {receipts.map(r => {
              const agent = agents.find(a => a.id === r.agentId);

              return (
                <div
                  key={r.paymentId}
                  className="p-3.5 sm:p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 font-mono text-xs"
                >
                  <div className="space-y-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{agent?.avatar || '⚡'}</span>
                      <span className="text-white font-bold">{agent?.name || r.agentId}</span>
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                        200 OK • VERIFIED
                      </span>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="truncate">
                        ID: <strong className="text-slate-200">{r.paymentId}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Tx: <strong className="text-cyan-300">{r.txDigest.slice(0, 14)}...</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                    <div className="text-left sm:text-right">
                      <div className="text-emerald-400 font-bold">{r.amountSui} SUI</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <button
                      onClick={() => copyDigest(r.paymentId, r.txDigest)}
                      className="p-2 rounded-lg bg-[#04070e] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800 cursor-pointer"
                      title="Copy Transaction Digest"
                    >
                      {copiedId === r.paymentId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
