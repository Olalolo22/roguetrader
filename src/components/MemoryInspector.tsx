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
        setCommitSuccess(`Committed to Walrus! Blob: ${res.memory.blobId.slice(0, 16)}...`);
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
      {/* Top Banner */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-['Orbitron']">
              Walrus Epistemic Memory Explorer
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              {memories.length} Mainnet Blobs Verified
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Vector-indexed failure records stored on <strong className="text-cyan-300">relayer.memory.walrus.xyz</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-500">Namespace:</span>
          <span className="text-zinc-200 font-bold">roguetrader</span>
        </div>
      </div>

      {/* Search Bar & Suggestion Chips */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search Walrus Memory via semantic recall (e.g. 'liquidation borrow cascade')..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-black border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-colors shrink-0"
          >
            {isSearching ? 'Recalling...' : 'Run Recall'}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <span className="text-zinc-600 text-[10px] uppercase">Presets:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(q);
                handleSearch(q);
              }}
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-white/[0.06] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
        {['ALL', 'FAILURE_CASE', 'CATALYST', 'REGIME_SHIFT', 'ORACLE_OUTCOME'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
              activeCategory === cat
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'bg-[#08090d] text-zinc-400 border border-white/[0.06] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memory Blobs List: Linear High Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMemories.map(m => (
          <div
            key={m.id}
            className="p-3.5 rounded-xl border border-white/[0.08] bg-[#08090d] hover:border-white/[0.14] transition-all space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  m.category === 'FAILURE_CASE'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/20'
                    : m.category === 'CATALYST'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/20'
                    : m.category === 'REGIME_SHIFT'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-500/20'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/20'
                }`}
              >
                {m.category}
              </span>

              <span className="text-cyan-400 text-[10px] font-medium font-mono">
                Match: {(m.similarityScore * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{m.text}</p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" />
                {m.blobId.slice(0, 16)}...
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-600" />
                {new Date(m.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Write Memory Form */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Commit Live Calibration Incident to Walrus Relayer
          </h3>
        </div>

        <form onSubmit={handleAddMemory} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-3">
              <input
                type="text"
                value={newMemoryText}
                onChange={e => setNewMemoryText(e.target.value)}
                placeholder="E.g. SUI flash dip triggered by Scallop borrow rate reaching 82% at 14:00 UTC..."
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <select
                value={newMemoryCategory}
                onChange={e => setNewMemoryCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/[0.08] text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500"
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
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {commitSuccess}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-600 font-mono">
                Endpoint: POST /v1/remember on relayer.memory.walrus.xyz
              </span>
            )}

            <button
              type="submit"
              disabled={isCommitting || !newMemoryText.trim()}
              className="px-4 py-1.5 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all disabled:opacity-50"
            >
              {isCommitting ? 'Writing...' : 'Commit to Walrus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
