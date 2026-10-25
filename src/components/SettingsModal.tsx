import { useState } from 'react';
import type React from 'react';
import { X, Settings, Database, Cpu, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { tatumSui } from '../services/tatumSui';
import { walrusMemory } from '../services/walrusMemory';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  if (!isOpen) return null;

  const [tatumKey, setTatumKey] = useState(tatumSui.getApiKey());
  const [walrusAccount, setWalrusAccount] = useState('');
  const [walrusKey, setWalrusKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    tatumSui.setApiKey(tatumKey);

    if (walrusAccount && walrusKey) {
      const res = await walrusMemory.configureMemWal(walrusAccount, walrusKey);
      if (!res.success) {
        setStatusMessage({ type: 'error', text: `Walrus SDK init error: ${res.error}` });
        return;
      }
    }

    setStatusMessage({ type: 'success', text: 'Settings saved! Active RPC endpoints updated.' });
    onSaved();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);

    try {
      // Test Walrus health
      const walrusHealth = await walrusMemory.getHealth();
      // Test Tatum checkpoint
      const checkpoint = await tatumSui.getLatestCheckpoint();

      setStatusMessage({
        type: 'success',
        text: `Connections verified! Walrus Relayer: ${walrusHealth.relayer} (ONLINE), Tatum Sui Checkpoint: #${checkpoint.toLocaleString()}`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Connection test issue: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#08090d] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs sm:text-sm font-['Orbitron']">
              Network & API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Tatum API Key Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Tatum Gateway API Key (Optional)
              </span>
              <span className="text-[10px] text-slate-500">sui-mainnet.gateway.tatum.io</span>
            </label>
            <input
              type="text"
              value={tatumKey}
              onChange={e => setTatumKey(e.target.value)}
              placeholder="Leave blank for public Sui node fallback, or enter Tatum key..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-500">
              Header: <code className="text-purple-300 font-mono">x-api-key: [YOUR_KEY]</code> for authenticated Tatum Sui Mainnet RPC.
            </p>
          </div>

          {/* Walrus Memory Relayer Configuration */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Walrus Memory Delegate Key
              </span>
              <span className="text-[10px] text-cyan-400">relayer.memory.walrus.xyz</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={walrusAccount}
                onChange={e => setWalrusAccount(e.target.value)}
                placeholder="Walrus Account ID (e.g. 0x...)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <input
                type="password"
                value={walrusKey}
                onChange={e => setWalrusKey(e.target.value)}
                placeholder="Ed25519 64-char Hex Private Key (Optional for live write)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              RogueTrader includes 12+ pre-indexed Mainnet calibration memories that work out of the box!
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Gateway Health'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
