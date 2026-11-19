import { useState } from 'react';
import type React from 'react';
import { Search } from 'lucide-react';
import type { MemoryOrigin, RecallMatchQuality, WalrusMemoryItem } from '../types';
import { agentEngine } from '../services/agentEngine';
import { walrusMemory } from '../services/walrusMemory';

const CATEGORIES: { id: 'ALL' | WalrusMemoryItem['category']; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'FAILURE_CASE', label: 'Failures' },
  { id: 'REGIME_SHIFT', label: 'Regime shifts' },
  { id: 'CATALYST', label: 'Catalysts' },
  { id: 'ORACLE_OUTCOME', label: 'Oracle outcomes' }
];

const ORIGINS: { id: 'ALL' | MemoryOrigin; label: string }[] = [
  { id: 'ALL', label: 'All sources' },
  { id: 'LIVE_OUTCOME', label: 'Live outcomes' },
  { id: 'HISTORICAL_BENCHMARK', label: 'Historical benchmarks' }
];

const categoryLabel = (c: WalrusMemoryItem['category']) =>
  ({ FAILURE_CASE: 'Failure', REGIME_SHIFT: 'Regime shift', CATALYST: 'Catalyst', ORACLE_OUTCOME: 'Oracle outcome' })[c];

const shortHash = (h: string) => {
  const s = h.replace(/^0x/, '');
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-2)}` : s;
};

export const MemoryInspector: React.FC = () => {
  const [memories, setMemories] = useState<WalrusMemoryItem[]>(() => walrusMemory.getAllMemories());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('ALL');
  const [originFilter, setOriginFilter] = useState<(typeof ORIGINS)[number]['id']>('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{
    active: boolean;
    matchQuality: RecallMatchQuality;
    topSimilarity: number;
    thresholdPct: number;
  }>({ active: false, matchQuality: 'STRONG_MATCH', topSimilarity: 1, thresholdPct: 45 });
  const [text, setText] = useState('');
  const [newCategory, setNewCategory] = useState<WalrusMemoryItem['category']>('FAILURE_CASE');
  const [isCommitting, setIsCommitting] = useState(false);
  const [committed, setCommitted] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const policy = agentEngine.getPolicy();
    const thresholdPct = Math.round(policy.weakMatchThreshold * 100);
    if (!query.trim()) {
      setMemories([...walrusMemory.getAllMemories()]);
      setSearchMeta({ active: false, matchQuality: 'STRONG_MATCH', topSimilarity: 1, thresholdPct });
      return;
    }
    setIsSearching(true);
    try {
      const res = await walrusMemory.recall(query, 8, policy);
      setMemories(res.results);
      setSearchMeta({
        active: true,
        matchQuality: res.matchQuality,
        topSimilarity: res.topSimilarity,
        thresholdPct
      });
    } finally {
      setIsSearching(false);
    }
  };

  const commit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsCommitting(true);
    setCommitted(null);
    try {
      const res = await walrusMemory.remember(text, newCategory, undefined, { origin: 'LIVE_OUTCOME' });
      if (res.success) {
        setMemories([...walrusMemory.getAllMemories()]);
        setSearchMeta({
          active: false,
          matchQuality: 'STRONG_MATCH',
          topSimilarity: 1,
          thresholdPct: Math.round(agentEngine.getPolicy().weakMatchThreshold * 100)
        });
        setCommitted(res.memory.blobId);
        setText('');
      }
    } finally {
      setIsCommitting(false);
    }
  };

  const shown = memories.filter(m => {
    const matchesCategory = category === 'ALL' || m.category === category;
    const itemOrigin: MemoryOrigin = m.origin ?? 'HISTORICAL_BENCHMARK';
    const matchesOrigin = originFilter === 'ALL' || itemOrigin === originFilter;
    return matchesCategory && matchesOrigin;
  });
  const stats = walrusMemory.getMemoryStats();
  const live = walrusMemory.isConfigured();

  return (
    <div className="space-y-8 pt-8 sm:pt-12">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-fg">Past Blowups &amp; Setups</h1>
        <p className="mt-2 max-w-xl text-base text-fg-2">
          Every past trap and real resolved outcome stored on Walrus. RogueTrader strictly tags live outcomes separately from historical benchmark seeds.
        </p>
        <p className="num mt-2 text-meta text-fg-3">
          {live ? 'Live on Walrus Mainnet (Account 0xf7bb…e223)' : 'Walrus Mainnet Vault (Account 0xf7bb…e223)'} ·{' '}
          <span className="text-pos">{stats.liveOutcomeCount} live outcome{stats.liveOutcomeCount === 1 ? '' : 's'}</span> ·{' '}
          {stats.benchmarkCount} historical benchmarks
        </p>
      </div>

      <div className="space-y-3">
        <form onSubmit={search} className="relative">
          <Search size={16} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-3" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search memory, e.g. borrow utilization spike"
            className="h-11 w-full rounded-lg border border-line bg-card pr-24 pl-9 text-sm text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-1 h-9 -translate-y-1/2 rounded-md bg-raised px-3 text-sm text-fg transition-colors duration-150 ease-out hover:bg-line-2"
          >
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`h-9 shrink-0 cursor-pointer rounded-lg px-3 text-sm transition-colors duration-150 ease-out sm:h-8 ${
                  category === c.id ? 'active-surface text-fg' : 'text-fg-2 hover:text-fg'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg border border-line bg-deep p-0.5 text-xs">
            {ORIGINS.map(o => (
              <button
                key={o.id}
                onClick={() => setOriginFilter(o.id)}
                className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                  originFilter === o.id ? 'bg-raised font-medium text-fg' : 'text-fg-3 hover:text-fg-2'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {shown.length === 0 && (
          <li className="p-5 text-sm text-fg-3">
            {searchMeta.active && searchMeta.matchQuality === 'UNFAMILIAR_REGIME'
              ? `No memories meet the ${searchMeta.thresholdPct}% relevance threshold (closest match: ${Math.round(
                  searchMeta.topSimilarity * 100
                )}%). Pre-trade checks for this setup fall back to the conservative baseline cap.`
              : originFilter === 'LIVE_OUTCOME'
                ? 'No live trade outcomes recorded yet. Run a check on the Check trade tab and log a real outcome in Step 4.'
                : 'No memories match.'}
          </li>
        )}
        {shown.map(m => {
          const isLiveOrigin = m.origin === 'LIVE_OUTCOME';
          return (
            <li key={m.id} className="grid gap-3 p-4 sm:grid-cols-[9rem_1fr_auto] sm:gap-6 sm:p-5">
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <p className="text-sm text-fg">{categoryLabel(m.category)}</p>
                <span
                  className={`mt-1 inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                    isLiveOrigin
                      ? 'border-pos/35 bg-pos/10 text-pos'
                      : 'border-line bg-raised text-fg-3'
                  }`}
                >
                  {isLiveOrigin ? 'Live outcome' : 'Benchmark'}
                </span>
                <p className="num text-meta text-fg-3 sm:mt-1">
                  {new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <p className="text-sm text-fg-2">{m.text}</p>
              <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                {searchMeta.active && (
                  <span className="keycap">
                    <span>match</span>
                    {Math.round(m.similarityScore * 100)}%
                  </span>
                )}
                <span className="keycap">
                  <span>walrus</span>
                  {shortHash(m.blobId)}
                </span>
                {m.tatumCheckpoint && (
                  <span className="keycap">
                    <span>block</span>
                    #{m.tatumCheckpoint.toLocaleString('en-US')}
                  </span>
                )}
                <span className={`num text-meta ${m.weightImpact.startsWith('-') ? 'text-neg' : 'text-pos'}`}>
                  {m.weightImpact.replace(' Confidence', ' confidence')}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <form onSubmit={commit} className="rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-medium text-fg">Save or Edit a Trade Snapshot on Walrus</h2>
          <span className="keycap text-xs">
            <span className="live-dot" aria-hidden /> Tatum Wallet Monitor · 0xaff0…4b4d
          </span>
        </div>
        <p className="mt-1 text-sm text-fg-3">
          Tatum indexes settled wallet trades automatically. You can also annotate or save a custom market-state lesson directly to Walrus (~20s settlement).
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="SUI wick when Scallop borrow rate hit 82%"
            className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-deep px-3 text-sm text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as WalrusMemoryItem['category'])}
            className="h-11 rounded-lg border border-line bg-deep px-3 text-sm text-fg focus:outline-none"
          >
            {CATEGORIES.filter(c => c.id !== 'ALL').map(c => (
              <option key={c.id} value={c.id}>
                {categoryLabel(c.id as WalrusMemoryItem['category'])}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isCommitting || !text.trim()}
            className="btn-primary h-11 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-out disabled:opacity-50"
          >
            {isCommitting ? 'Saving…' : 'Save to Walrus'}
          </button>
        </div>
        {committed && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-fg-2">
            Saved on Walrus
            <span className="keycap">
              <span>walrus</span>
              {shortHash(committed)}
            </span>
          </p>
        )}
      </form>
    </div>
  );
};
