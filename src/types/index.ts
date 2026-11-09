export type AgentMode = 'stateless' | 'walrus_calibrated';

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
  scenarioId: string;
  pair: string;
  timestamp: string;
  tatumCheckpoint: number;
  cetusVolume1h: string;
  deepBookSpreadBps: string;
  naviBorrowPct: number;
  
  // Stateless Agent (Zero Memory)
  statelessConfidence: number; // e.g. 88%
  statelessStance: string; // "AGGRESSIVE 5X LONG"
  statelessRationale: string;
  statelessBrierPenalty: number; // e.g. 0.774
  
  // Walrus-Augmented Agent (With Persistent Memory)
  walrusConfidence: number; // e.g. 48%
  walrusStance: string; // "CAUTIOUS SPOT ACCUMULATION"
  walrusRationale: string;
  walrusBrierPenalty: number; // e.g. 0.176
  recalledMemory: WalrusMemoryItem;
  recallLatencyMs: number; // e.g. 1,080 ms
  
  actualOutcome: 'DUMP_LONG_SQUEEZE' | 'BREAKOUT_CONTINUATION' | 'CHOP_DELTA_NEUTRAL' | 'ORACLE_WICK_REVERSAL';
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
