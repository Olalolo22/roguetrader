import { useState } from 'react';
import type React from 'react';
import { X } from 'lucide-react';
import { agentEngine } from '../services/agentEngine';
import { DEFAULT_RISK_POLICY } from '../services/riskPolicy';
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

  const initialPolicy = agentEngine.getPolicy();
  const [strongThreshold, setStrongThreshold] = useState(String(initialPolicy.strongMatchThreshold));
  const [weakThreshold, setWeakThreshold] = useState(String(initialPolicy.weakMatchThreshold));
  const [unfamiliarMaxLev, setUnfamiliarMaxLev] = useState(String(initialPolicy.unfamiliarMaxLeverage));
  const [unfamiliarConfCap, setUnfamiliarConfCap] = useState(String(initialPolicy.unfamiliarConfidenceCap));

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
    const updated = agentEngine.setPolicy({
      strongMatchThreshold: Number(strongThreshold),
      weakMatchThreshold: Number(weakThreshold),
      unfamiliarMaxLeverage: Number(unfamiliarMaxLev),
      unfamiliarConfidenceCap: Number(unfamiliarConfCap)
    });
    setStrongThreshold(String(updated.strongMatchThreshold));
    setWeakThreshold(String(updated.weakMatchThreshold));
    setUnfamiliarMaxLev(String(updated.unfamiliarMaxLeverage));
    setUnfamiliarConfCap(String(updated.unfamiliarConfidenceCap));
    setStatus({ ok: true, text: 'Saved.' });
    onSaved();
    setTimeout(onClose, 900);
  };

  const resetPolicy = () => {
    const def = agentEngine.resetPolicy();
    setStrongThreshold(String(def.strongMatchThreshold));
    setWeakThreshold(String(def.weakMatchThreshold));
    setUnfamiliarMaxLev(String(def.unfamiliarMaxLeverage));
    setUnfamiliarConfCap(String(def.unfamiliarConfidenceCap));
    setStatus({ ok: true, text: 'Risk policy reset to defaults.' });
    onSaved();
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
            Network &amp; Risk Policy
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
            <span className="block text-meta text-fg-3">Without a key, checkpoints come from public Sui GraphQL.</span>
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

          <div className="space-y-3 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-2">Unfamiliar-Regime Fallback Policy</span>
              <button
                type="button"
                onClick={resetPolicy}
                className="text-xs text-fg-3 underline hover:text-fg cursor-pointer"
              >
                Reset ({DEFAULT_RISK_POLICY.unfamiliarMaxLeverage}x / {DEFAULT_RISK_POLICY.weakMatchThreshold})
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs text-fg-3">Strong match min (0–1)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.2"
                  max="0.98"
                  value={strongThreshold}
                  onChange={e => setStrongThreshold(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-fg-3">Weak match min (0–1)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="0.9"
                  value={weakThreshold}
                  onChange={e => setWeakThreshold(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-fg-3">Unseen max leverage (x)</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={unfamiliarMaxLev}
                  onChange={e => setUnfamiliarMaxLev(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-fg-3">Unseen confidence cap (%)</span>
                <input
                  type="number"
                  step="5"
                  min="20"
                  max="80"
                  value={unfamiliarConfCap}
                  onChange={e => setUnfamiliarConfCap(e.target.value)}
                  className={field}
                />
              </label>
            </div>
            <span className="block text-meta text-fg-3">
              Deterministic limits enforced when no Walrus recall passes the similarity threshold.
            </span>
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
