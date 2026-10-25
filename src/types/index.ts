export type AgentId = 'alphasui' | 'deepregime' | 'hypesentinel';

export interface WalrusMemoryItem {
  id: string;
  blobId: string;
  text: string;
  category: 'FAILURE_CASE' | 'REGIME_SHIFT' | 'CATALYST' | 'ORACLE_OUTCOME';
  timestamp: string;
  similarityScore: number;
  weightImpact: string;
}

export interface AgentThesis {
  id: string;
  agentId: AgentId;
  marketPair: string;
  rawConfidence: number; // 0 to 100
  calibratedConfidence: number; // 0 to 100
  stance: 'STRONG_LONG' | 'CAUTIOUS_LONG' | 'NEUTRAL' | 'SHORT';
  rawHypothesis: string;
  reflectionNotes: string;
  fullAnalysis: string;
  entryRange: string;
  targetPrice: number;
  stopLoss: number;
  retrievedMemories: WalrusMemoryItem[];
  walrusJobId: string;
  walrusBlobHash: string;
  timestamp: string;
  tatumCheckpoint: number;
  isUnlocked: boolean;
}

export interface AgentProfile {
  id: AgentId;
  name: string;
  badge: string;
  avatar: string;
  style: string;
  brierScore: number; // 0.00 is perfect, 1.00 is worst
  calibrationPct: number; // e.g. 88%
  rank: number;
  totalMemories: number;
  resolvedCalls: number;
  status: 'ONLINE' | 'ANALYZING' | 'REFLECTING' | 'LOCKED';
  unlockPriceSui: number;
  recipientAddress: string;
  currentThesis: AgentThesis;
}

export interface X402Invoice {
  paymentId: string;
  agentId: AgentId;
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
  agentId: AgentId;
}

export interface TatumMarketState {
  suiPrice: number;
  change24h: number;
  volatility1h: number;
  cetusVolume24h: number;
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
