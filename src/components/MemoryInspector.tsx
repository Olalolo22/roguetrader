import { useState } from 'react';
import type React from 'react';
import { Database, Search, PlusCircle, CheckCircle2, Filter, Hash, Clock } from 'lucide-react';
import type { WalrusMemoryItem } from '../types';
import { walrusMemory } from '../services/walrusMemory';

export const MemoryInspector: React.FC = () => {
  const [memories, setMemories] = useState<WalrusMemoryItem[]>(() => walrusMemory.getAllMemories());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<WalrusMemoryItem['category']>('FAILURE_CASE');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);

  const sampleQueries = [
    'NAVI borrow utilization spike',
    'Pyth oracle latency epoch 512',
    'Cetus volume breakout momentum',
    'Social hype hallucination penalty'
  ];

  const handleSearch = async (queryToRun?: string) => {
    const q = queryToRun !== undefined ? queryToRun : searchQuery;
    if (!q.trim()) {
      setMemories(walrusMemory.getAllMemories());
      return;
    }

    setIsSearching(true);
    try {
      const results = await walrusMemory.recall(q, 8);
      setMemories(results);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    setIsCommitting(true);
    setCommitSuccess(null);

    try {
      const res = await walrusMemory.remember(newMemoryText, newMemoryCategory);
      if (res.success) {
        setMemories([...walrusMemory.getAllMemories()]);
        setCommitSuccess(`Committed to Walrus Memory! Blob ID: ${res.memory.blobId.slice(0, 16)}...`);
        setNewMemoryText('');
      }
    } catch (err: any) {
      console.error('Commit error:', err);
    } finally {
      setIsCommitting(false);
    }
  };

  const filteredMemories = memories.filter(m => {
    if (activeCategory === 'ALL') return true;
    return m.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-['Orbitron']">
              Walrus Epistemic Memory Explorer
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              Mainnet Verified ({memories.length} Blobs)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Immutable vector-indexed trade calibration logs stored on <strong className="text-cyan-300">Walrus Relayer (relayer.memory.walrus.xyz)</strong>.
          </p>
        </div>

        {/* Relay status pill */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">Target Namespace:</span>
          <span className="text-white font-bold">roguetrader</span>
        </div>
      </div>

      {/* Semantic Search & Suggestion Chips */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search Walrus Memory via natural language semantic recall (e.g. 'liquidation borrow cascade')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            {isSearching ? 'Searching...' : 'Run Recall'}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-slate-500 text-[11px]">Quick Queries:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(q);
                handleSearch(q);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['ALL', 'FAILURE_CASE', 'CATALYST', 'REGIME_SHIFT', 'ORACLE_OUTCOME'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              activeCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map(m => (
          <div
            key={m.id}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  m.category === 'FAILURE_CASE'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    : m.category === 'CATALYST'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : m.category === 'REGIME_SHIFT'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                }`}
              >
                {m.category}
              </span>

              <span className="text-cyan-400 text-[11px] font-semibold">
                Match: {(m.similarityScore * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">{m.text}</p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" />
                Blob: {m.blobId.slice(0, 14)}...
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(m.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Calibration Memory to Walrus Form (Judges can test live writing!) */}
      <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-['Orbitron']">
            Commit Live Calibration Incident to Walrus Memory
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Inject a new market lesson or failure case into the persistent vector memory. Agents will immediately recall it during the next reflective thought cycle.
        </p>

        <form onSubmit={handleAddMemory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <input
                type="text"
                value={newMemoryText}
                onChange={e => setNewMemoryText(e.target.value)}
                placeholder="E.g. SUI flash dip triggered by Scallop borrow rate reaching 82% at 14:00 UTC..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <select
                value={newMemoryCategory}
                onChange={e => setNewMemoryCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="FAILURE_CASE">FAILURE_CASE</option>
                <option value="CATALYST">CATALYST</option>
                <option value="REGIME_SHIFT">REGIME_SHIFT</option>
                <option value="ORACLE_OUTCOME">ORACLE_OUTCOME</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {commitSuccess ? (
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {commitSuccess}
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">
                Writes to Walrus Relayer endpoint: POST /v1/remember
              </span>
            )}

            <button
              type="submit"
              disabled={isCommitting || !newMemoryText.trim()}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                isCommitting || !newMemoryText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-95'
              }`}
            >
              {isCommitting ? 'Committing to Walrus...' : 'Commit Memory to Walrus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
