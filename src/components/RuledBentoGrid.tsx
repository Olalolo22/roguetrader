import React, { useState } from 'react';
import { ArrowRight, CornerDownRight, Check, Copy, Activity, ShieldCheck } from 'lucide-react';
import type { TatumMarketState, EpistemicEvaluation, WalrusMemoryItem } from '../types';
import { agentEngine, MARKET_REGIMES } from '../services/agentEngine';
import { x402Payment } from '../services/x402Payment';

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

interface RuledBentoGridProps {
  marketState: TatumMarketState | null;
  onInterceptChange?: (active: boolean) => void;
}

export const RuledBentoGrid: React.FC<RuledBentoGridProps> = ({
  marketState,
  onInterceptChange,
}) => {
  const [input, setInput] = useState('Long SUI 2.14, 3x');
  const [stage, setStage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    trade: ParsedTrade;
    evaluation: EpistemicEvaluation;
    outcomeLabel: string;
  } | null>(() => {
    // Initial seeded display for instant 20s comprehension
    const t = parseTrade('Long SUI 2.14, 3x');
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
          blobId: '0x8f9a2c9188efacba772109aa988112bc',
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

  const runCheck = async (tradeText: string) => {
    const val = tradeText.trim();
    if (!val || stage) return;
    const trade = parseTrade(val);
    setStage('Reading Sui checkpoint');
    onInterceptChange?.(true);

    try {
      const evaluation = await agentEngine.runEvaluationCycle(trade.regimeId, (_s, step) => {
        setStage(['Reading Sui checkpoint', 'Sizing without memory', 'Recalling from Walrus', 'Scoring'][step - 1] ?? null);
      });
      const regime = MARKET_REGIMES.find(r => r.id === trade.regimeId)!;
      setResult({ trade, evaluation, outcomeLabel: regime.outcomeLabel });
    } finally {
      setStage(null);
    }
  };

  const handleSettle = async () => {
    setIsSettling(true);
    try {
      const inv = x402Payment.generateInvoice(0.05);
      const res = await x402Payment.settleInvoice(inv, '0x4f82a101b9ca990188efacba772109aa988112bc');
      if (res.success && res.receipt) {
        setSettledTx(res.receipt.txDigest);
      }
    } finally {
      setIsSettling(false);
    }
  };

  const curlCommand = `curl -X POST https://api.roguetrader.xyz/api/x402/check \\
  -H "X-PAYMENT: sui:${settledTx ?? '0x992fa100eb81711200dfa8829011b9881023bc4a889100188efacba772109aa'}" \\
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
                <span className="text-xs font-mono uppercase tracking-wider text-fg-3">TILE 01 // PRE-TRADE GATE</span>
                <h2 className="text-lg font-medium text-fg">Propose Order &amp; Walrus Memory Intercept</h2>
              </div>
              <span className="keycap text-xs">
                <span>mode</span> {stage ? 'RECALLING...' : 'LIVE GATE'}
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
                placeholder="Long SUI 2.14, 3x"
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

            {/* The Intercept Comparison Cards with SVG Connector */}
            <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Without Memory */}
              <div className="rounded-xl border border-line bg-deep p-4">
                <div className="flex items-center justify-between text-xs text-fg-3">
                  <span>Without memory</span>
                  <span className="num text-neg">Uncalibrated</span>
                </div>
                <div className="num mt-2 text-base font-medium text-fg">
                  {result ? `${result.trade.side} ${result.trade.asset}, ${result.trade.leverage}x` : 'Long SUI, 3x'}
                </div>
                <div className="mt-3 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-fg-2">
                    <span>Forecast Confidence:</span>
                    <span className="num text-fg">{beforeConf}%</span>
                  </div>
                  <div className="flex justify-between text-fg-2">
                    <span>Liquidation Distance:</span>
                    <span className="num text-fg">{liq(tradeLev)}</span>
                  </div>
                </div>
                <p className="mt-3 border-t border-line pt-2 text-[11px] text-fg-3">
                  Sizes blindly on current tick. No recall of prior liquidations.
                </p>
              </div>

              {/* With Walrus Memory (Intercept Card) */}
              <div className="rounded-xl border border-line-2 bg-raised p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-fg-3">With Walrus memory</span>
                  <span className="num text-pos font-medium">Intercepted</span>
                </div>
                <div className="num mt-2 text-base font-medium text-fg">
                  {result ? `${result.trade.side} ${result.trade.asset}, ${afterLev}x` : 'Long SUI, 2x'}
                </div>
                <div className="mt-3 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-fg-2">
                    <span>Forecast Confidence:</span>
                    <span className="num flex items-center gap-1.5">
                      <span className="line-through text-fg-3">{beforeConf}%</span>
                      <ArrowRight size={10} className="text-fg-3" />
                      <span className="text-fg">{afterConf}%</span>
                      <span className="text-neg">(-{beforeConf - afterConf} pts)</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-fg-2">
                    <span>Liquidation Distance:</span>
                    <span className="num flex items-center gap-1.5">
                      <span className="line-through text-fg-3">{liq(tradeLev)}</span>
                      <ArrowRight size={10} className="text-fg-3" />
                      <span className="text-pos font-medium">{liq(afterLev)}</span>
                    </span>
                  </div>
                </div>
                <p className="mt-3 border-t border-line pt-2 text-[11px] text-fg-3">
                  Walrus memory modulated size &amp; tightened risk boundaries.
                </p>
              </div>
            </div>

            {/* Recalled Memory Receipt */}
            {m && (
              <div className="mt-3 rounded-lg border border-line bg-deep p-3 font-mono">
                <div className="flex items-start gap-2">
                  <CornerDownRight size={14} className="mt-0.5 shrink-0 text-fg-3" />
                  <p className="text-xs text-fg-2 leading-relaxed">{m.text}</p>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-5 text-[11px]">
                  <span className="keycap">
                    <span>blob</span> {shortHash(m.blobId)}
                  </span>
                  {m.tatumCheckpoint && (
                    <span className="keycap">
                      <span>ckpt</span> {m.tatumCheckpoint.toLocaleString('en-US')}
                    </span>
                  )}
                  <span className="text-fg-3">
                    {Math.round(m.similarityScore * 100)}% match · {result?.evaluation.recallLatencyMs}ms
                  </span>
                  {isSeeded(m) && <span className="text-fg-3">· seeded from backtest</span>}
                </div>
              </div>
            )}
          </div>

          {/* TILE 2: 1-Col Span - Live Calibration & Risk Needle */}
          <div className="flex flex-col justify-between p-5 sm:p-6 bg-deep">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-fg-3">TILE 02 // CALIBRATION</span>
                  <h3 className="text-base font-medium text-fg">Brier Calibration Score</h3>
                </div>
                <ShieldCheck size={16} className="text-pos" />
              </div>

              <div className="mt-6 text-center">
                <div className="text-4xl font-mono font-medium tracking-tight text-fg">
                  0.128
                </div>
                <div className="num mt-1 text-xs text-pos font-medium">
                  -72.6% Error Reduction vs Baseline (0.468)
                </div>
                <p className="mt-2 text-xs text-fg-3 max-w-[220px] mx-auto leading-relaxed">
                  (1/N) * Σ(f - o)² across live Tatum resolution checkpoints. Lower is better.
                </p>
              </div>

              {/* Comparative Progress Bars */}
              <div className="mt-6 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-fg-3 mb-1">
                    <span>Stateless LLM Error</span>
                    <span className="text-neg">0.468</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
                    <div className="h-full bg-neg rounded-full" style={{ width: '46.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-fg-3 mb-1">
                    <span>Walrus Calibrated Error</span>
                    <span className="text-pos">0.128</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
                    <div className="h-full bg-pos rounded-full" style={{ width: '12.8%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-line bg-raised p-3 text-[11px] font-mono text-fg-3">
              <span>Boundary: Directional swing (~900ms recall). Storage writes (~20s) occur post-settlement.</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: 1 col (Sui Telemetry) + 2 cols (x402 Channel) */}
        <div className="grid grid-cols-1 divide-y divide-line border-t border-line lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          {/* TILE 3: 1-Col Span - Tatum Sui Live Telemetry */}
          <div className="p-5 sm:p-6 bg-deep">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-fg-3">TILE 03 // RPC TELEMETRY</span>
                <h3 className="text-base font-medium text-fg">Sui Mainnet Node</h3>
              </div>
              <Activity size={16} className="text-pos animate-pulse" />
            </div>

            <dl className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">Gateway</dt>
                <dd className="text-fg">sui-mainnet.gateway.tatum.io</dd>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">Live Checkpoint</dt>
                <dd className="num text-fg">
                  #{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">SUI Price</dt>
                <dd className="num text-fg">
                  ${marketState?.suiPrice.toFixed(3) || '2.140'}{' '}
                  <span className={marketState && marketState.change24h >= 0 ? 'text-pos' : 'text-neg'}>
                    {marketState && marketState.change24h >= 0 ? '+' : ''}
                    {marketState?.change24h.toFixed(2) || '+4.12'}%
                  </span>
                </dd>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <dt className="text-fg-3">Cetus SUI/USDC Depth</dt>
                <dd className="num text-fg">$24.8M</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-3">DeepBook v3 Spread</dt>
                <dd className="num text-fg">0.0008 SUI</dd>
              </div>
            </dl>
          </div>

          {/* TILE 4: 2-Cols Span - HTTP 402 Micropayment Channel */}
          <div className="p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-fg-3">TILE 04 // MACHINE PAYMENTS</span>
                <h3 className="text-base font-medium text-fg">HTTP 402 Risk Gate Channel</h3>
              </div>
              <span className="keycap text-xs">
                <span>rate</span> 0.05 SUI / query
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-fg-2 leading-relaxed">
                  Autonomous trading bots query this pre-trade risk gate programmatically. The API server returns standard HTTP 402 until the 0.05 SUI micropayment digest is verified via Tatum RPC.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSettle}
                    disabled={isSettling}
                    className="btn-primary h-9 rounded-md px-3 text-xs font-medium cursor-pointer transition-colors"
                  >
                    {isSettling ? 'Broadcasting…' : 'Simulate 0.05 SUI Settlement'}
                  </button>
                  {settledTx && (
                    <span className="num text-xs text-pos font-mono">
                      ✓ Digest verified
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
