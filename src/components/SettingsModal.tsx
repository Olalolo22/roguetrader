import { useState } from 'react';
import type React from 'react';
import { X } from 'lucide-react';
import { tatumSui } from '../services/tatumSui';
import { walrusMemory } from '../services/walrusMemory';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  if (!isOpen) return null;
  return <SettingsPanel onClose={onClose} onSaved={onSaved} />;
};

const SettingsPanel: React.FC<Omit<SettingsModalProps, 'isOpen'>> = ({ onClose, onSaved }) => {
  const [tatumKey, setTatumKey] = useState(tatumSui.getApiKey());
  const [walrusAccount, setWalrusAccount] = useState(
    (import.meta.env.VITE_MEMWAL_ACCOUNT_ID as string | undefined) ||
      '0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223'
  );
  const [walrusKey, setWalrusKey] = useState(
    (import.meta.env.VITE_MEMWAL_KEY as string | undefined) || ''
  );
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    tatumSui.setApiKey(tatumKey);
    if (walrusAccount && walrusKey) {
      const res = await walrusMemory.configureLive(walrusKey, walrusAccount);
      if (!res.success) {
        setStatus({ ok: false, text: `Walrus SDK: ${res.error}` });
        return;
      }
    }
    setStatus({ ok: true, text: 'Saved.' });
    onSaved();
    setTimeout(onClose, 900);
  };

  const test = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const health = await walrusMemory.getHealth();
      const ckpt = await tatumSui.getLatestCheckpoint();
      setStatus({ ok: true, text: `Walrus relayer ${health.relayer} · checkpoint ${ckpt.toLocaleString('en-US')}` });
    } catch (err) {
      setStatus({ ok: false, text: `Connection failed: ${(err as Error).message}` });
    } finally {
      setTesting(false);
    }
  };

  const field =
    'num h-11 w-full rounded-lg border border-line bg-deep px-3 text-sm text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={e => e.stopPropagation()}
        className="rise max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-card sm:rounded-2xl"
      >
        <div className="flex h-14 items-center justify-between border-b border-line pr-2 pl-5">
          <h2 id="settings-title" className="text-base font-medium text-fg">
            Network
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 items-center justify-center rounded-lg text-fg-3 hover:bg-raised hover:text-fg"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <label className="block space-y-2">
            <span className="text-sm text-fg-2">Tatum API key</span>
            <input type="password" value={tatumKey} onChange={e => setTatumKey(e.target.value)} placeholder="t-…" className={field} />
            <span className="block text-meta text-fg-3">Without a key, checkpoints come from the public Sui RPC.</span>
          </label>

          <div className="space-y-3">
            <span className="text-sm text-fg-2">Walrus MemWal</span>
            <input value={walrusAccount} onChange={e => setWalrusAccount(e.target.value)} placeholder="Account id 0x…" className={field} />
            <input
              type="password"
              value={walrusKey}
              onChange={e => setWalrusKey(e.target.value)}
              placeholder="Ed25519 delegate key"
              className={field}
            />
            <span className="block text-meta text-fg-3">Leave empty to use the local index seeded from backtest.</span>
          </div>

          {status && (
            <p className={`text-sm break-words ${status.ok ? 'text-fg-2' : 'text-neg'}`} role="status">
              {status.text}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line p-5 sm:flex-row sm:justify-end">
          <button
            onClick={test}
            disabled={testing}
            className="h-11 rounded-lg border border-line bg-raised px-4 text-sm text-fg transition-colors duration-150 ease-out hover:border-line-2 disabled:opacity-50"
          >
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <button
            onClick={save}
            className="btn-primary h-11 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-out"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
