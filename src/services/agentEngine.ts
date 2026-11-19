import type {
  EpistemicEvaluation,
  HistoricalBrierRow,
  RiskCalibrationPolicy
} from '../types';
import {
  computeRiskCalibration,
  DEFAULT_RISK_POLICY,
  normalizePolicy,
  roundHalf
} from './riskPolicy';
import { walrusMemory } from './walrusMemory';
import { tatumSui } from './tatumSui';

export interface MarketRegimePreset {
  id: string;
  name: string;
  pair: string;
  cetusDepth: string;
  cetusVolume1h: string;
  deepBookSpread: string;
  naviBorrowPct: number;
  conditionDescription: string;
  statelessConfidence: number;
  statelessStance: string;
  statelessQuote: string;
  searchQuery: string;
  calibratedConfidence: number;
  calibratedStance: string;
  calibratedQuote: string;
  actualOutcome: Exclude<EpistemicEvaluation['actualOutcome'], 'UNKNOWN_UNRESOLVED'>;
  outcomeNumeric: number; // 0 or 1
  outcomeLabel: string;
}

export const MARKET_REGIMES: MarketRegimePreset[] = [
  {
    id: 'oct-navi-trap',
    name: 'Oct 14 NAVI Borrow Trap (78.4%)',
    pair: 'SUI/USDC',
    cetusDepth: '$18.42M',
    cetusVolume1h: '$14.2M (+18%)',
    deepBookSpread: '0.018 SUI (1.62x Imbalance)',
    naviBorrowPct: 78.4,
    conditionDescription: 'High spot volume breakout accompanied by extreme leverage borrow utilization (>75%)',
    statelessConfidence: 88,
    statelessStance: 'AGGRESSIVE 5X LONG',
    statelessQuote: 'Raw LLM: Cetus 1h volume crossed $14M! Breakout confirmed above $0.85, deploying maximum leverage.',
    searchQuery: 'SUI breakout Cetus $14.2M NAVI borrow crowding >75% long-squeeze',
    calibratedConfidence: 46,
    calibratedStance: 'CAUTIOUS SPOT ACCUMULATION',
    calibratedQuote: 'Walrus Recalled: Oct 14 incident matched. Borrow >75% previously triggered 8% long-squeeze cascade. Leverage stripped.',
    actualOutcome: 'DUMP_LONG_SQUEEZE',
    outcomeNumeric: 0,
    outcomeLabel: 'Price dumped -8.2% in 40m (Longs Squeezed)'
  },
  {
    id: 'pyth-epoch-latency',
    name: 'Epoch 512 Pyth Latency Drift',
    pair: 'SUI/USDC',
    cetusDepth: '$11.90M',
    cetusVolume1h: '$6.8M (-8%)',
    deepBookSpread: '0.044 SUI (Spread Widened)',
    naviBorrowPct: 64.1,
    conditionDescription: 'Sui epoch boundary transition (epoch 512) causing 40-sec AMM price resolution lag',
    statelessConfidence: 81,
    statelessStance: 'AMM ARBITRAGE LONG',
    statelessQuote: 'Raw LLM: Spot discount on Cetus pool relative to reference price! Immediate directional buy.',
    searchQuery: 'Pyth oracle latency epoch 512 AMM discount',
    calibratedConfidence: 41,
    calibratedStance: 'HALT / DELTA-NEUTRAL',
    calibratedQuote: 'Walrus Recalled: Epoch boundary latency causes artificial pricing asymmetry. Invalidation active until checkpoint finality.',
    actualOutcome: 'ORACLE_WICK_REVERSAL',
    outcomeNumeric: 0,
    outcomeLabel: 'Oracle latency snapped back; breakout traders trapped'
  },
  {
    id: 'cetus-institutional-breakout',
    name: 'Cetus $24M Organic Institutional Trend',
    pair: 'SUI/USDC',
    cetusDepth: '$24.60M',
    cetusVolume1h: '$24.1M (+32%)',
    deepBookSpread: '0.009 SUI (0.12% Whale Absorption)',
    naviBorrowPct: 48.2,
    conditionDescription: 'Institutional volume surge with low borrow leverage (<55%) and tight order book spread',
    statelessConfidence: 74,
    statelessStance: 'MODERATE LONG',
    statelessQuote: 'Raw LLM: Upward price drift. Normal continuation pattern.',
    searchQuery: 'SUI institutional breakout Cetus DeepBook spread spot bid absorption',
    calibratedConfidence: 86,
    calibratedStance: 'HIGH-CONVICTION CALL LADDER',
    calibratedQuote: 'Walrus Recalled: Oct 16 catalyst matched. Low borrow (<52%) + DeepBook whale absorption sustained +14.6% trend.',
    actualOutcome: 'BREAKOUT_CONTINUATION',
    outcomeNumeric: 1,
    outcomeLabel: 'SUI surged +12.4% over next 24 hours'
  },
  {
    id: 'meme-euphoria-trap',
    name: 'Social Euphoria Bull-Trap',
    pair: 'CETUS/SUI',
    cetusDepth: '$6.15M',
    cetusVolume1h: '$3.1M (-19%)',
    deepBookSpread: '0.062 SUI (Ask Heavy 0.64x)',
    naviBorrowPct: 84.7,
    conditionDescription: 'Viral retail social sentiment spike without supporting DEX liquidity depth',
    statelessConfidence: 94,
    statelessStance: 'PARABOLIC MOMENTUM LONG',
    statelessQuote: 'Raw LLM: +340% social mention velocity on Twitter! Parabolic pump to $2.80 imminent!',
    searchQuery: 'CETUS retail social euphoria spike DeepBook bid depth bull-trap',
    calibratedConfidence: 42,
    calibratedStance: 'DEFENSIVE REJECTION',
    calibratedQuote: 'Walrus Recalled: Oct 24 social hallucination pattern (0.82 Brier loss). Rejection rule active; retail dump imminent.',
    actualOutcome: 'DUMP_LONG_SQUEEZE',
    outcomeNumeric: 0,
    outcomeLabel: 'Token dropped -16% within 2 hours of social peak'
  }
];

export const HISTORICAL_BENCHMARK_ROWS: HistoricalBrierRow[] = [
  {
    checkpoint: '#89,412,950',
    pair: 'SUI/USDC',
    condition: 'Oct 14 NAVI Borrow 78.4%',
    statelessForecast: '88% (5x Long)',
    walrusForecast: '46% (Spot Accum)',
    recalledBlob: 'walrus://thAHmeWQ...r6R0',
    outcome: 'DUMP (o=0)',
    statelessBrier: 0.774,
    walrusBrier: 0.212,
    advantage: '72.6% Error Cut'
  },
  {
    checkpoint: '#89,398,120',
    pair: 'SUI/USDC',
    condition: 'Oct 16 Cetus $24M Breakout',
    statelessForecast: '74% (Mod Long)',
    walrusForecast: '86% (High Conviction)',
    recalledBlob: 'walrus://1ZOLBULV...oiJM',
    outcome: 'PUMP (o=1)',
    statelessBrier: 0.068,
    walrusBrier: 0.020,
    advantage: '70.5% Error Cut'
  },
  {
    checkpoint: '#89,364,804',
    pair: 'CETUS/SUI',
    condition: 'Oct 18 Scallop Pool Wick',
    statelessForecast: '82% (Breakout)',
    walrusForecast: '44% (Filter Active)',
    recalledBlob: 'walrus://qlvh2ujy...Kr5E',
    outcome: 'DUMP (o=0)',
    statelessBrier: 0.672,
    walrusBrier: 0.194,
    advantage: '71.1% Error Cut'
  },
  {
    checkpoint: '#89,310,492',
    pair: 'SUI/USDC',
    condition: 'Epoch 512 Pyth Latency',
    statelessForecast: '81% (AMM Arb)',
    walrusForecast: '41% (Halt Entry)',
    recalledBlob: 'walrus://BamlyvKW...A2z8',
    outcome: 'CHOP (o=0)',
    statelessBrier: 0.656,
    walrusBrier: 0.168,
    advantage: '74.4% Error Cut'
  },
  {
    checkpoint: '#89,285,110',
    pair: 'NAVI/SUI',
    condition: 'Oct 24 Social Euphoria',
    statelessForecast: '94% (Parabolic)',
    walrusForecast: '42% (Reject)',
    recalledBlob: 'walrus://gi3MnkJ1...NxW0',
    outcome: 'DUMP (o=0)',
    statelessBrier: 0.884,
    walrusBrier: 0.176,
    advantage: '80.1% Error Cut'
  }
];

const POLICY_STORAGE_KEY = 'roguetrader-risk-policy';

export interface EvaluationTradeMeta {
  asset?: string;
  leverage?: number;
  side?: 'Long' | 'Short';
  isSuiTrackedAsset?: boolean;
  marketMode?: 'live' | 'stress_replay';
  liveMarket?: import('../types').TatumMarketState | null;
}

class AgentEngineService {
  private activeEvaluation: EpistemicEvaluation | null = null;
  private llmApiKey: string = import.meta.env.VITE_LLM_API_KEY || '';
  private policy: RiskCalibrationPolicy = this.loadPolicy();

  private loadPolicy(): RiskCalibrationPolicy {
    if (typeof window === 'undefined') return { ...DEFAULT_RISK_POLICY };
    try {
      const saved = window.localStorage.getItem(POLICY_STORAGE_KEY);
      if (saved) {
        return normalizePolicy(JSON.parse(saved));
      }
    } catch {
      // Ignore malformed storage
    }
    return { ...DEFAULT_RISK_POLICY };
  }

  public getPolicy(): RiskCalibrationPolicy {
    return { ...this.policy };
  }

  public setPolicy(override: Partial<RiskCalibrationPolicy>): RiskCalibrationPolicy {
    this.policy = normalizePolicy({ ...this.policy, ...override });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(this.policy));
      } catch {
        // Ignore storage errors
      }
    }
    return this.getPolicy();
  }

  public resetPolicy(): RiskCalibrationPolicy {
    this.policy = { ...DEFAULT_RISK_POLICY };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(POLICY_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    return this.getPolicy();
  }

  private async queryGeminiGuard(
    tradeText: string,
    recalledMemoryText: string,
    fallbackConfidence: number,
    fallbackQuote: string,
    maxConfidenceAllowed: number
  ): Promise<{ confidence: number; rationale: string }> {
    if (!this.llmApiKey) {
      return { confidence: fallbackConfidence, rationale: fallbackQuote };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3800);
      const prompt = `You are RogueTrader, a pre-trade risk guard on Sui.
A trader wants to execute: "${tradeText}".
We recalled this past blowup from Walrus decentralized memory: "${recalledMemoryText}".
Respond ONLY with valid JSON in this exact format:
{"confidence": <integer 35 to ${maxConfidenceAllowed}>, "rationale": "<1 concise plain-English sentence under 140 chars explaining how this past Walrus memory adjusts their trade size>"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.llmApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
          })
        }
      );
      clearTimeout(timeout);
      if (!res.ok) return { confidence: fallbackConfidence, rationale: fallbackQuote };
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return { confidence: fallbackConfidence, rationale: fallbackQuote };
      const parsed = JSON.parse(rawText);
      const confidence =
        typeof parsed.confidence === 'number'
          ? Math.max(30, Math.min(maxConfidenceAllowed, Math.round(parsed.confidence)))
          : fallbackConfidence;
      const rationale =
        typeof parsed.rationale === 'string' && parsed.rationale.trim().length > 10
          ? parsed.rationale.trim()
          : fallbackQuote;
      return { confidence, rationale };
    } catch {
      return { confidence: fallbackConfidence, rationale: fallbackQuote };
    }
  }

  public async runEvaluationCycle(
    regimeId: string | null,
    onProgress?: (stage: string, stepNumber: number) => void,
    tradeText?: string,
    tradeMeta?: EvaluationTradeMeta,
    policyOverride?: Partial<RiskCalibrationPolicy>
  ): Promise<EpistemicEvaluation> {
    const activePolicy = normalizePolicy({ ...this.policy, ...policyOverride });
    const isStressReplay = tradeMeta?.marketMode === 'stress_replay' && Boolean(regimeId);
    const regime = regimeId ? MARKET_REGIMES.find(r => r.id === regimeId) ?? null : null;
    const marketMode: 'live' | 'stress_replay' = isStressReplay ? 'stress_replay' : 'live';
    const proposedLeverage = tradeMeta?.leverage ?? 3;
    const asset = tradeMeta?.asset ?? (regime ? regime.pair.split('/')[0] : 'UNKNOWN');
    const side = tradeMeta?.side ?? 'Long';
    const isSuiTrackedAsset = tradeMeta?.isSuiTrackedAsset ?? Boolean(regime);

    // Stage 1: Read live Sui block + live NAVI borrow utilization via Tatum GraphQL
    if (onProgress) onProgress('Reading live Sui block & NAVI borrow rate…', 1);
    const liveMarket = tradeMeta?.liveMarket ?? (await tatumSui.getMarketState());
    const checkpoint = liveMarket.latestCheckpoint;
    const liveNaviUtil =
      marketMode === 'live' && isSuiTrackedAsset ? liveMarket.navi.borrowUtilizationPct : null;
    const liveNaviApr =
      marketMode === 'live' && isSuiTrackedAsset ? liveMarket.navi.borrowAprPct : null;

    // Stage 2: Formulate Blind Sizing (without memory)
    if (onProgress) onProgress('Checking blind trade size…', 2);

    const statelessConfidence =
      isStressReplay && regime
        ? regime.statelessConfidence
        : Math.min(92, 72 + Math.round(proposedLeverage * 3));
    const statelessStance =
      isStressReplay && regime
        ? regime.statelessStance
        : `${side.toUpperCase()} ${proposedLeverage}X ${asset}`;
    const statelessRationale =
      isStressReplay && regime
        ? regime.statelessQuote
        : `Stateless model (no memory): Sizes ${side} ${asset} ${proposedLeverage}x purely on directional thesis without historical regime context.`;

    // Stage 3: Query Walrus Memory Relayer (Top 3 Semantic Matches with relevance gating)
    if (onProgress) onProgress('Searching past blowups on Walrus…', 3);
    const baseQuery =
      isStressReplay && regime
        ? regime.searchQuery
        : tradeText?.trim() || `${side} ${asset}`;
    const enrichedQuery =
      marketMode === 'live' && liveNaviUtil != null && liveNaviUtil >= 75
        ? `${baseQuery} NAVI borrow crowding ${liveNaviUtil.toFixed(1)}% long-squeeze`
        : baseQuery;
    const recallResult = await walrusMemory.recall(enrichedQuery, 3, activePolicy);

    // Stage 4: Deterministic 3-state calibration policy + live NAVI overheat guardrail
    if (onProgress) onProgress('Calculating adjusted leverage…', 4);
    const calibration = computeRiskCalibration({
      proposedLeverage,
      statelessConfidence,
      ranked: {
        results: recallResult.results,
        allCandidates: recallResult.allCandidates,
        topSimilarity: recallResult.topSimilarity,
        matchQuality: recallResult.matchQuality
      },
      policy: activePolicy,
      strongCalibratedStanceOverride: isStressReplay ? regime?.calibratedStance : undefined,
      liveNaviUtilizationPct: liveNaviUtil,
      isSuiTrackedAsset
    });

    let finalConfidence = calibration.walrusConfidence;
    let finalRationale = calibration.walrusRationale;
    let finalShortExplanation = calibration.shortExplanation;
    let finalLeverage = calibration.calibratedLeverage;

    // Optionally enrich narrative only when a genuine Walrus memory matched (deterministic code still bounds leverage)
    if (calibration.recalledMemory && calibration.matchQuality === 'STRONG_MATCH' && !calibration.liveNaviApplied) {
      const dynamicFallbackQuote =
        calibration.recalledMemory.origin === 'LIVE_OUTCOME' || calibration.recalledMemory.id.startsWith('wal-')
          ? `Matched your resolved trade outcome (${Math.round(calibration.recalledMemory.similarityScore * 100)}% match): "${calibration.recalledMemory.text}"`
          : calibration.walrusRationale;

      const maxAllowed = calibration.recalledMemory.category === 'CATALYST' ? 90 : 75;
      const llmEval = await this.queryGeminiGuard(
        tradeText || regime?.name || baseQuery,
        calibration.recalledMemory.text,
        calibration.walrusConfidence,
        dynamicFallbackQuote,
        maxAllowed
      );
      finalConfidence = llmEval.confidence;
      finalRationale = llmEval.rationale;
      if (this.llmApiKey && llmEval.rationale !== dynamicFallbackQuote) {
        finalShortExplanation = llmEval.rationale;
      }
      if (calibration.recalledMemory.category !== 'CATALYST' && proposedLeverage > 1) {
        finalLeverage = Math.max(
          1,
          Math.min(proposedLeverage, roundHalf(proposedLeverage * (finalConfidence / statelessConfidence)))
        );
      }
    }

    // Compute Brier penalties strictly when replaying a known settled benchmark or matching a settled memory
    let actualOutcome: EpistemicEvaluation['actualOutcome'] = 'UNKNOWN_UNRESOLVED';
    let statelessBrier: number | null = null;
    let walrusBrier: number | null = null;

    if (calibration.matchQuality === 'STRONG_MATCH' && calibration.recalledMemory && isStressReplay && regime) {
      const isPositiveCatalyst = calibration.recalledMemory.category === 'CATALYST';
      actualOutcome = regime.actualOutcome;
      const outcomeNumeric = isPositiveCatalyst ? 1 : 0;
      statelessBrier = Number(Math.pow(statelessConfidence / 100 - outcomeNumeric, 2).toFixed(4));
      walrusBrier = Number(Math.pow(finalConfidence / 100 - outcomeNumeric, 2).toFixed(4));
    }

    const formattedLiveVol =
      liveMarket.cetusVolume24h > 0
        ? `$${(liveMarket.cetusVolume24h / 1_000_000).toFixed(2)}M (24h DEX)`
        : 'Live Sui DEX';

    const evalResult: EpistemicEvaluation = {
      id: `eval-${Date.now()}`,
      scenarioId: isStressReplay && regime ? regime.id : null,
      marketMode,
      pair: isStressReplay && regime ? regime.pair : isSuiTrackedAsset ? `${asset}/USDC` : asset,
      timestamp: new Date().toISOString(),
      tatumCheckpoint: checkpoint,
      cetusVolume1h:
        isStressReplay && regime
          ? regime.cetusVolume1h
          : isSuiTrackedAsset
            ? formattedLiveVol
            : 'External asset',
      deepBookSpreadBps:
        isStressReplay && regime
          ? regime.deepBookSpread
          : liveMarket.volatility1h != null && isSuiTrackedAsset
            ? `${liveMarket.volatility1h.toFixed(2)}% 1h move`
            : 'Live market',
      naviBorrowPct: isStressReplay && regime ? regime.naviBorrowPct : liveNaviUtil,
      naviBorrowAprPct: isStressReplay ? null : liveNaviApr,
      liveNaviApplied: calibration.liveNaviApplied,
      statelessConfidence,
      statelessStance,
      statelessRationale,
      statelessBrierPenalty: statelessBrier,
      walrusConfidence: finalConfidence,
      walrusStance: calibration.walrusStance,
      walrusRationale: finalRationale,
      shortExplanation: finalShortExplanation,
      walrusBrierPenalty: walrusBrier,
      recalledMemory: calibration.recalledMemory,
      recalledMemories: recallResult.results,
      matchQuality: calibration.matchQuality,
      topCandidateSimilarity: calibration.topCandidateSimilarity,
      policyApplied: calibration.policyApplied,
      calibratedLeverage: finalLeverage,
      recallLatencyMs: recallResult.latencyMs,
      actualOutcome
    };

    this.activeEvaluation = evalResult;
    return evalResult;
  }

  public getActiveEvaluation(): EpistemicEvaluation | null {
    return this.activeEvaluation;
  }
}

export const agentEngine = new AgentEngineService();
