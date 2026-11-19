import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import type {
  EpistemicEvaluation,
  ResolvedTradeOutcome,
  RiskCalibrationPolicy,
  TatumMarketState,
  TradeOutcomeRecord,
  WalrusMemoryItem
} from '../types';
import { agentEngine, HISTORICAL_BENCHMARK_ROWS, MARKET_REGIMES } from '../services/agentEngine';
import { DEFAULT_RISK_POLICY, parseTradeIntent, type ParsedTradeIntent } from '../services/riskPolicy';
import { outcomeLedger } from '../services/outcomeLedger';
import { x402Payment } from '../services/x402Payment';
import { NAVI_OVERHEAT_UTILIZATION_PCT, NAVI_SUI_RESERVE_OBJECT_ID } from '../services/naviOracle';

const MEMWAL_ACCOUNT_ID = '0xf7bb427b6a7a9a585118f383f9653411a4f784d7280097409989079072d0e223';

const QUICK_ASSETS = ['SUI', 'CETUS', 'NAVI', 'DEEP', 'XAU/USD'] as const;
const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10] as const;

interface QuickPreset {
  id: string;
  label: string;
  mode: 'live' | 'stress_replay';
  side: 'Long' | 'Short';
  asset: string;
  leverage: number;
  note: string;
  regimeId: string | null;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'live-sui-5x',
    label: 'Live: Long SUI 5x',
    mode: 'live',
    side: 'Long',
    asset: 'SUI',
    leverage: 5,
    note: 'breakout',
    regimeId: null
  },
  {
    id: 'replay-oct-navi',
    label: 'Replay: Oct 14 NAVI 78.4% squeeze',
    mode: 'stress_replay',
    side: 'Long',
    asset: 'SUI',
    leverage: 3,
    note: 'NAVI borrow 78.4% breakout',
    regimeId: 'oct-navi-trap'
  },
  {
    id: 'replay-cetus-social',
    label: 'Replay: CETUS social spike 5x',
    mode: 'stress_replay',
    side: 'Long',
    asset: 'CETUS',
    leverage: 5,
    note: 'social spike euphoria',
    regimeId: 'meme-euphoria-trap'
  },
  {
    id: 'unseen-xau-fomc',
    label: 'Unseen: Long XAU/USD FOMC 5x',
    mode: 'live',
    side: 'Long',
    asset: 'XAU/USD',
    leverage: 5,
    note: 'FOMC shock',
    regimeId: null
  }
];

const shortHash = (h: string, head = 6, tail = 4) => {
  const s = h.replace(/^0x/, '');
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
};

const formatLiqDrop = (lev: number) => (lev <= 1 ? 'None (spot)' : `-${(100 / lev).toFixed(1)}%`);

const formatNaviSource = (source: TatumMarketState['navi']['source']) => {
  switch (source) {
    case 'tatum_sui_graphql':
      return 'Tatum Sui GraphQL (on-chain Move)';
    case 'public_sui_graphql':
      return 'Sui Mainnet GraphQL (on-chain Move)';
    case 'defillama_live':
      return 'DeFiLlama Live Pools API';
    default:
      return 'Unavailable (no fallback fabricated)';
  }
};

const buildTradeText = (side: 'Long' | 'Short', asset: string, leverage: number, note: string) => {
  const cleanAsset = asset.trim().toUpperCase() || 'SUI';
  const cleanNote = note.trim();
  return cleanNote
    ? `${side} ${cleanAsset} ${leverage}x — ${cleanNote}`
    : `${side} ${cleanAsset} ${leverage}x`;
};

interface CheckResultState {
  tradeText: string;
  trade: ParsedTradeIntent;
  evaluation: EpistemicEvaluation;
  policyUsed: RiskCalibrationPolicy;
  mode: 'live' | 'stress_replay';
  regimeId: string | null;
}

function createInitialResult(): CheckResultState {
  const regime = MARKET_REGIMES[0];
  const tradeText = 'Long SUI 3x — NAVI borrow 78.4% breakout';
  const trade = parseTradeIntent(tradeText);
  const recalledItem: WalrusMemoryItem = {
    id: 'mem-seed-1',
    blobId: 'thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0',
    category: 'FAILURE_CASE',
    origin: 'HISTORICAL_BENCHMARK',
    outcomeNumeric: 0,
    text: 'Oct 14 [Cetus Vol: $14.2M | NAVI Borrow: 78.4% | Bid/Ask: 0.62]: SUI broke $0.85 but extreme borrow crowding triggered an -8.2% liquidation cascade in 40m. Mandate: Cap leverage at 2x when NAVI utilization > 75%.',
    timestamp: '2025-10-14T14:22:00Z',
    similarityScore: 0.89,
    weightImpact: '-38% Confidence',
    tatumCheckpoint: 89412950
  };

  return {
    tradeText,
    trade,
    policyUsed: DEFAULT_RISK_POLICY,
    mode: 'stress_replay',
    regimeId: regime.id,
    evaluation: {
      id: 'eval-init',
      scenarioId: regime.id,
      marketMode: 'stress_replay',
      pair: regime.pair,
      timestamp: new Date().toISOString(),
      tatumCheckpoint: 89412950,
      cetusVolume1h: regime.cetusVolume1h,
      deepBookSpreadBps: regime.deepBookSpread,
      naviBorrowPct: regime.naviBorrowPct,
      naviBorrowAprPct: null,
      liveNaviApplied: false,
      statelessConfidence: 88,
      statelessStance: regime.statelessStance,
      statelessRationale: regime.statelessQuote,
      statelessBrierPenalty: 0.7744,
      walrusConfidence: 58,
      walrusStance: regime.calibratedStance,
      walrusRationale: regime.calibratedQuote,
      shortExplanation:
        'Matched a past liquidation trap (89% similarity). Leverage cut from 3x to 2x so your liquidation buffer widens from 33.3% to 50.0%.',
      walrusBrierPenalty: 0.3364,
      matchQuality: 'STRONG_MATCH',
      topCandidateSimilarity: 0.89,
      policyApplied: 'strong_match_failure_shrinkage',
      calibratedLeverage: 2,
      recallLatencyMs: 310,
      actualOutcome: regime.actualOutcome,
      recalledMemory: recalledItem,
      recalledMemories: [recalledItem]
    }
  };
}

interface RuledBentoGridProps {
  marketState: TatumMarketState | null;
  onInterceptChange?: (active: boolean) => void;
}

export const RuledBentoGrid: React.FC<RuledBentoGridProps> = ({
  marketState,
  onInterceptChange
}) => {
  // Step 1: Trade form state
  const [mode, setMode] = useState<'live' | 'stress_replay'>('live');
  const [selectedRegimeId, setSelectedRegimeId] = useState<string>(MARKET_REGIMES[0].id);
  const [side, setSide] = useState<'Long' | 'Short'>('Long');
  const [asset, setAsset] = useState<string>('SUI');
  const [leverage, setLeverage] = useState<number>(5);
  const [note, setNote] = useState<string>('breakout');
  const [stage, setStage] = useState<string | null>(null);

  // Active evaluation result
  const [result, setResult] = useState<CheckResultState>(createInitialResult);

  // Step 3: Inline proof drawer toggle per memory ID
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Step 4: Outcome logging closed-loop state
  const [outcomeChoice, setOutcomeChoice] = useState<ResolvedTradeOutcome>('LIQUIDATED_OR_STOPPED');
  const [realizedMoveInput, setRealizedMoveInput] = useState<string>('-8.5');
  const [outcomeNote, setOutcomeNote] = useState<string>('');
  const [isRecordingOutcome, setIsRecordingOutcome] = useState(false);
  const [lastSavedOutcome, setLastSavedOutcome] = useState<{
    record: TradeOutcomeRecord;
    storedOnLiveRelayer: boolean;
  } | null>(null);
  const [liveRecords, setLiveRecords] = useState<TradeOutcomeRecord[]>(() => outcomeLedger.getRecords());

  // Secondary details drawer (collapsed by default)
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'market' | 'brier' | 'x402'>('market');

  // x402 quick test state
  const [isSettling, setIsSettling] = useState(false);
  const [settledTx, setSettledTx] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const runCheck = async (params?: {
    mode?: 'live' | 'stress_replay';
    side?: 'Long' | 'Short';
    asset?: string;
    leverage?: number;
    note?: string;
    regimeId?: string | null;
  }) => {
    if (stage) return;

    const runMode = params?.mode ?? mode;
    const runSide = params?.side ?? side;
    const runAsset = (params?.asset ?? asset).trim().toUpperCase() || 'SUI';
    const runLev = params?.leverage ?? leverage;
    const runNote = params?.note ?? note;
    const runRegimeId =
      runMode === 'stress_replay' ? (params?.regimeId ?? selectedRegimeId) : null;

    const tradeText = buildTradeText(runSide, runAsset, runLev, runNote);
    const parsed = parseTradeIntent(tradeText);
    const trade: ParsedTradeIntent = {
      ...parsed,
      side: runSide,
      asset: runAsset,
      leverage: runLev,
      regimeId: runRegimeId ?? parsed.regimeId
    };

    const activePolicy = agentEngine.getPolicy();
    setStage('Reading live Sui block & NAVI borrow rate…');
    setLastSavedOutcome(null);
    setExpandedProofId(null);
    onInterceptChange?.(true);

    try {
      const evaluation = await agentEngine.runEvaluationCycle(
        runMode === 'stress_replay' ? runRegimeId : trade.regimeId,
        (stageLabel) => setStage(stageLabel),
        tradeText,
        {
          asset: trade.asset,
          leverage: trade.leverage,
          side: trade.side,
          isSuiTrackedAsset: trade.isSuiTrackedAsset,
          marketMode: runMode,
          liveMarket: marketState
        },
        activePolicy
      );

      setResult({
        tradeText,
        trade,
        evaluation,
        policyUsed: activePolicy,
        mode: runMode,
        regimeId: runRegimeId
      });
    } finally {
      setStage(null);
    }
  };

  const applyPreset = (preset: QuickPreset) => {
    setMode(preset.mode);
    setSide(preset.side);
    setAsset(preset.asset);
    setLeverage(preset.leverage);
    setNote(preset.note);
    if (preset.regimeId) setSelectedRegimeId(preset.regimeId);
    void runCheck({
      mode: preset.mode,
      side: preset.side,
      asset: preset.asset,
      leverage: preset.leverage,
      note: preset.note,
      regimeId: preset.regimeId
    });
  };

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecordingOutcome) return;

    const parsedMove = Number(realizedMoveInput);
    const realizedMovePct = Number.isFinite(parsedMove)
      ? parsedMove
      : outcomeChoice === 'LIQUIDATED_OR_STOPPED'
        ? -8.5
        : 9.0;

    setIsRecordingOutcome(true);
    try {
      const saved = await outcomeLedger.recordOutcome({
        tradeText: result.tradeText,
        asset: result.trade.asset,
        side: result.trade.side,
        proposedLeverage: result.trade.leverage,
        calibratedLeverage: result.evaluation.calibratedLeverage,
        statelessConfidence: result.evaluation.statelessConfidence,
        walrusConfidence: result.evaluation.walrusConfidence,
        outcome: outcomeChoice,
        realizedMovePct,
        note: outcomeNote.trim(),
        naviBorrowPct: result.evaluation.naviBorrowPct,
        tatumCheckpoint: marketState?.latestCheckpoint ?? result.evaluation.tatumCheckpoint
      });

      setLastSavedOutcome({
        record: saved.record,
        storedOnLiveRelayer: saved.storedOnLiveRelayer
      });
      setLiveRecords(outcomeLedger.getRecords());
      setOutcomeNote('');
    } finally {
      setIsRecordingOutcome(false);
    }
  };

  const handleRecheckWithUpdatedMemory = () => {
    // Always re-run in live mode so the newly committed LIVE_OUTCOME memory is evaluated directly
    setMode('live');
    void runCheck({
      mode: 'live',
      side: result.trade.side,
      asset: result.trade.asset,
      leverage: result.trade.leverage,
      note: note,
      regimeId: null
    });
  };

  const handleSettleX402 = async () => {
    setIsSettling(true);
    try {
      const inv = x402Payment.generateInvoice(0.05);
      const res = await x402Payment.settleInvoice(
        inv,
        '0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d'
      );
      if (res.success && res.receipt) {
        setSettledTx(res.receipt.txDigest);
      }
    } finally {
      setIsSettling(false);
    }
  };

  const ev = result.evaluation;
  const policy = result.policyUsed;
  const proposedLev = result.trade.leverage;
  const adjustedLev = ev.calibratedLeverage;
  const levReduced = adjustedLev < proposedLev;
  const isUnfamiliar = ev.matchQuality === 'UNFAMILIAR_REGIME';
  const isWeakMatch = ev.matchQuality === 'WEAK_MATCH';
  const topSimPct = Math.round(ev.topCandidateSimilarity * 100);
  const weakFloorPct = Math.round(policy.weakMatchThreshold * 100);
  const liveBrierSummary = outcomeLedger.getSummary();

  const verdictBadge = ev.liveNaviApplied
    ? { label: 'LIVE NAVI OVERHEAT', tone: 'neg' as const }
    : isUnfamiliar
      ? { label: 'UNFAMILIAR · BASELINE CAP', tone: 'amber' as const }
      : isWeakMatch
        ? { label: 'PARTIAL MATCH · CAPPED', tone: 'amber' as const }
        : levReduced
          ? { label: 'LEVERAGE CUT', tone: 'pos' as const }
          : { label: 'CLEARED', tone: 'pos' as const };

  const badgeToneClasses = {
    pos: 'border-pos/35 bg-pos/10 text-pos',
    neg: 'border-neg/35 bg-neg/10 text-neg',
    amber: 'border-amber-500/35 bg-amber-500/10 text-amber-500'
  }[verdictBadge.tone];

  const apiBase =
    typeof window !== 'undefined' ? window.location.origin : 'https://roguetrader.vercel.app';
  const curlCommand = `curl -X POST ${apiBase}/api/x402/check \\
  -H "X-PAYMENT: sui:${settledTx ?? '5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N'}" \\
  -H "Content-Type: application/json" \\
  -d '{"trade":"${result.tradeText}"}'`;

  return (
    <div className="space-y-4">
      {/* ============================================================
          STEP 1: ENTER TRADE
          ============================================================ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runCheck();
        }}
        className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-fg-3">01</span>
            <h2 className="text-base font-medium text-fg">Enter trade</h2>
          </div>

          {/* Live Sui Market vs Historical Stress Replay Switch */}
          <div
            role="group"
            aria-label="Market data mode"
            className="inline-flex rounded-lg border border-line bg-deep p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => setMode('live')}
              className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                mode === 'live'
                  ? 'bg-raised font-medium text-fg'
                  : 'text-fg-3 hover:text-fg-2'
              }`}
            >
              Live Sui Market
            </button>
            <button
              type="button"
              onClick={() => setMode('stress_replay')}
              className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                mode === 'stress_replay'
                  ? 'bg-raised font-medium text-fg'
                  : 'text-fg-3 hover:text-fg-2'
              }`}
            >
              Stress Replay
            </button>
          </div>
        </div>

        {/* Stress Replay Selector (only visible in Stress Replay mode) */}
        {mode === 'stress_replay' && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-amber-500">Historical crisis replay</span>
              <span className="text-fg-3">Uses recorded historical borrow &amp; liquidity conditions</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MARKET_REGIMES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedRegimeId(r.id);
                    const baseAsset = r.pair.split('/')[0];
                    setAsset(baseAsset);
                    setNote(r.name);
                  }}
                  className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    selectedRegimeId === r.id
                      ? 'border-amber-500/50 bg-amber-500/15 text-fg'
                      : 'border-line bg-deep text-fg-2 hover:border-line-2'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Structured Trade Inputs */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Side */}
          <div className="sm:col-span-3">
            <label className="mb-1.5 block font-mono text-[11px] uppercase text-fg-3">Side</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-deep p-1">
              {(['Long', 'Short'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`h-9 cursor-pointer rounded-md text-xs font-medium transition-colors ${
                    side === s
                      ? s === 'Long'
                        ? 'bg-pos/15 text-pos border border-pos/30'
                        : 'bg-neg/15 text-neg border border-neg/30'
                      : 'text-fg-3 hover:text-fg'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Asset */}
          <div className="sm:col-span-5">
            <label htmlFor="trade-asset-input" className="mb-1.5 block font-mono text-[11px] uppercase text-fg-3">
              Asset
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="trade-asset-input"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="SUI, CETUS, XAU/USD…"
                className="num h-11 w-28 shrink-0 rounded-lg border border-line bg-raised px-3 text-sm font-medium uppercase text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
              />
              <div className="flex flex-1 flex-wrap gap-1">
                {QUICK_ASSETS.map((ticker) => (
                  <button
                    key={ticker}
                    type="button"
                    onClick={() => setAsset(ticker)}
                    className={`num h-8 cursor-pointer rounded-md border px-2 text-[11px] transition-colors ${
                      asset.toUpperCase() === ticker
                        ? 'border-line-2 bg-raised font-medium text-fg'
                        : 'border-line bg-deep text-fg-3 hover:text-fg'
                    }`}
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leverage */}
          <div className="sm:col-span-4">
            <label className="mb-1.5 block font-mono text-[11px] uppercase text-fg-3">
              Proposed Leverage
            </label>
            <div className="grid grid-cols-5 gap-1 rounded-lg border border-line bg-deep p-1">
              {LEVERAGE_OPTIONS.map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`num h-9 cursor-pointer rounded-md text-xs font-medium transition-colors ${
                    leverage === lev
                      ? 'bg-raised text-fg border border-line-2'
                      : 'text-fg-3 hover:text-fg'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Context Note + Primary Action */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Setup or market context"
            placeholder="Optional context (e.g. breakout, NAVI borrow spike, FOMC shock, social spike)"
            className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-raised px-3.5 text-sm text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!asset.trim() || !!stage}
            className="btn-primary h-11 shrink-0 cursor-pointer rounded-lg px-6 text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {stage ? 'Checking…' : 'Check Trade'}
          </button>
        </div>

        {/* One-Click Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] text-fg-3">Try:</span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="num h-7 cursor-pointer rounded-md border border-line bg-deep px-2.5 text-[11px] text-fg-2 transition-colors hover:border-line-2 hover:text-fg"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {stage && (
          <div className="mt-3 flex items-center gap-2 font-mono text-xs text-fg-2">
            <span className="live-dot" aria-hidden />
            <span>{stage}</span>
          </div>
        )}
      </form>

      {/* ============================================================
          STEP 2: ADJUSTED LEVERAGE & WHY (THE VERDICT)
          ============================================================ */}
      <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-fg-3">02</span>
            <h2 className="text-base font-medium text-fg">Adjusted leverage &amp; why</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="keycap text-[11px]">
              <span>mode</span>
              {ev.marketMode === 'stress_replay' ? 'Stress Replay' : 'Live Sui Market'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium ${badgeToneClasses}`}
            >
              {verdictBadge.tone === 'neg' ? (
                <ShieldAlert size={13} />
              ) : verdictBadge.tone === 'amber' ? (
                <AlertTriangle size={13} />
              ) : (
                <ShieldCheck size={13} />
              )}
              {verdictBadge.label}
            </span>
          </div>
        </div>

        {/* Clean Before -> After Comparison */}
        <div className="mt-4 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
          {/* Proposed */}
          <div className="rounded-xl border border-line bg-deep p-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-fg-3">
              <span>PROPOSED (NO MEMORY)</span>
              <span>Blind sizing</span>
            </div>
            <div className="num mt-2 text-2xl font-medium text-fg">
              {result.trade.side} {result.trade.asset} · {proposedLev}x
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-fg-2">
              <span>
                Wipeout drop: <strong className="num text-fg">{formatLiqDrop(proposedLev)}</strong>
              </span>
              <span>
                Confidence: <strong className="num text-fg">{ev.statelessConfidence}%</strong>
              </span>
            </div>
          </div>

          {/* Center Arrow */}
          <div className="hidden items-center justify-center text-fg-3 sm:flex" aria-hidden>
            <ArrowRight size={20} />
          </div>

          {/* Adjusted */}
          <div
            className={`rounded-xl border p-4 ${
              verdictBadge.tone === 'neg'
                ? 'border-neg/40 bg-neg/[0.04]'
                : verdictBadge.tone === 'amber'
                  ? 'border-amber-500/40 bg-amber-500/[0.05]'
                  : 'border-pos/40 bg-pos/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-medium text-fg">ADJUSTED (ROGUETRADER)</span>
              <span
                className={
                  verdictBadge.tone === 'neg'
                    ? 'text-neg'
                    : verdictBadge.tone === 'amber'
                      ? 'text-amber-500'
                      : 'text-pos'
                }
              >
                {levReduced ? `Cut ${proposedLev}x → ${adjustedLev}x` : 'Within cap'}
              </span>
            </div>
            <div
              className={`num mt-2 text-2xl font-medium ${
                verdictBadge.tone === 'neg'
                  ? 'text-neg'
                  : verdictBadge.tone === 'amber'
                    ? 'text-amber-500'
                    : 'text-pos'
              }`}
            >
              {result.trade.side} {result.trade.asset} · {adjustedLev}x
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-fg-2">
              <span>
                Wipeout drop:{' '}
                <strong
                  className={`num ${
                    verdictBadge.tone === 'amber' ? 'text-amber-500' : 'text-pos'
                  }`}
                >
                  {formatLiqDrop(adjustedLev)}
                </strong>
              </span>
              <span>
                Confidence: <strong className="num text-fg">{ev.walrusConfidence}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Plain-English 1-2 Sentence Explanation */}
        <p className="mt-4 rounded-xl border border-line bg-raised/60 p-3.5 text-sm leading-relaxed text-fg">
          {ev.shortExplanation}
        </p>

        {/* Compact Live Market Context Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-3">
          <span className="keycap">
            <span>NAVI borrow</span>
            {ev.naviBorrowPct != null ? (
              <span className={ev.naviBorrowPct >= NAVI_OVERHEAT_UTILIZATION_PCT ? 'text-neg' : 'text-fg'}>
                {ev.naviBorrowPct.toFixed(1)}%
                {ev.naviBorrowAprPct != null ? ` (${ev.naviBorrowAprPct.toFixed(1)}% APR)` : ''}
              </span>
            ) : (
              <span>{result.trade.isSuiTrackedAsset ? 'unavailable' : 'untracked asset'}</span>
            )}
          </span>
          <span className="keycap">
            <span>Sui block</span>#{ev.tatumCheckpoint.toLocaleString('en-US')}
          </span>
          <span className="keycap">
            <span>recall</span>
            {ev.recallLatencyMs}ms
          </span>
          <span className="keycap">
            <span>rule</span>
            {ev.policyApplied}
          </span>
        </div>
      </div>

      {/* ============================================================
          STEP 3: MATCHED PAST BLOWUPS (WALRUS MEMORY + VERIFY PROOF)
          ============================================================ */}
      <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-fg-3">03</span>
            <h2 className="text-base font-medium text-fg">Matched past blowups on Walrus</h2>
          </div>
          <span className="num font-mono text-xs text-fg-3">
            {ev.recalledMemories.length > 0
              ? `${ev.recalledMemories.length} match${ev.recalledMemories.length === 1 ? '' : 'es'} · top ${topSimPct}%`
              : `0 matches ≥ ${weakFloorPct}% floor (closest ${topSimPct}%)`}
          </span>
        </div>

        {ev.recalledMemories.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/[0.05] p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-fg">
                  Unfamiliar Regime — No Walrus Memory Above {weakFloorPct}% Threshold
                </p>
                <p className="text-xs leading-relaxed text-fg-2">
                  Closest stored setup was only {topSimPct}% similar, so RogueTrader refused to guess from irrelevant history and enforced the deterministic baseline cap (max {policy.unfamiliarMaxLeverage}x, confidence ≤ {policy.unfamiliarConfidenceCap}%). Record what happens in Step 4 below to teach Walrus this regime.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {ev.recalledMemories.map((mem) => {
              const isLiveOrigin = mem.origin === 'LIVE_OUTCOME';
              const isProofOpen = expandedProofId === mem.id;
              return (
                <li key={mem.id} className="rounded-xl border border-line bg-deep p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`num rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${
                          mem.similarityScore >= policy.strongMatchThreshold
                            ? 'border-pos/30 bg-pos/10 text-pos'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {Math.round(mem.similarityScore * 100)}% match
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                          isLiveOrigin
                            ? 'border-pos/35 bg-pos/10 text-pos'
                            : 'border-line bg-raised text-fg-3'
                        }`}
                      >
                        {isLiveOrigin ? 'Live Outcome' : 'Historical Benchmark'}
                      </span>
                      <span className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[11px] text-fg-2">
                        {mem.category.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedProofId(isProofOpen ? null : mem.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-fg-2 transition-colors hover:border-line-2 hover:text-fg"
                    >
                      <span>{isProofOpen ? 'Hide proof' : 'Verify proof'}</span>
                      {isProofOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <p className="mt-2.5 text-sm leading-relaxed text-fg-2">{mem.text}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="keycap">
                      <span>walrus</span>
                      {shortHash(mem.blobId)}
                    </span>
                    {mem.tatumCheckpoint && (
                      <span className="keycap">
                        <span>block</span>#{mem.tatumCheckpoint.toLocaleString('en-US')}
                      </span>
                    )}
                    <span className={mem.weightImpact.startsWith('-') ? 'text-neg' : 'text-pos'}>
                      {mem.weightImpact}
                    </span>
                  </div>

                  {/* Inline Verifiable Proof Drawer */}
                  {isProofOpen && (
                    <div className="mt-3 space-y-2 rounded-lg border border-line-2 bg-card p-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-fg-3">Walrus Blob ID</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-fg break-all">{mem.blobId}</code>
                          <button
                            type="button"
                            onClick={() => copyText(mem.id, mem.blobId)}
                            className="cursor-pointer rounded border border-line bg-deep p-1 text-fg-2 hover:text-fg"
                            aria-label="Copy Walrus Blob ID"
                          >
                            {copiedId === mem.id ? (
                              <Check size={11} className="text-pos" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-fg-3">MemWal Account (Sui Mainnet)</span>
                        <code className="text-fg-2">{shortHash(MEMWAL_ACCOUNT_ID, 10, 6)}</code>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-fg-3">Tatum Sui Gateway</span>
                        <code className="text-fg-2">
                          {marketState?.gatewayHost || 'sui-mainnet.gateway.tatum.io/graphql'}
                        </code>
                      </div>
                      {mem.tatumCheckpoint && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-fg-3">Sui Checkpoint Explorer</span>
                          <a
                            href={`https://suivision.xyz/checkpoint/${mem.tatumCheckpoint}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-pos hover:underline"
                          >
                            <span>Block #{mem.tatumCheckpoint.toLocaleString('en-US')}</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ============================================================
          STEP 4: CLOSE THE LOOP — RECORD WHAT ACTUALLY HAPPENED
          ============================================================ */}
      <form
        onSubmit={handleRecordOutcome}
        className="rounded-2xl border border-pos/30 bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-pos">04</span>
            <h2 className="text-base font-medium text-fg">Close the loop: Record what happened</h2>
          </div>
          <span className="font-mono text-[11px] text-fg-3">
            Saved to Walrus · Updates future checks &amp; live Brier score
          </span>
        </div>

        <p className="mt-3 text-xs text-fg-2">
          After <strong className="text-fg">{result.tradeText}</strong> resolves, log the real outcome below. Then re-check the exact same trade to watch Walrus memory shift the next recommendation.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Outcome Toggle */}
          <div className="sm:col-span-6">
            <label className="mb-1.5 block font-mono text-[11px] uppercase text-fg-3">
              Actual Trade Outcome
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setOutcomeChoice('LIQUIDATED_OR_STOPPED');
                  if (Number(realizedMoveInput) >= 0) setRealizedMoveInput('-8.5');
                }}
                className={`h-10 cursor-pointer rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  outcomeChoice === 'LIQUIDATED_OR_STOPPED'
                    ? 'border-neg/45 bg-neg/15 text-neg'
                    : 'border-line bg-deep text-fg-2 hover:text-fg'
                }`}
              >
                Stopped out / Blowup (o=0)
              </button>
              <button
                type="button"
                onClick={() => {
                  setOutcomeChoice('SURVIVED_OR_TARGET_HIT');
                  if (Number(realizedMoveInput) < 0) setRealizedMoveInput('9.2');
                }}
                className={`h-10 cursor-pointer rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  outcomeChoice === 'SURVIVED_OR_TARGET_HIT'
                    ? 'border-pos/45 bg-pos/15 text-pos'
                    : 'border-line bg-deep text-fg-2 hover:text-fg'
                }`}
              >
                Target hit / Survived (o=1)
              </button>
            </div>
          </div>

          {/* Realized Move % */}
          <div className="sm:col-span-3">
            <label
              htmlFor="realized-move-input"
              className="mb-1.5 block font-mono text-[11px] uppercase text-fg-3"
            >
              Realized Move (%)
            </label>
            <input
              id="realized-move-input"
              type="number"
              step="0.1"
              value={realizedMoveInput}
              onChange={(e) => setRealizedMoveInput(e.target.value)}
              className="num h-10 w-full rounded-lg border border-line bg-raised px-3 text-sm text-fg focus:border-line-2 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              disabled={isRecordingOutcome}
              className="btn-primary h-10 w-full cursor-pointer rounded-lg px-3 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isRecordingOutcome ? 'Saving…' : 'Record to Walrus'}
            </button>
          </div>
        </div>

        <input
          value={outcomeNote}
          onChange={(e) => setOutcomeNote(e.target.value)}
          placeholder="Optional post-trade note (e.g. NAVI borrow spiked right before stop sweep)"
          className="mt-2.5 h-9 w-full rounded-lg border border-line bg-deep px-3 text-xs text-fg placeholder:text-fg-3 focus:border-line-2 focus:outline-none"
        />

        {/* Immediate Feedback + One-Click Re-Check Loop */}
        {lastSavedOutcome && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-pos/35 bg-pos/[0.06] p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-pos">
                <Check size={14} />
                <span className="font-medium">
                  Outcome recorded ({lastSavedOutcome.storedOnLiveRelayer ? 'Walrus Relayer' : 'Persisted Memory'})
                </span>
                <span className="keycap text-[11px]">
                  <span>blob</span>
                  {shortHash(lastSavedOutcome.record.walrusBlobId)}
                </span>
              </div>
              <p className="num font-mono text-[11px] text-fg-2">
                Trade Brier Error: Blind {lastSavedOutcome.record.statelessBrier.toFixed(3)} → RogueTrader{' '}
                {lastSavedOutcome.record.walrusBrier.toFixed(3)} · Total live outcomes logged:{' '}
                {liveRecords.length}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRecheckWithUpdatedMemory}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-pos/40 bg-pos/15 px-3.5 text-xs font-medium text-pos transition-colors hover:bg-pos/25"
            >
              <RefreshCw size={13} />
              <span>Re-check with updated memory</span>
            </button>
          </div>
        )}
      </form>

      {/* ============================================================
          SECONDARY DETAILS DRAWER (COLLAPSED BY DEFAULT)
          ============================================================ */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left text-xs font-medium text-fg-2 transition-colors hover:bg-raised/60 hover:text-fg"
        >
          <span className="flex items-center gap-2 font-mono">
            <Activity size={14} className="text-pos" />
            <span>
              Inspect Live Telemetry (Tatum + NAVI), Brier Scoreboard ({liveBrierSummary.count} live) &amp; Bot API (x402)
            </span>
          </span>
          {detailsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {detailsOpen && (
          <div className="border-t border-line bg-deep p-5">
            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-line pb-3">
              {(
                [
                  { id: 'market', label: 'Live Market (Tatum + NAVI)' },
                  { id: 'brier', label: `Brier Scoreboard (${liveBrierSummary.count} live)` },
                  { id: 'x402', label: 'Bot API (x402)' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDetailsTab(tab.id)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    detailsTab === tab.id
                      ? 'bg-raised text-fg border border-line-2'
                      : 'text-fg-3 hover:text-fg'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Live Market Telemetry */}
            {detailsTab === 'market' && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <dl className="space-y-2.5 rounded-xl border border-line bg-card p-4 font-mono text-xs">
                  <div className="border-b border-line pb-2 text-[11px] font-medium text-fg">
                    Sui Mainnet (via Tatum GraphQL)
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Gateway</dt>
                    <dd className="truncate text-fg">
                      {marketState?.gatewayHost || 'sui-mainnet.gateway.tatum.io/graphql'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Latest Block</dt>
                    <dd className="num text-fg">
                      #{marketState?.latestCheckpoint.toLocaleString('en-US') ?? '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">SUI Price (DexScreener)</dt>
                    <dd className="num text-fg">
                      {marketState ? `$${marketState.suiPrice.toFixed(3)}` : '—'}{' '}
                      {marketState && (
                        <span className={marketState.change24h >= 0 ? 'text-pos' : 'text-neg'}>
                          ({marketState.change24h >= 0 ? '+' : ''}
                          {marketState.change24h.toFixed(2)}%)
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">1h Move / Volatility</dt>
                    <dd className="num text-fg">
                      {marketState?.volatility1h != null
                        ? `${marketState.volatility1h.toFixed(2)}%`
                        : 'Unavailable'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Sui DEX 24h Volume</dt>
                    <dd className="num text-fg">
                      {marketState
                        ? `$${(marketState.cetusVolume24h / 1_000_000).toFixed(2)}M`
                        : '—'}
                    </dd>
                  </div>
                </dl>

                <dl className="space-y-2.5 rounded-xl border border-line bg-card p-4 font-mono text-xs">
                  <div className="border-b border-line pb-2 text-[11px] font-medium text-fg">
                    Live NAVI Protocol SUI Reserve (On-Chain Move)
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Reserve Object</dt>
                    <dd className="text-fg">{shortHash(NAVI_SUI_RESERVE_OBJECT_ID, 8, 6)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Borrow Utilization</dt>
                    <dd
                      className={`num font-medium ${
                        marketState?.navi.borrowUtilizationPct == null
                          ? 'text-fg-3'
                          : marketState.navi.isOverheated
                            ? 'text-neg'
                            : 'text-pos'
                      }`}
                    >
                      {marketState?.navi.borrowUtilizationPct != null
                        ? `${marketState.navi.borrowUtilizationPct.toFixed(1)}% (cap ≥ ${NAVI_OVERHEAT_UTILIZATION_PCT}%)`
                        : 'Unavailable'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Borrow / Supply APR</dt>
                    <dd className="num text-fg">
                      {marketState?.navi.borrowAprPct != null
                        ? `${marketState.navi.borrowAprPct.toFixed(2)}% / ${
                            marketState.navi.supplyAprPct != null
                              ? `${marketState.navi.supplyAprPct.toFixed(2)}%`
                              : '—'
                          }`
                        : 'Unavailable'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-3">Live Feed Source</dt>
                    <dd className="text-right text-fg-2">
                      {marketState ? formatNaviSource(marketState.navi.source) : 'Loading…'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Tab 2: Strictly Separated Brier Scoreboard */}
            {detailsTab === 'brier' && (
              <div className="mt-4 space-y-4">
                {/* Live Outcomes Section */}
                <div className="rounded-xl border border-pos/30 bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-fg">
                      Live Resolved Trade Outcomes (Real Session Ledger)
                    </h3>
                    <span className="keycap text-[11px]">
                      <span>formula</span> Brier = (1/N) · Σ(f − o)²
                    </span>
                  </div>

                  {liveBrierSummary.count === 0 ? (
                    <p className="mt-2.5 text-xs text-fg-3">
                      No live outcomes recorded yet. Use Step 4 above to record a real trade result — live scores are never blended with historical benchmark seeds.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
                        <div className="rounded-lg border border-line bg-deep p-2.5">
                          <div className="text-[10px] text-fg-3">LIVE OUTCOMES</div>
                          <div className="num mt-0.5 text-sm font-medium text-fg">
                            {liveBrierSummary.count} ({liveBrierSummary.blowupsLogged} blowups /{' '}
                            {liveBrierSummary.winsLogged} wins)
                          </div>
                        </div>
                        <div className="rounded-lg border border-line bg-deep p-2.5">
                          <div className="text-[10px] text-fg-3">BLIND BRIER</div>
                          <div className="num mt-0.5 text-sm font-medium text-neg">
                            {liveBrierSummary.avgStatelessBrier?.toFixed(3)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-line bg-deep p-2.5">
                          <div className="text-[10px] text-fg-3">ROGUETRADER BRIER</div>
                          <div className="num mt-0.5 text-sm font-medium text-pos">
                            {liveBrierSummary.avgWalrusBrier?.toFixed(3)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-line bg-deep p-2.5">
                          <div className="text-[10px] text-fg-3">ERROR DELTA</div>
                          <div className="num mt-0.5 text-sm font-medium text-fg">
                            {liveBrierSummary.reductionPct != null
                              ? `${liveBrierSummary.reductionPct >= 0 ? '-' : '+'}${Math.abs(
                                  liveBrierSummary.reductionPct
                                )}%`
                              : '—'}
                          </div>
                        </div>
                      </div>

                      <ul className="divide-y divide-line rounded-lg border border-line bg-deep font-mono text-xs">
                        {liveRecords.slice(0, 6).map((rec) => (
                          <li
                            key={rec.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                          >
                            <span className="text-fg">{rec.tradeText}</span>
                            <span className="flex items-center gap-3">
                              <span className={rec.outcomeNumeric === 0 ? 'text-neg' : 'text-pos'}>
                                {rec.outcomeNumeric === 0 ? 'BLOWUP (o=0)' : 'WIN (o=1)'} (
                                {rec.realizedMovePct >= 0 ? '+' : ''}
                                {rec.realizedMovePct.toFixed(1)}%)
                              </span>
                              <span className="text-fg-3">
                                {rec.statelessBrier.toFixed(3)} → {rec.walrusBrier.toFixed(3)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Historical Benchmark Section (Strictly Separated) */}
                <div className="rounded-xl border border-line bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-fg">
                      Historical Backtest Benchmark (5 Settled Sui Reference Cases)
                    </h3>
                    <span className="font-mono text-[11px] text-fg-3">
                      Static reference · Not mixed into live outcomes
                    </span>
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="border-b border-line text-[11px] text-fg-3">
                        <tr>
                          <th className="py-1.5 pr-3">Regime</th>
                          <th className="py-1.5 pr-3">Outcome</th>
                          <th className="py-1.5 pr-3 text-right">Blind Brier</th>
                          <th className="py-1.5 pr-3 text-right">Walrus Brier</th>
                          <th className="py-1.5 text-right">Error Cut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {HISTORICAL_BENCHMARK_ROWS.map((row) => (
                          <tr key={row.checkpoint}>
                            <td className="py-2 pr-3 text-fg">{row.condition}</td>
                            <td className="py-2 pr-3 text-fg-2">{row.outcome}</td>
                            <td className="num py-2 pr-3 text-right text-neg">
                              {row.statelessBrier.toFixed(3)}
                            </td>
                            <td className="num py-2 pr-3 text-right text-pos">
                              {row.walrusBrier.toFixed(3)}
                            </td>
                            <td className="num py-2 text-right text-fg-2">{row.advantage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Bot API (x402) */}
            {detailsTab === 'x402' && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-fg">
                    <Terminal size={14} className="text-pos" />
                    <span>HTTP 402 Pay-Per-Check (0.05 SUI)</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-fg-2">
                    Trading bots call <code className="text-fg">/api/x402/check</code> before signing an order and attach a Sui mainnet payment digest verified through Tatum Sui GraphQL with replay protection.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSettleX402}
                      disabled={isSettling}
                      className="btn-primary h-9 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors"
                    >
                      {isSettling ? 'Verifying…' : 'Test 0.05 SUI Bot Payment'}
                    </button>
                    {settledTx && (
                      <span className="num font-mono text-xs text-pos">✓ Receipt verified</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-card p-4 font-mono text-[11px]">
                  <div className="mb-2 flex items-center justify-between border-b border-line pb-1.5 text-fg-3">
                    <span>CURL REQUEST</span>
                    <button
                      type="button"
                      onClick={() => copyText('curl', curlCommand)}
                      className="flex cursor-pointer items-center gap-1 text-fg-2 hover:text-fg"
                    >
                      {copiedId === 'curl' ? (
                        <Check size={12} className="text-pos" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedId === 'curl' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-all leading-relaxed text-fg-2">
                    {curlCommand}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
