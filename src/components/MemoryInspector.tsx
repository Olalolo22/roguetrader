import { useState } from 'react';
import type React from 'react';
import { Search } from 'lucide-react';
import type { WalrusMemoryItem } from '../types';
import { walrusMemory } from '../services/walrusMemory';

const CATEGORIES: { id: 'ALL' | WalrusMemoryItem['category']; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'FAILURE_CASE', label: 'Failures' },
  { id: 'REGIME_SHIFT', label: 'Regime shifts' },
  { id: 'CATALYST', label: 'Catalysts' },
  { id: 'ORACLE_OUTCOME', label: 'Oracle outcomes' }
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
  const [isSearching, setIsSearching] = useState(false);
  const [text, setText] = useState('');
  const [newCategory, setNewCategory] = useState<WalrusMemoryItem['category']>('FAILURE_CASE');
  const [isCommitting, setIsCommitting] = useState(false);
  const [committed, setCommitted] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setMemories([...walrusMemory.getAllMemories()]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await walrusMemory.recall(query, 8);
      setMemories(res.results);
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
      const res = await walrusMemory.remember(text, newCategory);
      if (res.success) {
        setMemories([...walrusMemory.getAllMemories()]);
        setCommitted(res.memory.blobId);
        setText('');
      }
    } finally {
      setIsCommitting(false);
    }
  };

  const shown = memories.filter(m => category === 'ALL' || m.category === category);
  const live = walrusMemory.isConfigured();

  return (
    <div className="space-y-8 pt-8 sm:pt-12">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-fg">Past Blowups &amp; Setups</h1>
        <p className="mt-2 max-w-xl text-base text-fg-2">
          Every past trap and market lesson stored on Walrus. RogueTrader searches this vault before sizing your trade.
        </p>
        <p className="num mt-2 text-meta text-fg-3">
          {live ? 'Live on Walrus Mainnet' : 'Seeded from historical Sui backtest'} · {memories.length} past setups
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
            {isSearching ? 'Recalling…' : 'Recall'}
          </button>
        </form>
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`h-10 shrink-0 rounded-lg px-3 text-sm transition-colors duration-150 ease-out sm:h-8 ${
                category === c.id ? 'active-surface text-fg' : 'text-fg-2 hover:text-fg'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {shown.length === 0 && <li className="p-5 text-sm text-fg-3">No memories match.</li>}
        {shown.map(m => (
          <li key={m.id} className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr_auto] sm:gap-6 sm:p-5">
            <div className="flex items-baseline justify-between gap-3 sm:block">
              <p className="text-sm text-fg">{categoryLabel(m.category)}</p>
              <p className="num text-meta text-fg-3 sm:mt-1">
                {new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <p className="text-sm text-fg-2">{m.text}</p>
            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
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
        ))}
      </ul>

      <form onSubmit={commit} className="rounded-2xl border border-line bg-card p-5">
        <h2 className="text-base font-medium text-fg">Remember a setup</h2>
        <p className="mt-1 text-sm text-fg-3">Writes through memwal.remember. Walrus writes settle in roughly 20 seconds.</p>
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
            {isCommitting ? 'Writing…' : 'Remember'}
          </button>
        </div>
        {committed && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-fg-2">
            Stored
            <span className="keycap">
              <span>blob</span>
              {shortHash(committed)}
            </span>
          </p>
        )}
      </form>
    </div>
  );
};
