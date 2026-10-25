import { useState } from 'react';
import type React from 'react';
import { X, ShieldCheck, CheckCircle2, Zap, Terminal, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AgentProfile, UserWalletState, X402Invoice, X402Receipt } from '../types';
import { x402Payment } from '../services/x402Payment';

interface X402PaywallModalProps {
  agent: AgentProfile | null;
  wallet: UserWalletState;
  onClose: () => void;
  onPaymentSuccess: (receipt: X402Receipt) => void;
}

export const X402PaywallModal: React.FC<X402PaywallModalProps> = ({
  agent,
  wallet,
  onClose,
  onPaymentSuccess
}) => {
  if (!agent) return null;

  const [isSettling, setIsSettling] = useState(false);
  const [invoice] = useState<X402Invoice>(() =>
    x402Payment.generateInvoice(agent.id, agent.unlockPriceSui, agent.recipientAddress)
  );
  const [receipt, setReceipt] = useState<X402Receipt | null>(null);
  const [copiedChallenge, setCopiedChallenge] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const handlePay = async () => {
    setIsSettling(true);

    try {
      const result = await x402Payment.settleInvoice(invoice, wallet.address);
      if (result.success && result.receipt) {
        setReceipt(result.receipt);

        // Confetti celebration
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });

        onPaymentSuccess(result.receipt);
      }
    } catch (err) {
      console.error('x402 settlement failed:', err);
    } finally {
      setIsSettling(false);
    }
  };

  const copyText = (text: string, type: 'challenge' | 'digest') => {
    navigator.clipboard.writeText(text);
    if (type === 'challenge') {
      setCopiedChallenge(true);
      setTimeout(() => setCopiedChallenge(false), 2000);
    } else {
      setCopiedDigest(true);
      setTimeout(() => setCopiedDigest(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#08090d] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden font-sans my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-4 h-4" />
            </span>
            <span className="font-bold text-white text-xs sm:text-sm font-['Orbitron']">
              HTTP 402 Payment Required
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
              x402-sui
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {!receipt ? (
            <>
              {/* Agent Paywall Target */}
              <div className="p-3.5 rounded-lg bg-black border border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{agent.avatar}</span>
                  <div>
                    <h4 className="font-bold text-white text-xs font-['Orbitron']">{agent.name}</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">Brier Score: {agent.brierScore.toFixed(3)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono">Settlement Fee</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {agent.unlockPriceSui} SUI
                  </div>
                </div>
              </div>

              {/* Protocol Spec Box */}
              <div className="p-3.5 rounded-lg bg-black border border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] pb-1 border-b border-white/[0.04]">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Terminal className="w-3 h-3" /> Server Response Header
                  </span>
                  <button
                    onClick={() => copyText(invoice.headerChallenge, 'challenge')}
                    className="flex items-center gap-1 text-zinc-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedChallenge ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedChallenge ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-rose-400 text-[11px] font-bold">HTTP/1.1 402 Payment Required</div>
                <div className="text-zinc-400 text-[10px] break-all bg-zinc-950 p-2 rounded border border-white/[0.04] leading-relaxed">
                  <span className="text-purple-400">WWW-Authenticate: </span>
                  {invoice.headerChallenge}
                </div>
              </div>

              {/* Transaction Execution Details */}
              <div className="space-y-1.5 text-[11px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Payer:</span>
                  <span className="text-zinc-300">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Settlement Vault:</span>
                  <span className="text-cyan-400">{agent.recipientAddress.slice(0, 6)}...{agent.recipientAddress.slice(-4)}</span>
                </div>
              </div>

              {/* Settlement Button */}
              <button
                onClick={handlePay}
                disabled={isSettling}
                className="w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
              >
                {isSettling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin"></div>
                    <span>Verifying on Sui via Tatum...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize {agent.unlockPriceSui} SUI via x402</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Unlocked View */
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-xs font-['Orbitron']">
                  x402 Micropayment Confirmed
                </h4>
                <p className="text-[11px] text-emerald-300 font-mono">
                  Paid {receipt.amountSui} SUI to {agent.name}. Verified by Tatum Sui Gateway.
                </p>
              </div>

              {/* Receipt */}
              <div className="p-3 rounded-lg bg-black border border-white/[0.06] font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-white/[0.04]">
                  <span className="text-cyan-400">Sui Settlement Receipt</span>
                  <button
                    onClick={() => copyText(receipt.txDigest, 'digest')}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white"
                  >
                    {copiedDigest ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDigest ? 'Copied' : 'Copy Tx'}</span>
                  </button>
                </div>
                <div className="text-[10px] text-zinc-400 space-y-0.5">
                  <div>ID: <span className="text-zinc-200">{receipt.paymentId}</span></div>
                  <div>Tx: <span className="text-cyan-300 break-all">{receipt.txDigest}</span></div>
                </div>
              </div>

              {/* Unlocked Alpha */}
              <div className="p-3.5 rounded-lg bg-black border border-cyan-500/30 space-y-2">
                <div className="text-[10px] font-mono font-bold text-cyan-400">
                  UNLOCKED ALPHA & POSITION MANDATE:
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {agent.currentThesis.fullAnalysis}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04] text-center font-mono text-xs">
                  <div className="bg-zinc-950 p-2 rounded border border-white/[0.04]">
                    <div className="text-[9px] text-zinc-500">Entry Range</div>
                    <div className="text-white font-bold">{agent.currentThesis.entryRange}</div>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-white/[0.04]">
                    <div className="text-[9px] text-emerald-400">Take Profit</div>
                    <div className="text-emerald-400 font-bold">${agent.currentThesis.targetPrice}</div>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-white/[0.04]">
                    <div className="text-[9px] text-rose-400">Stop Loss</div>
                    <div className="text-rose-400 font-bold">${agent.currentThesis.stopLoss}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold transition-colors"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
