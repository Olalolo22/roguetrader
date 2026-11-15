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

export interface WalrusMemoryItem {
  id: string;
  blobId: string;
  text: string;
  category: 'FAILURE_CASE' | 'REGIME_SHIFT' | 'CATALYST' | 'ORACLE_OUTCOME';
  timestamp: string;
  similarityScore: number;
  weightImpact: string;
  tatumCheckpoint?: number;
  latencyMs?: number;
}

export interface EpistemicEvaluation {
  id: string;
  scenarioId: string | null;
  pair: string;
  timestamp: string;
  tatumCheckpoint: number;
  cetusVolume1h: string;
  deepBookSpreadBps: string;
  naviBorrowPct: number | null;
  
  // Stateless Agent (Zero Memory)
  statelessConfidence: number; // e.g. 88%
  statelessStance: string; // "AGGRESSIVE 5X LONG"
  statelessRationale: string;
  statelessBrierPenalty: number | null; // null when unseen/unresolved
  
  // Walrus-Augmented Agent (With Persistent Memory)
  walrusConfidence: number; // e.g. 48%
  walrusStance: string; // "CAUTIOUS SPOT ACCUMULATION"
  walrusRationale: string;
  walrusBrierPenalty: number | null; // null when unseen/unresolved
  recalledMemory: WalrusMemoryItem | null;
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
  volatility1h: number;
  cetusVolume24h: number;
  dexLiquidityUsd?: number;
  latestCheckpoint: number;
  isTatumRpc: boolean;
  gatewayHost: string;
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
