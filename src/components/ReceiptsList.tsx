import { useMemo, useState } from 'react';
import type React from 'react';
import { Check, Copy } from 'lucide-react';
import type { X402Receipt, UserWalletState } from '../types';
import { x402Payment } from '../services/x402Payment';

interface ReceiptsListProps {
  receipts: X402Receipt[];
  wallet: UserWalletState;
  onPaymentSuccess: (receipt: X402Receipt) => void;
}

const mid = (h: string, a = 6, b = 4) => (h.length > a + b + 1 ? `${h.slice(0, a)}…${h.slice(-b)}` : h);

export const ReceiptsList: React.FC<ReceiptsListProps> = ({ receipts, wallet, onPaymentSuccess }) => {
  const [isSettling, setIsSettling] = useState(false);
  const [customDigest, setCustomDigest] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const invoice = useMemo(() => x402Payment.generateInvoice(0.05), [receipts.length]);

  const activeDigest = customDigest.trim() || receipts[0]?.txDigest || '5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N';

  const settle = async () => {
    setIsSettling(true);
    try {
      const res = await x402Payment.settleInvoice(invoice, wallet.address, customDigest.trim() || undefined);
      if (res.success && res.receipt) onPaymentSuccess(res.receipt);
    } finally {
      setIsSettling(false);
    }
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const apiBase = typeof window !== 'undefined' ? window.location.origin : 'https://roguetrader.vercel.app';
  const curl = `curl -X POST ${apiBase}/api/x402/check \\
  -H "X-PAYMENT: sui:${activeDigest}" \\
  -H "Content-Type: application/json" \\
  -d '{"trade":"Long SUI 0.85, 3x"}'`;

  return (
    <div className="space-y-8 pt-8 sm:pt-12">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-fg">Bot API · Pay-Per-Check (x402)</h1>
        <p className="mt-2 max-w-xl text-base text-fg-2">
          Any trading bot can call RogueTrader over HTTP before placing an order. It pays 0.05 SUI per check and gets the protected trade size back.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-card p-5 lg:col-span-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-medium text-fg">402 Payment required</h2>
            <span className="num text-meta text-fg-3">expires in 15 min</span>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">Amount</dt>
              <dd className="num text-fg">{invoice.amountSui.toFixed(2)} SUI</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">Recipient</dt>
              <dd className="num truncate text-fg">{mid(invoice.recipient)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">Payer</dt>
              <dd className="num truncate text-fg">{mid(wallet.address)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">Balance</dt>
              <dd className="num text-fg">{wallet.balanceSui.toFixed(2)} SUI</dd>
            </div>
          </dl>
          <pre className="num mt-4 rounded-lg border border-line bg-deep p-3 text-meta break-all whitespace-pre-wrap text-fg-3">
            WWW-Authenticate: {invoice.headerChallenge}
          </pre>
          <div className="mt-4 space-y-1.5">
            <label className="text-xs text-fg-3">Sui Mainnet Transaction Digest</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDigest}
                onChange={e => setCustomDigest(e.target.value)}
                placeholder="5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N"
                className="h-10 flex-1 rounded-lg border border-line bg-deep px-3 text-xs font-mono text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCustomDigest('5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N')}
                className="h-10 rounded-lg border border-line bg-raised px-3 text-xs text-fg-2 hover:text-fg whitespace-nowrap"
              >
                Default Genesis Tx
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="num text-meta text-fg-3">Sui Mainnet tx · verified via Tatum RPC</span>
            <button
              onClick={settle}
              disabled={isSettling}
              className="btn-primary h-11 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-out disabled:opacity-50"
            >
              {isSettling ? 'Verifying…' : 'Verify 0.05 SUI Receipt'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-medium text-fg">Request</h2>
            <button
              onClick={() => copy('curl', curl)}
              aria-label="Copy request"
              className="flex size-10 items-center justify-center rounded-lg text-fg-3 transition-colors duration-150 ease-out hover:bg-raised hover:text-fg"
            >
              {copied === 'curl' ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
            </button>
          </div>
          <pre className="num mt-3 rounded-lg border border-line bg-deep p-3 text-meta break-all whitespace-pre-wrap text-fg-2">
            {curl}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-base font-medium text-fg">Receipts</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="hidden grid-cols-[1fr_1fr_6rem_8rem_2.5rem] gap-4 border-b border-line px-5 py-3 text-meta text-fg-3 md:grid">
            <span>Payment</span>
            <span>Tx digest</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Sui Block</span>
            <span />
          </div>
          {receipts.length === 0 && <p className="p-5 text-sm text-fg-3">No receipts yet.</p>}
          <ul className="divide-y divide-line">
            {receipts.map(r => (
              <li
                key={r.paymentId}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[1fr_1fr_6rem_8rem_2.5rem] md:px-5"
              >
                <span className="num truncate text-sm text-fg">{mid(r.paymentId, 10, 4)}</span>
                <span className="num text-right text-sm text-neg md:order-3">-{r.amountSui.toFixed(2)} SUI</span>
                <span className="num truncate text-meta text-fg-2 md:order-2 md:text-sm">{mid(r.txDigest, 8, 6)}</span>
                <span className="text-right md:order-4">
                  <span className="keycap">
                    <span>block</span>
                    #{r.tatumCheckpoint.toLocaleString('en-US')}
                  </span>
                </span>
                <button
                  onClick={() => copy(r.paymentId, r.txDigest)}
                  aria-label="Copy digest"
                  className="col-span-2 hidden size-10 items-center justify-center rounded-lg text-fg-3 hover:bg-raised hover:text-fg md:order-5 md:col-span-1 md:flex"
                >
                  {copied === r.paymentId ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
