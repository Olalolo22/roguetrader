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
          particleCount: 80,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base font-['Orbitron']">
                  HTTP 402 Payment Required
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                  x402-sui
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Agent Settlement Protocol • Micro-payment on Sui Mainnet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!receipt ? (
            <>
              {/* Agent Paywall Target Info */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent.avatar}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-['Orbitron']">{agent.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">Brier Calibration Score: {agent.brierScore.toFixed(3)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">Required Micro-payment</div>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    {agent.unlockPriceSui} SUI
                  </div>
                </div>
              </div>

              {/* Protocol Spec Box: HTTP 402 Header */}
              <div className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-1.5">
                  <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
                    <Terminal className="w-3.5 h-3.5" /> Server Response Header
                  </span>
                  <button
                    onClick={() => copyText(invoice.headerChallenge, 'challenge')}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
                  >
                    {copiedChallenge ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedChallenge ? 'Copied' : 'Copy Header'}</span>
                  </button>
                </div>

                <div className="text-rose-400 font-bold">HTTP/1.1 402 Payment Required</div>
                <div className="text-slate-300 text-[11px] break-all leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800/80">
                  <span className="text-purple-400">WWW-Authenticate: </span>
                  {invoice.headerChallenge}
                </div>
              </div>

              {/* Transaction Execution Details */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Payer Account:</span>
                  <span className="text-slate-200">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Agent Settlement Vault:</span>
                  <span className="text-cyan-400">{agent.recipientAddress.slice(0, 8)}...{agent.recipientAddress.slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sui Network Checkpoint:</span>
                  <span className="text-purple-400">Verified via Tatum Gateway</span>
                </div>
              </div>

              {/* Settlement Button */}
              <button
                onClick={handlePay}
                disabled={isSettling}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isSettling
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
                }`}
              >
                {isSettling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Broadcasting & Verifying on Sui via Tatum...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize {agent.unlockPriceSui} SUI x402 Micropayment</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Post-Payment Unlocked View */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base font-['Orbitron']">
                  x402 Micro-Settlement Confirmed!
                </h4>
                <p className="text-xs text-emerald-300">
                  Paid {receipt.amountSui} SUI to {agent.name}. Verified by Tatum Sui Gateway.
                </p>
              </div>

              {/* Decoded Receipt Box */}
              <div className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-1.5">
                  <span className="text-cyan-400">x402 Sui Settlement Receipt</span>
                  <button
                    onClick={() => copyText(receipt.txDigest, 'digest')}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
                  >
                    {copiedDigest ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDigest ? 'Copied' : 'Copy Tx'}</span>
                  </button>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div>Payment ID: <span className="text-white">{receipt.paymentId}</span></div>
                  <div>Digest: <span className="text-cyan-300 break-all">{receipt.txDigest}</span></div>
                  <div>Settled At: <span className="text-slate-400">{receipt.timestamp}</span></div>
                </div>
              </div>

              {/* Unlocked Full Analysis Content */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> UNLOCKED ALPHA & POSITION MANDATE:
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {agent.currentThesis.fullAnalysis}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Entry Range</div>
                    <div className="text-white font-bold">{agent.currentThesis.entryRange}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-emerald-400">Target Take-Profit</div>
                    <div className="text-emerald-400 font-bold">${agent.currentThesis.targetPrice}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-rose-400">Hard Stop Loss</div>
                    <div className="text-rose-400 font-bold">${agent.currentThesis.stopLoss}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
              >
                Close & Return to Arena
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
