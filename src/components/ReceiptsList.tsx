import { useState } from 'react';
import type React from 'react';
import { ShieldCheck, Terminal, Copy, Check, Zap } from 'lucide-react';
import type { X402Receipt, AgentProfile } from '../types';

interface ReceiptsListProps {
  receipts: X402Receipt[];
  agents: AgentProfile[];
  onOpenPaywall: (agent: AgentProfile) => void;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  receipts,
  agents,
  onOpenPaywall
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyDigest = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleCurl = `curl -X GET "https://api.roguetrader.xyz/v1/agent/alphasui/thesis" \\
  -H "X-PAYMENT: sui:${receipts[0]?.txDigest || '0x992fa100eb81711200dfa8829011b9881023bc4a88910'}" \\
  -H "Accept: application/json"`;

  return (
    <div className="space-y-6">
      {/* Bounty Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white font-['Orbitron']">
              x402 Agent Payments on Sui
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              Bounty Target: $500
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Machine-to-machine payment negotiation adhering to the standard HTTP 402 challenge/response workflow with micro-settlement on Sui.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-3">
          <span className="text-slate-400">Total Settled:</span>
          <span className="text-emerald-400 font-bold text-sm">
            {receipts.reduce((acc, r) => acc + r.amountSui, 0).toFixed(2)} SUI
          </span>
        </div>
      </div>

      {/* Programmatic cURL Integration Card */}
      <div className="rounded-2xl bg-black/90 border border-slate-800 p-5 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
            <Terminal className="w-3.5 h-3.5" /> Programmatic Agent Query (A2A via x402 Header)
          </span>
          <button
            onClick={() => copyDigest('curl', sampleCurl)}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
          >
            {copiedId === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedId === 'curl' ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-950 rounded border border-slate-900 leading-relaxed">
          {sampleCurl}
        </pre>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Settlement Log ({receipts.length})
          </h3>
        </div>

        {receipts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-slate-400 text-xs font-mono">No x402 payments executed in this browser session yet.</p>
            <button
              onClick={() => onOpenPaywall(agents[0])}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Unlock AlphaSui-v4 Thesis (0.05 SUI via x402)
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {receipts.map(r => {
              const agent = agents.find(a => a.id === r.agentId);

              return (
                <div key={r.paymentId} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agent?.avatar || '⚡'}</span>
                      <span className="text-white font-bold">{agent?.name || r.agentId}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                        SUCCESS
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>Payment ID: <strong className="text-slate-300">{r.paymentId}</strong></span>
                      <span>•</span>
                      <span>Sui Tx: <strong className="text-cyan-400">{r.txDigest.slice(0, 14)}...{r.txDigest.slice(-6)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-sm">+{r.amountSui} SUI</div>
                      <div className="text-[10px] text-slate-500">{new Date(r.timestamp).toLocaleTimeString()}</div>
                    </div>

                    <button
                      onClick={() => copyDigest(r.paymentId, r.txDigest)}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                      title="Copy Transaction Digest"
                    >
                      {copiedId === r.paymentId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
