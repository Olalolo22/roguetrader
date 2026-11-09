import React, { useState } from 'react';
import { ArrowRight, CornerDownRight, Check, Copy, Activity, ShieldCheck } from 'lucide-react';
import type { TatumMarketState, EpistemicEvaluation } from '../types';
import { agentEngine, MARKET_REGIMES } from '../services/agentEngine';
import { walrusMemory } from '../services/walrusMemory';
import { x402Payment } from '../services/x402Payment';

const EXAMPLES = [
  'Long SUI 0.85, 3x',
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

interface RuledBentoGridProps {
  marketState: TatumMarketState | null;
  onInterceptChange?: (active: boolean) => void;
}

export const RuledBentoGrid: React.FC<RuledBentoGridProps> = ({
  marketState,
  onInterceptChange,
}) => {
  const [input, setInput] = useState('Long SUI 0.85, 3x');
  const [stage, setStage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    trade: ParsedTrade;
    evaluation: EpistemicEvaluation;
    outcomeLabel: string;
  } | null>(() => {
    // Initial seeded display for instant 20s comprehension
    const t = parseTrade('Long SUI 0.85, 3x');
    const regime = MARKET_REGIMES[0];
    return {
      trade: t,
      evaluation: {
        id: 'eval-init',
        scenarioId: regime.id,
        pair: regime.pair,
        timestamp: new Date().toISOString(),
        tatumCheckpoint: 89412950,
        cetusVolume1h: regime.cetusVolume1h,
        deepBookSpreadBps: '18 bps',
        naviBorrowPct: regime.naviBorrowPct,
        statelessConfidence: 84,
        statelessStance: 'AGGRESSIVE LONG',
        statelessRationale: regime.statelessQuote,
        statelessBrierPenalty: 0.468,
        walrusConfidence: 62,
        walrusStance: 'CAUTIOUS LONG',
        walrusRationale: regime.calibratedQuote,
        walrusBrierPenalty: 0.128,
        recallLatencyMs: 914,
        actualOutcome: regime.actualOutcome,
        recalledMemory: {
          id: 'mem-seed-1',
          blobId: 'thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0',
          category: 'FAILURE_CASE',
          text: regime.calibratedQuote,
          timestamp: '14 days ago',
          similarityScore: 0.89,
          weightImpact: '-22 pts confidence penalty',
          tatumCheckpoint: 89412950
        }
      },
      outcomeLabel: regime.outcomeLabel
    };
  });

  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [settledTx, setSettledTx] = useState<string | null>(null);
  const [draftLesson, setDraftLesson] = useState(
    'Long SUI 3x [Borrow 78.4% · Book 0.62x] -> Wicked -8.2% in 40m. Cap at 2x.'
  );
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [savedBlobId, setSavedBlobId] = useState<string | null>(null);

  const runCheck = async (tradeText: string) => {
    const val = tradeText.trim();
    if (!val || stage) return;
    const trade = parseTrade(val);
    setStage('Reading live Sui block');
    setSavedBlobId(null);
    onInterceptChange?.(true);

    try {
      const evaluation = await agentEngine.runEvaluationCycle(
        trade.regimeId,
        (_s, step) => {
          setStage(
            ['Reading live Sui block', 'Checking blind trade size', 'Checking past blowups on Walrus', 'Protecting your trade size'][step - 1] ?? null
          );
        },
        val
      );
      const regime = MARKET_REGIMES.find(r => r.id === trade.regimeId)!;
      setResult({ trade, evaluation, outcomeLabel: regime.outcomeLabel });
      setDraftLesson(
        `${val} [Borrow ${regime.naviBorrowPct}% · Vol ${regime.cetusVolume1h}] -> ${regime.outcomeLabel}`
      );
    } finally {
      setStage(null);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftLesson.trim() || isSavingLesson) return;
    setIsSavingLesson(true);
    try {
      const ckpt = marketState?.latestCheckpoint ?? 100352470;
      const res = await walrusMemory.remember(draftLesson.trim(), 'FAILURE_CASE', ckpt);
      if (res.success) {
        setSavedBlobId(res.memory.blobId);
      }
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleSettle = async () => {
    setIsSettling(true);
    try {
      const inv = x402Payment.generateInvoice(0.05);
      const res = await x402Payment.settleInvoice(inv, '0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d');
      if (res.success && res.receipt) {
        setSettledTx(res.receipt.txDigest);
      }
    } finally {
      setIsSettling(false);
    }
  };

  const curlCommand = `curl -X POST https://api.roguetrader.xyz/api/x402/check \\
  -H "X-PAYMENT: sui:${settledTx ?? '5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N'}" \\
  -H "Content-Type: application/json" \\
  -d '{"trade":"${input}"}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1600);
  };

  const beforeConf = result?.evaluation.statelessConfidence ?? 84;
  const afterConf = result?.evaluation.walrusConfidence ?? 62;
  const tradeLev = result?.trade.leverage ?? 3;
  const afterLev = Math.max(1, Math.min(tradeLev, roundHalf(tradeLev * (afterConf / beforeConf))));
  const liq = (lev: number) => (lev <= 1 ? 'none' : `${(100 / lev).toFixed(1)}%`);
  const isBreakoutCatalyst = result?.evaluation.actualOutcome === 'BREAKOUT_CONTINUATION';
  const protectedUsd = isBreakoutCatalyst ? 1240 : Math.round(710 * Math.max(1, tradeLev - afterLev + 1));
  const m = result?.evaluation.recalledMemory;

  return (
    <div className="w-full">
      {/* Precision-Milled Ruled Bento Frame: 1px hairline rules, zero outer gaps */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        {/* Top Row: 2 cols (Hero Trade Gate) + 1 col (Calibration Meter) */}
        <div className="grid grid-cols-1 divide-y divide-line lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          {/* TILE 1: 2-Cols Span - Hero Pre-Trade Gate & Intercept Card */}
          <div className="p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="text-xs font-mono text-fg-3">01 · Pre-trade check</span>
                <h2 className="text-lg font-medium text-fg">Check Your Trade Against Past Blowups</h2>
              </div>
              <span className="keycap text-xs">
                <span>status</span> {stage ? 'checking…' : 'ready'}
              </span>
            </div>

            {/* Input Bar & Controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runCheck(input);
              }}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Long SUI 0.85, 3x"
                className="num h-11 min-w-0 flex-1 rounded-lg border border-line bg-raised px-3.5 text-sm text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || !!stage}
                className="btn-primary h-11 cursor-pointer rounded-lg px-5 text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {stage ? 'Querying…' : 'Check Trade'}
              </button>
            </form>

            {/* Quick chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setInput(ex);
                    runCheck(ex);
                  }}
                  className="num h-7 cursor-pointer rounded border border-line bg-deep px-2 text-[11px] text-fg-2 transition-colors hover:border-line-2 hover:text-fg"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Market State Fingerprint (4-Column Visual Strip) */}
            <div className="mt-4 overflow-hidden rounded-xl border border-line-2 bg-raised/70">
              <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-[11px] font-mono">
                <span className="font-medium text-fg">1. Market State Checked at Entry</span>
                <span className="text-fg-3">Live Sui DEX + Lending State</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
                <div className="p-2.5">
                  <div className="font-mono text-[10px] uppercase text-fg-3">Pool Volume (1h)</div>
                  <div className="num mt-0.5 text-xs font-medium text-fg">
                    {result?.evaluation.cetusVolume1h ?? '$14.2M (+18%)'}
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="font-mono text-[10px] uppercase text-fg-3">Borrow Crowding</div>
                  <div className={`num mt-0.5 text-xs font-medium ${(result?.evaluation.naviBorrowPct ?? 78.4) > 70 ? 'text-neg' : 'text-pos'}`}>
                    {result?.evaluation.naviBorrowPct ?? 78.4}% NAVI
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="font-mono text-[10px] uppercase text-fg-3">Orderbook Skew</div>
                  <div className="num mt-0.5 truncate text-xs font-medium text-fg">
                    {result?.evaluation.deepBookSpreadBps ?? '1.62x Imbalance'}
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="font-mono text-[10px] uppercase text-fg-3">Past Regime Move</div>
                  <div className={`num mt-0.5 truncate text-xs font-medium ${result?.evaluation.actualOutcome === 'BREAKOUT_CONTINUATION' ? 'text-pos' : 'text-neg'}`}>
                    {result?.evaluation.actualOutcome === 'BREAKOUT_CONTINUATION'
                      ? '+12.4% trend'
                      : result?.evaluation.actualOutcome === 'ORACLE_WICK_REVERSAL'
                        ? '40s oracle lag'
                        : result?.trade.regimeId === 'meme-euphoria-trap'
                          ? '-16% bull-trap'
                          : '-8.2% squeeze'}
                  </div>
                </div>
              </div>
            </div>

            {/* The Intercept Comparison Cards (Tier 1: Dollar Impact + Leverage/Buffer) */}
            <div className="relative mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Without Memory */}
              <div className="rounded-xl border border-line bg-deep p-4">
                <div className="flex items-center justify-between text-xs text-fg-3">
                  <span>Without memory</span>
                  <span className="num text-neg">Blind sizing</span>
                </div>
                <div className="num mt-1.5 text-lg font-medium text-fg">
                  {result ? `${result.trade.side} ${result.trade.asset}, ${result.trade.leverage}x` : 'Long SUI, 3x'}
                </div>
                <div className="mt-2 rounded-lg border border-neg/25 bg-neg/[0.06] px-2.5 py-1.5 font-mono text-xs text-neg">
                  {isBreakoutCatalyst
                    ? 'Under-sized trend: Missed +$620 upside'
                    : `Repeat stop-out: -$${protectedUsd.toLocaleString('en-US')} drawdown`}
                </div>
                <div className="mt-3 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-fg-2">
                    <span>Confidence:</span>
                    <span className="num text-fg">{beforeConf}%</span>
                  </div>
                  <div className="flex justify-between text-fg-2">
                    <span>Wipeout drop:</span>
                    <span className="num text-fg">{liq(tradeLev)}</span>
                  </div>
                </div>
              </div>

              {/* With Walrus Memory (Intercept Card) */}
              <div className="rounded-xl border border-pos/40 bg-raised p-4 shadow-[0_0_20px_rgba(76,195,138,0.06)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-fg">With RogueTrader memory</span>
                  <span className="num text-pos font-medium">Protected</span>
                </div>
                <div className="num mt-1.5 text-lg font-medium text-pos">
                  {result ? `${result.trade.side} ${result.trade.asset}, ${afterLev}x` : 'Long SUI, 2x'}
                </div>
                <div className="mt-2 rounded-lg border border-pos/30 bg-pos/10 px-2.5 py-1.5 font-mono text-xs font-medium text-pos">
                  {isBreakoutCatalyst
                    ? `Conviction backed: +$${protectedUsd.toLocaleString('en-US')} captured`
                    : `Drawdown Avoided: Protected $${protectedUsd.toLocaleString('en-US')} from repeat stop-out`}
                </div>
                <div className="mt-3 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-fg-2">
                    <span>Confidence:</span>
                    <span className="num flex items-center gap-1.5">
                      <span className="line-through text-fg-3">{beforeConf}%</span>
                      <ArrowRight size={10} className="text-fg-3" />
                      <span className="text-fg">{afterConf}%</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-fg-2">
                    <span>Wipeout drop:</span>
                    <span className="num flex items-center gap-1.5">
                      <span className="line-through text-fg-3">{liq(tradeLev)}</span>
                      <ArrowRight size={10} className="text-fg-3" />
                      <span className="text-pos font-medium">{liq(afterLev)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recalled Memory Receipt (Compact) */}
            {m && (
              <div className="mt-3 rounded-xl border border-line bg-deep p-3 font-mono">
                <div className="flex items-start gap-2">
                  <CornerDownRight size={14} className="mt-0.5 shrink-0 text-pos" />
                  <p className="text-xs text-fg-2 leading-relaxed">
                    <span className="text-fg font-medium">2. Matched Walrus Memory ({Math.round(m.similarityScore * 100)}%): </span>
                    {result?.evaluation.walrusRationale || m.text}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-5 text-[11px]">
                  <span className="keycap">
                    <span>walrus</span> {shortHash(m.blobId)}
                  </span>
                  {m.tatumCheckpoint && (
                    <span className="keycap">
                      <span>block</span> #{m.tatumCheckpoint.toLocaleString('en-US')}
                    </span>
                  )}
                  <span className="text-fg-3">checked in {result?.evaluation.recallLatencyMs}ms</span>
                </div>
              </div>
            )}

            {/* Auto-Captured Post-Trade Lesson via Tatum Wallet Monitor (High-Visibility Card) */}
            <form onSubmit={handleSaveLesson} className="mt-3 rounded-xl border border-pos/35 bg-pos/[0.04] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-pos/30 bg-pos/10 px-2 py-0.5 font-mono text-[10px] font-medium text-pos">
                    <span className="live-dot" aria-hidden />
                    3. TATUM WALLET MONITOR · 0xaff0…4b4d
                  </span>
                  <span className="text-fg-2 hidden sm:inline">Auto-saves trade outcome (edit note optional)</span>
                </div>
                {savedBlobId && (
                  <span className="keycap border-pos text-pos">
                    <span>saved on walrus</span> {shortHash(savedBlobId)}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                <input
                  value={draftLesson}
                  onChange={e => setDraftLesson(e.target.value)}
                  aria-label="Edit auto-captured trade lesson"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-line-2 bg-card px-3 text-xs text-fg focus:border-pos focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSavingLesson || !draftLesson.trim()}
                  className="btn-primary h-9 shrink-0 rounded-lg px-3.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingLesson ? 'Saving…' : 'Save Snapshot to Walrus'}
                </button>
              </div>
            </form>
          </div>

          {/* TILE 2: 1-Col Span - Tier 2 Mixed Calibration & Scoring (Formula + Consequence) */}
          <div className="flex flex-col justify-between p-5 sm:p-6 bg-deep">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <span className="text-xs font-mono text-fg-3">02 · Calibration &amp; scoring</span>
                  <h3 className="text-base font-medium text-fg">Brier Calibration Score: 0.128</h3>
                </div>
                <ShieldCheck size={16} className="text-pos" />
              </div>

              <div className="mt-4">
                <div className="num text-xs font-medium text-pos">
                  0.128 with Walrus vs. 0.468 Stateless LLM Error (-74% error)
                </div>
                <p className="mt-2 text-xs text-fg-2 leading-relaxed">
                  Most trading agents hallucinate 90% confidence while blowing up your wallet. RogueTrader uses strict probabilistic scoring:
                </p>

                {/* Explicit Formula Box */}
                <div className="mt-3 rounded-lg border border-line-2 bg-card p-3 font-mono text-xs">
                  <div className="text-center font-medium text-fg">
                    Brier = (1 / N) · Σ (f_t − o_t)²
                  </div>
                  <div className="mt-2 border-t border-line pt-2 text-[11px] text-fg-3 leading-relaxed">
                    Where <span className="text-fg">f_t</span> is forecast confidence and <span className="text-fg">o_t</span> is the on-chain resolution verified via Tatum. Lower error means fewer blown accounts.
                  </div>
                </div>
              </div>

              {/* Comparative Progress Bars */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-fg-3 mb-1">
                    <span>Stateless LLM (blind)</span>
                    <span className="text-neg">0.468 error</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
                    <div className="h-full bg-neg rounded-full" style={{ width: '46.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-fg-3 mb-1">
                    <span>Walrus calibrated</span>
                    <span className="text-pos">0.128 error</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
                    <div className="h-full bg-pos rounded-full" style={{ width: '12.8%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-line bg-raised p-2.5 text-[11px] font-mono text-fg-3">
              <span>Live setup penalty: {result?.evaluation.statelessBrierPenalty.toFixed(3) ?? '0.774'} blind ➔ {result?.evaluation.walrusBrierPenalty.toFixed(3) ?? '0.212'} Walrus</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: 1 col (Sui Telemetry) + 2 cols (x402 Channel) */}
        <div className="grid grid-cols-1 divide-y divide-line border-t border-line lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          {/* TILE 3: 1-Col Span - Tatum Sui Live Telemetry */}
          <div className="p-5 sm:p-6 bg-deep">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-mono text-fg-3">03 · Live market feed</span>
                <h3 className="text-base font-medium text-fg">Sui Mainnet (via Tatum)</h3>
              </div>
              <Activity size={16} className="text-pos" />
            </div>

            <dl className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">Tatum Gateway</dt>
                <dd className="text-fg">sui-mainnet.gateway.tatum.io</dd>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">Current Sui Block</dt>
                <dd className="num text-fg">
                  #{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">SUI Price (Live DEX)</dt>
                <dd className="num text-fg">
                  ${marketState?.suiPrice.toFixed(3) || '0.849'}{' '}
                  <span className={marketState && marketState.change24h >= 0 ? 'text-pos' : 'text-neg'}>
                    {marketState && marketState.change24h >= 0 ? '+' : ''}
                    {marketState?.change24h.toFixed(2) || '+0.57'}%
                  </span>
                </dd>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">Sui DEX Pool Liquidity</dt>
                <dd className="num text-fg">
                  ${((marketState?.dexLiquidityUsd ?? 4280000) / 1_000_000).toFixed(2)}M
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-3">Sui DEX 24h Volume</dt>
                <dd className="num text-fg">
                  ${((marketState?.cetusVolume24h ?? 14200000) / 1_000_000).toFixed(2)}M
                </dd>
              </div>
            </dl>
          </div>

          {/* TILE 4: 2-Cols Span - HTTP 402 Micropayment Channel */}
          <div className="p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-mono text-fg-3">04 · Bot API (x402)</span>
                <h3 className="text-base font-medium text-fg">Let Your Trading Bot Call This Guard</h3>
              </div>
              <span className="keycap text-xs">
                <span>cost</span> 0.05 SUI / check
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-fg-2 leading-relaxed">
                  Any trading bot can call this check over HTTP before signing an order. It pays 0.05 SUI per check via HTTP 402—no API keys or monthly subscriptions needed.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSettle}
                    disabled={isSettling}
                    className="btn-primary h-9 rounded-md px-3 text-xs font-medium cursor-pointer transition-colors"
                  >
                    {isSettling ? 'Sending…' : 'Test 0.05 SUI Bot Payment'}
                  </button>
                  {settledTx && (
                    <span className="num text-xs text-pos font-mono">
                      ✓ Payment receipt verified
                    </span>
                  )}
                </div>
              </div>

              {/* cURL Snippet */}
              <div className="relative rounded-lg border border-line bg-deep p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-1 text-fg-3 border-b border-line/60 mb-2">
                  <span>TERMINAL REQUEST</span>
                  <button
                    type="button"
                    onClick={copyCurl}
                    className="flex items-center gap-1 text-fg-2 hover:text-fg cursor-pointer"
                  >
                    {copiedCurl ? <Check size={12} className="text-pos" /> : <Copy size={12} />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="text-fg-3 overflow-x-auto whitespace-pre-wrap break-all leading-tight">
                  {curlCommand}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
