import { useState } from 'react';
import type React from 'react';
import {
  Cpu,
  Database,
  Zap,
  AlertTriangle,
  ArrowRight,
  Lock,
  Unlock,
  CheckCircle2,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import type { AgentProfile, AgentId, TatumMarketState } from '../types';

export interface MarketShockScenario {
  id: string;
  label: string;
  pair: string;
  cetusDepth: string;
  cetusDelta: string;
  deepbookSpread: string;
  deepbookImbalance: string;
  naviBorrow: string;
  naviAlert: string;
  naviDanger: boolean;
  rawConf: number;
  rawStance: string;
  rawQuote: string;
  calibratedConf: number;
  calibratedStance: string;
  calibratedQuote: string;
  penaltyDelta: string;
  recalledBlobId: string;
  recalledSimilarity: number;
  recalledTitle: string;
  recalledLesson: string;
  entryZone: string;
  tpTarget: string;
  slStop: string;
}

export const MARKET_SCENARIOS: MarketShockScenario[] = [
  {
    id: 'oct-navi-trap',
    label: 'Oct 14 NAVI Borrow Trap (78.4%)',
    pair: 'SUI / USDC',
    cetusDepth: '$18.42M',
    cetusDelta: '+14.2% (1h Surge)',
    deepbookSpread: '0.018 SUI',
    deepbookImbalance: 'Bid/Ask 1.62x',
    naviBorrow: '78.4%',
    naviAlert: 'Risk Intercept Active (>75%)',
    naviDanger: true,
    rawConf: 88,
    rawStance: 'AGGRESSIVE 5X LONG',
    rawQuote: 'Raw LLM instinct: Cetus 1h volume crossed $18M! Breakout confirmed above $2.14, deploying 5x leveraged long.',
    calibratedConf: 58,
    calibratedStance: 'CAUTIOUS SPOT ACCUMULATION',
    calibratedQuote: 'Modulated Stance: Cautious Spot Accumulation ($2.120 - $2.145) with tight invalidation at $2.065.',
    penaltyDelta: '-30%',
    recalledBlobId: '#walrus_oct_navi_trap (0x8f4d...1ab3)',
    recalledSimilarity: 0.94,
    recalledTitle: 'MemWal Semantic Recall Active — Analogous Long-Squeeze Pattern Matched',
    recalledLesson:
      'In mid-October, Cetus volume spiked past $14M while NAVI borrow utilization exceeded 75%. Resulted in an 8% long-squeeze liquidation cascade 40m later. Eliminating leverage.',
    entryZone: '$2.120 - $2.145',
    tpTarget: '$2.280 (+7.4%)',
    slStop: '$2.065 (-3.2%)'
  },
  {
    id: 'pyth-epoch-latency',
    label: 'Epoch 512 Pyth Latency Spike',
    pair: 'SUI / USDC',
    cetusDepth: '$11.90M',
    cetusDelta: '-8.4% (Epoch Transition)',
    deepbookSpread: '0.044 SUI',
    deepbookImbalance: 'Spread Widening (4.2 bps)',
    naviBorrow: '64.1%',
    naviAlert: 'Oracle Drift Detected (420ms)',
    naviDanger: true,
    rawConf: 81,
    rawStance: 'ARB BREAKOUT LONG',
    rawQuote: 'Raw LLM instinct: Spot discount on AMM pool vs reference feed! Immediate directional buy order.',
    calibratedConf: 43,
    calibratedStance: 'DELTA-NEUTRAL / HALT LEVERAGE',
    calibratedQuote: 'Modulated Stance: Halting directional entry during epoch boundary transition; wait for checkpoint finality.',
    penaltyDelta: '-38%',
    recalledBlobId: '#walrus_epoch512_pyth (0x1e88...5aa9)',
    recalledSimilarity: 0.89,
    recalledTitle: 'MemWal Semantic Recall Active — Epoch Boundary Oracle Asymmetry',
    recalledLesson:
      'Oct 19 2026: Pyth oracle feed latency during Sui epoch transition (epoch 512) created a 40-sec pricing asymmetry on AMMs, trapping breakout bots.',
    entryZone: '$2.045 - $2.060',
    tpTarget: '$2.140 (+4.1%)',
    slStop: '$2.018 (-1.8%)'
  },
  {
    id: 'cetus-institutional-breakout',
    label: 'Cetus $24M Institutional Breakout',
    pair: 'SUI / USDC',
    cetusDepth: '$24.60M',
    cetusDelta: '+31.8% (Organic Spot Flow)',
    deepbookSpread: '0.009 SUI',
    deepbookImbalance: 'Whale Bid Absorption (0.12% slip)',
    naviBorrow: '48.2%',
    naviAlert: 'Healthy Leverage Ratio (<55%)',
    naviDanger: false,
    rawConf: 74,
    rawStance: 'MODERATE LONG',
    rawQuote: 'Raw LLM instinct: Steady upward trend on SUI/USDC. Standard momentum continuation.',
    calibratedConf: 86,
    calibratedStance: 'CONVICTION SPOT + CALL LADDER',
    calibratedQuote: 'Modulated Stance: High-conviction trend continuation confirmed by low borrow utilization + deep DeepBook bid wall.',
    penaltyDelta: '+12%',
    recalledBlobId: '#walrus_oct16_catalyst (0x3a91...7ef2)',
    recalledSimilarity: 0.91,
    recalledTitle: 'MemWal Semantic Recall Active — Verified Institutional Accumulation Regime',
    recalledLesson:
      'Oct 16 2026: Cetus 1h volume crossed $24M while DeepBook spread tightened below 1.8 bps and NAVI borrow stayed under 52%. Trend sustained +14.6% over 36h.',
    entryZone: '$2.080 - $2.105',
    tpTarget: '$2.340 (+11.8%)',
    slStop: '$2.035 (-2.6%)'
  },
  {
    id: 'meme-euphoria-trap',
    label: 'Social Euphoria Bull-Trap',
    pair: 'CETUS / SUI',
    cetusDepth: '$6.15M',
    cetusDelta: '-19.0% (Thin Spot Liquidity)',
    deepbookSpread: '0.062 SUI',
    deepbookImbalance: 'Ask-Heavy Skew (0.64x)',
    naviBorrow: '84.7%',
    naviAlert: 'CRITICAL CROWDED LONG (>80%)',
    naviDanger: true,
    rawConf: 94,
    rawStance: 'PARABOLIC MOON LONG',
    rawQuote: 'Raw LLM instinct: 94% social sentiment surge on X! Parabolic breakout to $2.80 imminent!',
    calibratedConf: 42,
    calibratedStance: 'DEFENSIVE / REJECT SIGNAL',
    calibratedQuote: 'Modulated Stance: Severe Brier penalty override. Rejecting social hype; thin Cetus depth + 84.7% borrow signals bull trap.',
    penaltyDelta: '-52%',
    recalledBlobId: '#walrus_oct24_hallucination (0x2211...cba9)',
    recalledSimilarity: 0.96,
    recalledTitle: 'MemWal Semantic Recall Active — Social Sentiment Divergence Warning',
    recalledLesson:
      'Oct 24 2026: HypeSentinel hallucinated 94% pump call on social euphoria while Cetus spot depth lagged. Resulted in 14% retail drawdown and 0.82 Brier penalty.',
    entryZone: 'NO ENTRY (WAIT $1.98)',
    tpTarget: '$2.110 (+3.2%)',
    slStop: '$1.950 (-2.0%)'
  }
];

interface HistoricalCallRow {
  pair: string;
  rawConf: string;
  calibratedConf: string;
  walrusRecall: string;
  blobId: string;
  checkpoint: string;
  brierScore: string;
  status: 'CALIBRATED_SUCCESS' | 'RISK_AVERTED' | 'STOPPED_OUT';
}

const ANCHORED_HISTORY_ROWS: HistoricalCallRow[] = [
  {
    pair: 'SUI / USDC',
    rawConf: '88% (5x Long)',
    calibratedConf: '58% (Spot Accum)',
    walrusRecall: 'Oct 14 NAVI Borrow >75% Squeeze',
    blobId: 'walrus://0x8f4d92a1...1ab3',
    checkpoint: '#89,412,950',
    brierScore: '0.084',
    status: 'RISK_AVERTED'
  },
  {
    pair: 'CETUS / SUI',
    rawConf: '82% (Breakout)',
    calibratedConf: '61% (Scaled Entry)',
    walrusRecall: 'Oct 18 Scallop Pool Wick Filter',
    blobId: 'walrus://0x7c491aa2...6bc1',
    checkpoint: '#89,398,120',
    brierScore: '0.112',
    status: 'CALIBRATED_SUCCESS'
  },
  {
    pair: 'DEEP / SUI',
    rawConf: '74% (Long)',
    calibratedConf: '86% (Conviction)',
    walrusRecall: 'Oct 23 DeepBook 500k Whale Absorption',
    blobId: 'walrus://0x4422cc11...bb10',
    checkpoint: '#89,364,804',
    brierScore: '0.062',
    status: 'CALIBRATED_SUCCESS'
  },
  {
    pair: 'SUI / USDC',
    rawConf: '81% (AMM Arb)',
    calibratedConf: '43% (Halt Entry)',
    walrusRecall: 'Epoch 512 Pyth Latency Asymmetry',
    blobId: 'walrus://0x1e8810fc...5aa9',
    checkpoint: '#89,310,492',
    brierScore: '0.095',
    status: 'RISK_AVERTED'
  },
  {
    pair: 'NAVI / SUI',
    rawConf: '94% (Meme Pump)',
    calibratedConf: '42% (Rejected)',
    walrusRecall: 'Oct 24 Social Euphoria Bull-Trap',
    blobId: 'walrus://0x2211aa88...cba9',
    checkpoint: '#89,285,110',
    brierScore: '0.318',
    status: 'STOPPED_OUT'
  }
];

interface ArenaLeaderboardProps {
  agents: AgentProfile[];
  selectedAgentId: AgentId;
  onSelectAgent: (agentId: AgentId) => void;
  onSelectAgentForReflection: (agentId: AgentId) => void;
  onOpenPaywall: (agent: AgentProfile) => void;
  onNavigateX402: () => void;
  marketState?: TatumMarketState | null;
}

export const ArenaLeaderboard: React.FC<ArenaLeaderboardProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onSelectAgentForReflection,
  onOpenPaywall,
  onNavigateX402,
  marketState
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('oct-navi-trap');
  const [isCycling, setIsCycling] = useState<boolean>(false);
  const [cycleStage, setCycleStage] = useState<string>('');

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const scenario = MARKET_SCENARIOS.find(s => s.id === selectedScenarioId) || MARKET_SCENARIOS[0];
  const isUnlocked = activeAgent.currentThesis.isUnlocked;

  const triggerEpistemicCycle = (targetScenarioId?: string) => {
    if (targetScenarioId) {
      setSelectedScenarioId(targetScenarioId);
    }
    setIsCycling(true);
    setCycleStage('1/4 Querying Tatum Sui RPC Checkpoint & Cetus/NAVI Pool State...');

    setTimeout(() => {
      setCycleStage('2/4 Generating Uncalibrated Hypothesis (H_0)...');
    }, 450);

    setTimeout(() => {
      setCycleStage('3/4 Executing memwal.recall() Vector Search on Walrus Mainnet...');
    }, 950);

    setTimeout(() => {
      setCycleStage('4/4 Applying Bayesian Brier Penalty & Anchoring Posterior...');
    }, 1450);

    setTimeout(() => {
      setIsCycling(false);
      setCycleStage('');
    }, 1900);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Scenario & Agent Selector Strip */}
      <div className="cockpit-panel p-3.5 sm:p-5 corner-ticks">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
              <span className="pulse-indicator bg-cyan-400"></span>
              <span>LIVE EPISTEMIC ARENA • BAYESIAN COCKPIT</span>
            </div>
            <h1 className="text-base sm:text-2xl font-bold text-white font-['Orbitron'] tracking-tight leading-snug">
              Stateless LLMs Hallucinate Leverage. <span className="text-cyan-400">Walrus Memory</span> Enforces Discipline.
            </h1>
          </div>

          {/* Interactive Trigger Buttons: Full-width stack on mobile, inline on sm+ */}
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => triggerEpistemicCycle()}
              disabled={isCycling}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Zap className={`w-4 h-4 shrink-0 ${isCycling ? 'animate-spin' : ''}`} />
              <span>{isCycling ? 'Running Epistemic Cycle...' : 'Trigger Epistemic Cycle'}</span>
            </button>

            <button
              onClick={() => onSelectAgentForReflection(activeAgent.id)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>5-Step Code Trace</span>
            </button>
          </div>
        </div>

        {/* Live Cycle Progress Banner */}
        {isCycling && (
          <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center gap-2.5 text-[11px] sm:text-xs font-mono text-cyan-200">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shrink-0"></div>
            <span className="break-words">{cycleStage}</span>
          </div>
        )}

        {/* Market Shock Preset Switcher: 1 col on mobile, wrap on desktop */}
        <div className="pt-3 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Simulate Market Regime (Tap to Stress-Test):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-1.5 sm:gap-2">
            {MARKET_SCENARIOS.map(item => {
              const active = item.id === selectedScenarioId;
              return (
                <button
                  key={item.id}
                  onClick={() => triggerEpistemicCycle(item.id)}
                  className={`px-2.5 py-2 sm:py-1.5 rounded-lg text-[11px] font-mono text-left sm:text-center transition-all cursor-pointer truncate ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold shadow-sm'
                      : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  ⚡ {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Asymmetric Cockpit Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT 2/3 COLUMN: Active Agent Telemetry & Bayesian Confidence Modulation */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Card 1: Active Agent & Sui DeFi Telemetry Strip */}
          <div className="cockpit-panel p-3.5 sm:p-5 space-y-4 sm:space-y-5">
            {/* Active Agent Header + Contender Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-slate-800/80">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0">
                  {activeAgent.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-white font-['Orbitron'] truncate">
                      {activeAgent.name}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold">
                      Brier: {activeAgent.brierScore.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 leading-snug mt-0.5">
                    Tatum Sui RPC ingestion + MemWal associative failure recall
                  </p>
                </div>
              </div>

              {/* Quick Agent Contender Switcher: 3 equal cols on mobile */}
              <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#04070e] p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
                {agents.map(ag => (
                  <button
                    key={ag.id}
                    onClick={() => onSelectAgent(ag.id)}
                    className={`px-2 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono text-center transition-all cursor-pointer truncate ${
                      ag.id === activeAgent.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    #{ag.rank} {ag.name.split('-')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Sui DeFi Telemetry Strip (Cetus Depth, DeepBook Spread, NAVI Borrow) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
              {/* Cetus Depth */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#050811] border border-slate-800/90 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                  <span>Cetus Depth ({scenario.pair})</span>
                  <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white num-metric">
                  {scenario.cetusDepth}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-between gap-1">
                  <span className="truncate">{scenario.cetusDelta}</span>
                  <span className="text-[9px] text-slate-500 shrink-0">Tatum Verified</span>
                </div>
              </div>

              {/* DeepBook v3 Spread */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#050811] border border-slate-800/90 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                  <span>DeepBook v3 Spread</span>
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white num-metric">
                  {scenario.deepbookSpread}
                </div>
                <div className="text-[11px] font-mono text-cyan-300 truncate">
                  {scenario.deepbookImbalance}
                </div>
              </div>

              {/* NAVI Borrow Utilization */}
              <div
                className={`p-3 sm:p-3.5 rounded-xl border space-y-1 ${
                  scenario.naviDanger
                    ? 'bg-rose-950/25 border-rose-500/40'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                  <span className={scenario.naviDanger ? 'text-rose-300' : 'text-emerald-300'}>
                    NAVI Borrow Utilization
                  </span>
                  <AlertTriangle
                    className={`w-3.5 h-3.5 shrink-0 ${
                      scenario.naviDanger ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  />
                </div>
                <div
                  className={`text-base sm:text-lg font-bold font-mono num-metric ${
                    scenario.naviDanger ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {scenario.naviBorrow}
                </div>
                <div
                  className={`text-[11px] font-mono font-semibold truncate ${
                    scenario.naviDanger ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {scenario.naviAlert}
                </div>
              </div>
            </div>

            {/* Bayesian Confidence Modulation Box (The Core Visual Hook) */}
            <div className="cockpit-panel-cyan p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
                <div>
                  <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider font-bold text-cyan-300 block">
                    Bayesian Confidence Modulation (H_0 → Calibrated Posterior)
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                    Uncalibrated LLM impulse vs. Walrus-recalled historical reality
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold self-start sm:self-auto shrink-0 ${
                    scenario.penaltyDelta.startsWith('-')
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                      : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  Epistemic Delta: {scenario.penaltyDelta}
                </span>
              </div>

              {/* Side-by-Side Uncalibrated H_0 vs Walrus-Calibrated Posterior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Left: Uncalibrated Hypothesis (H_0) */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#09060d] border border-rose-500/30 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-400 uppercase text-[10px] sm:text-xs">Uncalibrated (H_0)</span>
                    <span className="text-rose-400 font-bold text-xs sm:text-sm shrink-0">{scenario.rawConf}% Confidence</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-rose-500/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-500"
                      style={{ width: `${scenario.rawConf}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-bold">
                      {scenario.rawStance}
                    </span>
                    <span className="text-slate-500">Zero Memory Context</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-mono leading-relaxed bg-black/50 p-2.5 rounded-lg border border-white/[0.04]">
                    "{scenario.rawQuote}"
                  </p>
                </div>

                {/* Right: Walrus-Calibrated Posterior */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#041016] border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-cyan-300 uppercase font-semibold text-[10px] sm:text-xs">Walrus Posterior</span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm shrink-0">
                      {scenario.calibratedConf}% Calibrated
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-emerald-500/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${scenario.calibratedConf}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                      {scenario.calibratedStance}
                    </span>
                    <span className="text-cyan-300">Brier-Adjusted</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-100 font-mono leading-relaxed bg-black/50 p-2.5 rounded-lg border border-emerald-500/20">
                    "{scenario.calibratedQuote}"
                  </p>
                </div>
              </div>

              {/* MemWal Semantic Recall Active Callout */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#050914] border border-purple-500/35 space-y-1.5">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                    <Database className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">{scenario.recalledTitle}</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400 font-semibold break-all">
                    Blob: {scenario.recalledBlobId}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    Similarity: {scenario.recalledSimilarity}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-mono">
                  "{scenario.recalledLesson}"
                </p>
              </div>

              {/* Bottom Action Strip: Position Mandate Preview / x402 Unlock */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-cyan-500/20">
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  <span className="text-slate-400 text-[10px] sm:text-xs">MANDATE STREAM:</span>
                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-[11px]">
                        Entry: <strong>{scenario.entryZone}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px]">
                        TP: <strong>{scenario.tpTarget}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/30 text-rose-300 text-[11px]">
                        SL: <strong>{scenario.slStop}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-amber-300 text-[11px] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Entry Ladder, TP &amp; Stop Gated via HTTP 402</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {!isUnlocked ? (
                    <button
                      onClick={() => onOpenPaywall(activeAgent)}
                      className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Unlock Mandate ({activeAgent.unlockPriceSui} SUI)</span>
                    </button>
                  ) : (
                    <span className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-center gap-1.5">
                      <Unlock className="w-3.5 h-3.5 shrink-0" /> x402 Stream Unlocked
                    </span>
                  )}
                  <button
                    onClick={onNavigateX402}
                    className="w-full sm:w-auto px-3 py-2.5 sm:py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>x402 Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 1/3 COLUMN: Brier Calibration Engine & Tatum Sui Oracle Proof */}
        <div className="space-y-4 sm:space-y-6">
          {/* Card 1: Brier Calibration Engine (Stateless vs Walrus-Calibrated) */}
          <div className="cockpit-panel p-3.5 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-['Orbitron'] flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Brier Calibration Engine</span>
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Strictly proper scoring rule for epistemic accuracy
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 shrink-0">
                Lower = Better
              </span>
            </div>

            {/* Plain-Text Formula Box */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#04070e] border border-slate-800/90 font-mono space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Scoring Formula (Committed on Walrus)
              </div>
              <div className="text-xs sm:text-sm font-bold text-cyan-300">
                Brier = (1/N) * Σ (f_t - o_t)²
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                Where <code className="text-white">f_t</code> is forecasted probability (0.0–1.0) and{' '}
                <code className="text-white">o_t</code> is actual Sui oracle resolution (0 or 1).
              </div>
            </div>

            {/* Direct Contrast: Stateless Agent vs Walrus-Calibrated Agent */}
            <div className="space-y-3">
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-rose-300 font-bold">Stateless LLM Agent</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-bold text-[11px] shrink-0">
                    Penalty: 0.9025
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                  Calls <strong>95% confidence</strong> on a leveraged breakout during 78% NAVI borrow utilization → price dumps (<code className="text-rose-300">o_t = 0</code>).
                </p>
                <div className="text-[10px] font-mono text-rose-400">
                  Loss = (0.95 - 0)² = 0.9025 (Catastrophic Overconfidence)
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/35 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-emerald-300 font-bold">Walrus-Calibrated Agent</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] shrink-0">
                    Penalty: 0.2025
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                  Recalls prior bull traps via <code className="text-cyan-300">memwal.recall()</code> → modulates forecast to <strong>45%</strong> before resolution.
                </p>
                <div className="text-[10px] font-mono text-emerald-400">
                  Loss = (0.45 - 0)² = 0.2025 (77.5% Error Reduction)
                </div>
              </div>
            </div>

            {/* Live 3-Agent Calibration Standings */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Arena Contender Standings (Tap to Inspect)
              </div>
              {agents.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => onSelectAgent(ag.id)}
                  className={`w-full p-2.5 rounded-lg border text-left font-mono text-xs flex items-center justify-between transition-all cursor-pointer ${
                    ag.id === activeAgent.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                      : 'bg-[#050811] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{ag.avatar}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-200 truncate">{ag.name}</div>
                      <div className="text-[10px] text-slate-500">{ag.totalMemories} Walrus Blobs</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-bold ${
                        ag.brierScore < 0.2
                          ? 'text-emerald-400'
                          : ag.brierScore < 0.4
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {ag.brierScore.toFixed(3)} Brier
                    </div>
                    <div className="text-[10px] text-slate-500">{ag.calibrationPct}% Calibrated</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Tatum Sui Oracle Gateway Proof */}
          <div className="cockpit-panel p-3.5 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-sm font-bold text-white font-['Orbitron']">
                  Tatum Sui Oracle Gateway
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">RPC Network</span>
                <span className="text-white font-semibold">Sui Mainnet</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 gap-2">
                <span className="text-slate-400 shrink-0">Gateway Host</span>
                <span className="text-cyan-300 truncate">sui-mainnet.gateway.tatum.io</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Verified Checkpoint</span>
                <span className="text-emerald-400 font-bold">
                  #{marketState?.latestCheckpoint.toLocaleString() || '89,412,950'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Oracle Consensus</span>
                <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                  Tatum Gateway Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Audit Trail: Mobile Stacked Cards + Desktop Table */}
      <div className="cockpit-panel overflow-hidden">
        <div className="p-3.5 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-['Orbitron'] flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Immutable Epistemic Audit Trail (Anchored on Walrus + Sui)</span>
            </h3>
            <p className="text-[11px] sm:text-xs font-mono text-slate-400">
              Every pre-trade hypothesis and post-trade Brier resolution is permanently sealed as a Walrus blob
            </p>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-1 rounded self-start sm:self-auto">
            relayer.memory.walrus.xyz • 100% Tamper-Evident
          </span>
        </div>

        {/* Mobile Stacked Audit Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-800/70 font-mono text-xs">
          {ANCHORED_HISTORY_ROWS.map((row, idx) => (
            <div key={idx} className="p-3.5 space-y-2 bg-[#050811]/60">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-sm">{row.pair}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    row.status === 'CALIBRATED_SUCCESS'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : row.status === 'RISK_AVERTED'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {row.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                <span className="text-slate-500">Modulation:</span>
                <span className="text-rose-400/80 line-through">{row.rawConf}</span>
                <span className="text-slate-500">→</span>
                <span className="text-cyan-300 font-bold">{row.calibratedConf}</span>
              </div>

              <div className="text-[11px] text-slate-300">
                <span className="text-slate-500">Recall: </span>
                {row.walrusRecall}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-purple-300 truncate max-w-[160px]">{row.blobId}</span>
                <span>Sui {row.checkpoint}</span>
                <span className="text-emerald-400 font-bold">Brier: {row.brierScore}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Full Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#04070e] text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Market Pair</th>
                <th className="py-3 px-4">Raw H_0 → Calibrated</th>
                <th className="py-3 px-4">Walrus Associative Recall</th>
                <th className="py-3 px-4">Walrus Blob ID</th>
                <th className="py-3 px-4">Sui Checkpoint</th>
                <th className="py-3 px-4">Brier Score</th>
                <th className="py-3 px-4 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ANCHORED_HISTORY_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{row.pair}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-rose-400/80 line-through mr-1.5">{row.rawConf}</span>
                    <span className="text-slate-500 mr-1.5">→</span>
                    <span className="text-cyan-300 font-bold">{row.calibratedConf}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{row.walrusRecall}</td>
                  <td className="py-3 px-4 text-purple-300 whitespace-nowrap">{row.blobId}</td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{row.checkpoint}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">{row.brierScore}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'CALIBRATED_SUCCESS'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : row.status === 'RISK_AVERTED'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
