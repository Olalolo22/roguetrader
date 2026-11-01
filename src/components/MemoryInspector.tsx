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
    } catch {
      // Handled via UI fallback
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
        setCommitSuccess(`Committed to Walrus! Blob: ${res.memory.blobId.slice(0, 16)}...`);
        setNewMemoryText('');
      }
    } catch {
      // Handled via local state
    } finally {
      setIsCommitting(false);
    }
  };

  const filteredMemories = memories.filter(m => {
    if (activeCategory === 'ALL') return true;
    return m.category === activeCategory;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="cockpit-panel p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 corner-ticks">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-white font-['Orbitron']">
              Walrus Anchored Epistemic Memory Vault
            </h2>
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              {memories.length} Mainnet Blobs
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono leading-relaxed">
            Vector-indexed failure &amp; oracle resolution blobs stored on <strong className="text-cyan-300">relayer.memory.walrus.xyz</strong> via <code className="text-purple-300">@mysten-incubation/memwal</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#04070e] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono self-start sm:self-auto shrink-0">
          <span className="pulse-indicator bg-emerald-400"></span>
          <span className="text-slate-400">Namespace:</span>
          <span className="text-white font-bold">roguetrader</span>
        </div>
      </div>

      {/* Search Bar & Suggestion Chips */}
      <div className="cockpit-panel p-3.5 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Query Walrus Memory via semantic vector recall..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#03050a] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-mono text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            {isSearching ? 'Recalling...' : 'Run memwal.recall()'}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-slate-500 text-[10px] font-mono uppercase block">Semantic Presets:</span>
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-1.5 text-xs font-mono">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(q);
                  handleSearch(q);
                }}
                className="px-2.5 py-1.5 sm:py-1 rounded-lg bg-[#050811] hover:bg-slate-800 text-cyan-300 text-[11px] border border-slate-800 transition-colors cursor-pointer text-left sm:text-center truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
        {['ALL', 'FAILURE_CASE', 'CATALYST', 'REGIME_SHIFT', 'ORACLE_OUTCOME'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-[#060a12] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memory Blobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredMemories.map(m => (
          <div
            key={m.id}
            className="cockpit-panel p-3.5 sm:p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-mono flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  m.category === 'FAILURE_CASE'
                    ? 'bg-rose-950/90 text-rose-300 border border-rose-500/30'
                    : m.category === 'CATALYST'
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
                    : m.category === 'REGIME_SHIFT'
                    ? 'bg-purple-950/90 text-purple-300 border border-purple-500/30'
                    : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {m.category}
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-amber-300 text-[10px] font-mono bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  {m.weightImpact}
                </span>
                <span className="text-emerald-400 text-[10px] sm:text-[11px] font-bold font-mono">
                  {(m.similarityScore * 100).toFixed(0)}% Match
                </span>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-mono">{m.text}</p>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300 truncate">
                <Hash className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">walrus://{m.blobId.slice(0, 16)}...</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(m.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Write Memory Form */}
      <div className="cockpit-panel p-3.5 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-white font-['Orbitron']">
            Commit New Calibration Incident to Walrus Relayer (memwal.remember)
          </h3>
        </div>

        <form onSubmit={handleAddMemory} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="md:col-span-3">
              <input
                type="text"
                value={newMemoryText}
                onChange={e => setNewMemoryText(e.target.value)}
                placeholder="E.g. SUI flash wick triggered by Scallop borrow rate reaching 82%..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#03050a] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <select
                value={newMemoryCategory}
                onChange={e => setNewMemoryCategory(e.target.value as WalrusMemoryItem['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#03050a] border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="FAILURE_CASE">FAILURE_CASE</option>
                <option value="CATALYST">CATALYST</option>
                <option value="REGIME_SHIFT">REGIME_SHIFT</option>
                <option value="ORACLE_OUTCOME">ORACLE_OUTCOME</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {commitSuccess ? (
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="break-all">{commitSuccess}</span>
              </div>
            ) : (
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                Endpoint: <code className="text-cyan-300">POST https://relayer.memory.walrus.xyz/v1/remember</code>
              </span>
            )}

            <button
              type="submit"
              disabled={isCommitting || !newMemoryText.trim()}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCommitting ? 'Sealing Blob...' : 'Commit Blob to Walrus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
