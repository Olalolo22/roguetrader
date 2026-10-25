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
  -H "X-PAYMENT: sui:${receipts[0]?.txDigest || '0x992fa100eb81711200dfa8829011b9881023bc4a'}" \\
  -H "Accept: application/json"`;

  return (
    <div className="space-y-5">
      {/* Bounty Banner */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white font-['Orbitron']">
              x402 Agent Payments on Sui
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
              Bounty Target: $500
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Machine-to-machine payment negotiation adhering to the standard HTTP 402 challenge/response workflow on Sui.
          </p>
        </div>

        <div className="bg-black px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs font-mono flex items-center gap-2">
          <span className="text-zinc-500">Total Settled:</span>
          <span className="text-emerald-400 font-bold">
            {receipts.reduce((acc, r) => acc + r.amountSui, 0).toFixed(2)} SUI
          </span>
        </div>
      </div>

      {/* Programmatic cURL Integration Card */}
      <div className="border border-white/[0.08] bg-black rounded-xl p-4 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-zinc-500 border-b border-white/[0.04] pb-1.5 text-[10px]">
          <span className="flex items-center gap-1 text-cyan-400">
            <Terminal className="w-3 h-3" /> Programmatic Agent Query (A2A via x402 Header)
          </span>
          <button
            onClick={() => copyDigest('curl', sampleCurl)}
            className="flex items-center gap-1 text-zinc-400 hover:text-cyan-300"
          >
            {copiedId === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedId === 'curl' ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <pre className="text-zinc-300 text-[11px] overflow-x-auto p-2 bg-zinc-950 rounded border border-white/[0.04] leading-relaxed">
          {sampleCurl}
        </pre>
      </div>

      {/* Receipts Table */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Settlement Log ({receipts.length})
          </h3>
        </div>

        {receipts.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-zinc-500 text-xs font-mono">No x402 payments executed in this browser session yet.</p>
            <button
              onClick={() => onOpenPaywall(agents[0])}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all"
            >
              Unlock AlphaSui-v4 Thesis (0.05 SUI via x402)
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {receipts.map(r => {
              const agent = agents.find(a => a.id === r.agentId);

              return (
                <div key={r.paymentId} className="p-3.5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span>{agent?.avatar || '⚡'}</span>
                      <span className="text-white font-bold">{agent?.name || r.agentId}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                        SUCCESS
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-500 flex items-center gap-2 flex-wrap">
                      <span>ID: <strong className="text-zinc-300">{r.paymentId}</strong></span>
                      <span>•</span>
                      <span>Tx: <strong className="text-cyan-400">{r.txDigest.slice(0, 14)}...</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">+{r.amountSui} SUI</div>
                      <div className="text-[9px] text-zinc-600">{new Date(r.timestamp).toLocaleTimeString()}</div>
                    </div>

                    <button
                      onClick={() => copyDigest(r.paymentId, r.txDigest)}
                      className="p-1.5 rounded bg-black hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/[0.06]"
                      title="Copy Transaction Digest"
                    >
                      {copiedId === r.paymentId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
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
