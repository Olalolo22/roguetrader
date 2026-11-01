import { useState } from 'react';
import type React from 'react';
import { ArrowRight, CornerDownRight } from 'lucide-react';
import { agentEngine, MARKET_REGIMES } from '../services/agentEngine';
import type { EpistemicEvaluation, WalrusMemoryItem } from '../types';

const EXAMPLES = [
  'Long SUI 2.14, 3x',
  'Long CETUS on social spike, 5x',
  'Buy SUI Cetus discount at epoch boundary, 2x',
  'Long SUI breakout, 1x spot'
];

interface ParsedTrade {
  side: 'Long' | 'Short';
  asset: string;
  price: number | null;
  leverage: number;
  regimeId: string;
}

/** Map free text to the nearest stored regime. Keyword match for now; the recall itself goes to Walrus. */
function parseTrade(input: string): ParsedTrade {
  const t = input.toLowerCase();
  const levMatch = t.match(/(\d+(?:\.\d+)?)\s*x\b/);
  const leverage = levMatch ? Math.max(1, Math.min(50, Number(levMatch[1]))) : 1;
  const priceMatch = input.match(/(?:^|\s|\$)(\d+\.\d+)(?!\s*x)/i);
  const asset = (input.match(/\b(SUI|CETUS|NAVI|DEEP)\b/i)?.[1] ?? 'SUI').toUpperCase();
  const side = /\b(short|sell)\b/.test(t) ? 'Short' : 'Long';

  let regimeId = 'oct-navi-trap';
  if (/(social|hype|euphoria|meme|twitter|cetus\b)/.test(t) && !/discount/.test(t)) regimeId = 'meme-euphoria-trap';
  if (/(epoch|oracle|pyth|discount|arb)/.test(t)) regimeId = 'pyth-epoch-latency';
  if (/(spot|whale|institutional)/.test(t) && leverage <= 1) regimeId = 'cetus-institutional-breakout';

  return { side, asset, price: priceMatch ? Number(priceMatch[1]) : null, leverage, regimeId };
}

const roundHalf = (n: number) => Math.round(n * 2) / 2;
const shortHash = (h: string) => {
  const s = h.replace(/^0x/, '');
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-2)}` : s;
};
const isSeeded = (m: WalrusMemoryItem) => !m.id.startsWith('wal-') && !m.id.startsWith('relayer-');

interface Result {
  trade: ParsedTrade;
  evaluation: EpistemicEvaluation;
  outcomeLabel: string;
}

export const CheckTrade: React.FC = () => {
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (text: string) => {
    const value = text.trim();
    if (!value || stage) return;
    const trade = parseTrade(value);
    setResult(null);
    setStage('Reading Sui checkpoint');
    const evaluation = await agentEngine.runEvaluationCycle(trade.regimeId, (_s, step) => {
      setStage(['Reading Sui checkpoint', 'Sizing without memory', 'Recalling from Walrus', 'Scoring'][step - 1] ?? null);
    });
    const regime = MARKET_REGIMES.find(r => r.id === trade.regimeId)!;
    setResult({ trade, evaluation, outcomeLabel: regime.outcomeLabel });
    setStage(null);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero = product */}
      <section className="max-w-3xl pt-8 sm:pt-16">
        <h1 className="text-hero-sm font-medium tracking-tight text-fg sm:text-hero sm:tracking-tighter">
          Every rogue trader had the same problem. Nobody remembered the last blowup.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-fg-2">
          RogueTrader checks your trade against its memory on Walrus before you place it.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            run(input);
          }}
          className="mt-8 flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="trade" className="sr-only">
            Proposed trade
          </label>
          <input
            id="trade"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Long SUI 2.14, 3x"
            autoComplete="off"
            className="num h-12 min-w-0 flex-1 rounded-lg border border-line bg-card px-4 text-base text-fg placeholder:text-fg-3 transition-colors duration-150 ease-out focus:border-line-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || !!stage}
            className="btn-primary h-12 rounded-lg px-5 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.98] disabled:opacity-50"
          >
            {stage ? 'Checking…' : 'Check trade'}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="num h-10 rounded-lg border border-line px-3 text-meta text-fg-2 transition-colors duration-150 ease-out hover:border-line-2 hover:text-fg sm:h-8"
            >
              {ex}
            </button>
          ))}
        </div>

        <p className="num mt-4 text-meta text-fg-3">
          Built for directional &amp; swing sizing (~900 ms recall)—not sub-second HFT. Reads run pre-trade; slow Walrus writes (~20 s) run post-settlement so they never block execution.
        </p>
      </section>

      {/* Result */}
      <section aria-live="polite">
        {stage && <p className="num text-meta text-fg-3">{stage}…</p>}
        {!stage && !result && <EmptyState />}
        {result && <Comparison key={result.evaluation.id} {...result} />}
      </section>
    </div>
  );
};

const EmptyState = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {['Without memory', 'With Walrus memory'].map(t => (
      <div key={t} className="rounded-2xl border border-dashed border-line p-5">
        <p className="text-sm text-fg-3">{t}</p>
        <p className="mt-2 text-sm text-fg-3">Enter a trade to see how each would size it.</p>
      </div>
    ))}
  </div>
);

const Comparison: React.FC<Result> = ({ trade, evaluation: ev, outcomeLabel }) => {
  const beforeConf = ev.statelessConfidence;
  const afterConf = ev.walrusConfidence;
  // Size scales with confidence, never above what the trader asked for.
  const afterLev = Math.max(1, Math.min(trade.leverage, roundHalf(trade.leverage * (afterConf / beforeConf))));
  const liq = (lev: number) => (lev <= 1 ? 'none' : `${(100 / lev).toFixed(1)}%`);
  const intercepted = afterConf < beforeConf;
  const m = ev.recalledMemory;
  const tradeLabel = `${trade.side} ${trade.asset}${trade.price ? ` ${trade.price}` : ''}, ${trade.leverage}x`;

  const rows = [
    { label: 'Confidence', before: `${beforeConf}%`, after: `${afterConf}%`, delta: afterConf - beforeConf, unit: ' pts' },
    { label: 'Leverage', before: `${trade.leverage}x`, after: `${afterLev}x`, delta: afterLev - trade.leverage, unit: 'x' },
    { label: 'Distance to liquidation', before: liq(trade.leverage), after: liq(afterLev), delta: null, unit: '' }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {/* Without memory */}
      <div className="rise rounded-2xl border border-line bg-card p-5 md:col-span-2">
        <p className="text-sm text-fg-3">Without memory</p>
        <p className="num mt-3 text-xl text-fg">{tradeLabel}</p>
        <dl className="mt-5 space-y-3">
          {rows.map(r => (
            <div key={r.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-fg-2">{r.label}</dt>
              <dd className="num text-sm text-fg">{r.before}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 border-t border-line pt-4 text-sm text-fg-3">
          Sizes on the current tick only. Nothing about last time.
        </p>
      </div>

      {/* With memory — the intercept card */}
      <div className="rise rounded-2xl border border-line-2 bg-card p-5 [animation-delay:60ms] md:col-span-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg-3">With Walrus memory</p>
          <p className="text-sm text-fg-2">{intercepted ? 'Intercepted' : 'Cleared'}</p>
        </div>
        <p className="num mt-3 text-xl text-fg">
          {trade.side} {trade.asset}
          {trade.price ? ` ${trade.price}` : ''}, {afterLev}x
        </p>

        <dl className="mt-5 space-y-3">
          {rows.map(r => (
            <div key={r.label} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 sm:grid-cols-[1fr_auto_auto]">
              <dt className="text-sm text-fg-2">{r.label}</dt>
              <dd className="num flex items-center gap-2 text-sm">
                <span className="text-fg-3 line-through decoration-fg-3/60">{r.before}</span>
                <ArrowRight size={12} strokeWidth={1.5} className="text-fg-3" aria-hidden />
                <span className="text-fg">{r.after}</span>
              </dd>
              <dd
                className={`num col-span-2 text-right text-meta sm:col-span-1 sm:w-16 ${
                  r.delta === null || r.delta === 0 ? 'text-fg-3' : r.delta < 0 ? 'text-neg' : 'text-pos'
                }`}
              >
                {r.delta === null ? '' : r.delta === 0 ? 'same' : `${r.delta > 0 ? '+' : ''}${r.delta}${r.unit}`}
              </dd>
            </div>
          ))}
        </dl>

        {/* Receipt of the recalled memory */}
        <div className="mt-5 rounded-xl border border-line bg-deep p-4">
          <div className="flex items-start gap-2">
            <CornerDownRight size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-fg-3" aria-hidden />
            <p className="text-sm text-fg-2">{m.text}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 pl-6">
            <span className="keycap">
              <span>blob</span>
              {shortHash(m.blobId)}
            </span>
            {m.tatumCheckpoint && (
              <span className="keycap">
                <span>ckpt</span>
                {m.tatumCheckpoint.toLocaleString('en-US')}
              </span>
            )}
            <span className="num text-meta text-fg-3">
              {Math.round(m.similarityScore * 100)}% match · {ev.recallLatencyMs} ms
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1 border-t border-line pt-3 pl-6 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-sm text-fg-2">
              Last time: <span className={/-\d/.test(outcomeLabel) ? 'num text-neg' : 'num text-pos'}>{outcomeLabel}</span>
            </p>
            {isSeeded(m) && <span className="num shrink-0 text-meta text-fg-3">seeded from backtest</span>}
          </div>
        </div>

        <p className="num mt-4 text-meta text-fg-3">
          Brier on that outcome {ev.statelessBrierPenalty.toFixed(3)} → {ev.walrusBrierPenalty.toFixed(3)} · lower is better
        </p>
      </div>
    </div>
  );
};
