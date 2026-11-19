export type AgentMode = 'stateless' | 'walrus_calibrated';

export type RecallMatchQuality = 'STRONG_MATCH' | 'WEAK_MATCH' | 'UNFAMILIAR_REGIME';

export interface RiskCalibrationPolicy {
  /** Minimum similarity [0..1] required to trust recalled memory at full weight */
  strongMatchThreshold: number;
  /** Minimum similarity [0..1] required to treat a memory as a partial signal */
  weakMatchThreshold: number;
  /** Explicit deterministic max leverage when no historical match exists */
  unfamiliarMaxLeverage: number;
  /** Explicit confidence ceiling (%) when no historical match exists */
  unfamiliarConfidenceCap: number;
  /** Weight multiplier [0..1] applied to memory adjustments on weak/partial matches */
  weakMatchDampening: number;
  /** Deterministic max leverage on weak/partial matches without strong confirmation */
  weakMatchMaxLeverage: number;
}

export type MemoryOrigin = 'HISTORICAL_BENCHMARK' | 'LIVE_OUTCOME';

export interface WalrusMemoryItem {
  id: string;
  blobId: string;
  text: string;
  category: 'FAILURE_CASE' | 'REGIME_SHIFT' | 'CATALYST' | 'ORACLE_OUTCOME';
  origin?: MemoryOrigin;
  outcomeNumeric?: 0 | 1;
  timestamp: string;
  similarityScore: number;
  weightImpact: string;
  tatumCheckpoint?: number;
  latencyMs?: number;
}

export interface NaviBorrowMetrics {
  borrowUtilizationPct: number | null;
  borrowAprPct: number | null;
  supplyAprPct: number | null;
  isOverheated: boolean;
  source: 'tatum_sui_graphql' | 'public_sui_graphql' | 'defillama_live' | 'unavailable';
  reserveObjectId: string;
  fetchedAt: string;
}

export interface EpistemicEvaluation {
  id: string;
  scenarioId: string | null;
  marketMode: 'live' | 'stress_replay';
  pair: string;
  timestamp: string;
  tatumCheckpoint: number;
  cetusVolume1h: string;
  deepBookSpreadBps: string;
  naviBorrowPct: number | null;
  naviBorrowAprPct: number | null;
  liveNaviApplied: boolean;

  // Stateless Agent (Zero Memory)
  statelessConfidence: number; // e.g. 88%
  statelessStance: string; // "AGGRESSIVE 5X LONG"
  statelessRationale: string;
  statelessBrierPenalty: number | null; // null when unseen/unresolved

  // Walrus-Augmented Agent (With Persistent Memory)
  walrusConfidence: number; // e.g. 48%
  walrusStance: string; // "CAUTIOUS SPOT ACCUMULATION"
  walrusRationale: string;
  shortExplanation: string;
  walrusBrierPenalty: number | null; // null when unseen/unresolved
  recalledMemory: WalrusMemoryItem | null;
  recalledMemories: WalrusMemoryItem[];
  matchQuality: RecallMatchQuality;
  topCandidateSimilarity: number;
  policyApplied: string;
  calibratedLeverage: number;
  recallLatencyMs: number; // e.g. 1,080 ms

  actualOutcome:
    | 'DUMP_LONG_SQUEEZE'
    | 'BREAKOUT_CONTINUATION'
    | 'CHOP_DELTA_NEUTRAL'
    | 'ORACLE_WICK_REVERSAL'
    | 'UNKNOWN_UNRESOLVED';
}

export type ResolvedTradeOutcome = 'LIQUIDATED_OR_STOPPED' | 'SURVIVED_OR_TARGET_HIT';

export interface TradeOutcomeRecord {
  id: string;
  timestamp: string;
  tradeText: string;
  asset: string;
  side: 'Long' | 'Short';
  proposedLeverage: number;
  calibratedLeverage: number;
  statelessConfidence: number;
  walrusConfidence: number;
  outcome: ResolvedTradeOutcome;
  outcomeNumeric: 0 | 1;
  realizedMovePct: number;
  note: string;
  naviBorrowPct: number | null;
  tatumCheckpoint: number;
  walrusBlobId: string;
  statelessBrier: number;
  walrusBrier: number;
  origin: 'LIVE_OUTCOME';
}

export interface LiveBrierSummary {
  count: number;
  blowupsLogged: number;
  winsLogged: number;
  avgStatelessBrier: number | null;
  avgWalrusBrier: number | null;
  reductionPct: number | null;
}

export interface HistoricalBrierRow {
  checkpoint: string;
  pair: string;
  condition: string;
  statelessForecast: string;
  walrusForecast: string;
  recalledBlob: string;
  outcome: string;
  statelessBrier: number;
  walrusBrier: number;
  advantage: string;
}

export interface TatumMarketState {
  suiPrice: number;
  change24h: number;
  volatility1h: number | null;
  cetusVolume24h: number;
  dexLiquidityUsd?: number;
  latestCheckpoint: number;
  isTatumRpc: boolean;
  gatewayHost: string;
  marketDataSource: 'live' | 'fallback';
  navi: NaviBorrowMetrics;
}

export interface UserWalletState {
  address: string;
  balanceSui: number;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
}

export interface X402Invoice {
  paymentId: string;
  amountSui: number;
  currency: 'SUI';
  recipient: string;
  headerChallenge: string;
  expiresAt: number;
}

export interface X402Receipt {
  paymentId: string;
  amountSui: number;
  recipient: string;
  txDigest: string;
  timestamp: string;
  tatumCheckpoint: number;
}
