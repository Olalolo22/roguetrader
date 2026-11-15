import type {
  RecallMatchQuality,
  RiskCalibrationPolicy,
  WalrusMemoryItem
} from '../types/index.ts';

export const DEFAULT_RISK_POLICY: RiskCalibrationPolicy = {
  strongMatchThreshold: 0.72,
  weakMatchThreshold: 0.45,
  unfamiliarMaxLeverage: 2,
  unfamiliarConfidenceCap: 50,
  weakMatchDampening: 0.45,
  weakMatchMaxLeverage: 2.5
};

export const INITIAL_WALRUS_MEMORIES: WalrusMemoryItem[] = [
  {
    id: 'mem-001',
    blobId: 'thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0',
    text: 'Oct 14 2026 [Venue: Cetus $14.2M | Borrow: 78.4% NAVI | Book: 0.62x Bid/Ask]: Failed SUI breakout above $2.15. High borrow crowding (>75%) triggered an -8.2% long-squeeze cascade 40m later. Mandate: Cut leverage to 2x (keep wipeout buffer >12%).',
    category: 'FAILURE_CASE',
    timestamp: '2026-10-14T14:22:10Z',
    similarityScore: 0.94,
    weightImpact: '-32% Confidence',
    tatumCheckpoint: 100352470,
    latencyMs: 914
  },
  {
    id: 'mem-002',
    blobId: '1ZOLBULVD-pOR80s3qADLhBbPHmA6yVQ1rs7Y4QoiJM',
    text: 'Oct 16 2026 [Venue: Cetus $24.1M | Borrow: 48.2% NAVI | Book: 1.8 bps Spread]: SUI/USDC sustained +12.4% institutional breakout over 24h. Low borrow crowding (<52%) and DeepBook spot bid absorption confirmed real trend.',
    category: 'CATALYST',
    timestamp: '2026-10-16T09:15:00Z',
    similarityScore: 0.91,
    weightImpact: '+14% Confidence',
    tatumCheckpoint: 100348120,
    latencyMs: 880
  },
  {
    id: 'mem-003',
    blobId: 'qlvh2ujy6cs7mTgjoWPK_k8OCcKdWE-2BNKWcMtKr5E',
    text: 'Oct 18 2026 [Venue: CETUS/SUI | Pool Depth: Shallow | Scallop Borrow: 74%]: False reversal wick on CETUS/SUI. Thin liquidation pool depth caused artificial oracle wick that stopped out leveraged longs.',
    category: 'FAILURE_CASE',
    timestamp: '2026-10-18T18:40:00Z',
    similarityScore: 0.89,
    weightImpact: '-20% Confidence',
    tatumCheckpoint: 100334804,
    latencyMs: 940
  },
  {
    id: 'mem-004',
    blobId: 'BamlyvKWqCgUcjK_kQ2YiM94grCFrkl5u1f3fRYA2z8',
    text: 'Oct 19 2026 [Venue: Cetus vs Pyth | Sui Epoch Boundary: 512 | Oracle Lag: 40s]: Pyth oracle feed latency during Sui epoch transition caused a phantom 0.8% AMM discount that snapped back immediately. Mandate: Halt arb entries at epoch boundary.',
    category: 'REGIME_SHIFT',
    timestamp: '2026-10-19T21:00:00Z',
    similarityScore: 0.92,
    weightImpact: '-38% Confidence (Halt)',
    tatumCheckpoint: 100310492,
    latencyMs: 980
  },
  {
    id: 'mem-005',
    blobId: 'gi3MnkJ1wY-f7nPs1ODkjnx7D0CJBdKixFqH1LoNxW0',
    text: 'Oct 24 2026 [Venue: CETUS/SUI | Social Velocity: +340% | Book: 0.64x Ask-Heavy | Borrow: 84.7%]: Retail social euphoria spike with lagging DeepBook bid depth (-42%) suffered a -16% bull-trap dump within 2 hours.',
    category: 'FAILURE_CASE',
    timestamp: '2026-10-24T12:00:00Z',
    similarityScore: 0.96,
    weightImpact: '-44% Confidence',
    tatumCheckpoint: 100285110,
    latencyMs: 890
  },
  {
    id: 'mem-006',
    blobId: 'u29gxoSNeyIB6DOBR-GL1rieV6O3lXFfwdfomb2ytHY',
    text: 'Oct 25 2026 [Venue: DEEP/SUI | Bid Absorption: 500k SUI | Borrow: 44%]: DeepBook limit orders absorbed 500k SUI sell volume at $0.082 support without breakdown, confirming institutional accumulation.',
    category: 'CATALYST',
    timestamp: '2026-10-25T16:20:00Z',
    similarityScore: 0.84,
    weightImpact: '+11% Confidence',
    tatumCheckpoint: 100240188,
    latencyMs: 860
  },
  {
    id: 'mem-007',
    blobId: 'kxziGvQVIZ25vsfvvMxZo9GSzdeQAhGJgL6Z-CAXBcs',
    text: 'Oct 28 2026 [Venue: Cetus vs DeepBook | Volatility: 4.8% 1h | NAVI Borrow: 76.2%]: SUI flash dip through DeepBook bid vacuum. Rapid stop-hunt wicked longs before bouncing. Mandate: Require orderbook depth > 2x position size.',
    category: 'FAILURE_CASE',
    timestamp: '2026-10-28T11:15:00Z',
    similarityScore: 0.87,
    weightImpact: '-26% Confidence',
    tatumCheckpoint: 100212040,
    latencyMs: 895
  },
  {
    id: 'mem-008',
    blobId: 'oceCZClMB-mLNKFGNhyAyqHPm7i-GiTaWeXdcddveAE',
    text: 'Oct 30 2026 [Venue: NAVI / Scallop Flash-Loan | Borrow: 82%]: Large flash-loan liquidity shift temporarily distorted lending pool APY to 140%, forcing automated vault deleveraging. Mandate: Filter out flash-loan-induced APY spikes.',
    category: 'FAILURE_CASE',
    timestamp: '2026-10-30T14:45:00Z',
    similarityScore: 0.89,
    weightImpact: '-30% Confidence',
    tatumCheckpoint: 100185900,
    latencyMs: 910
  },
  {
    id: 'mem-009',
    blobId: 'VyTfLjzJqL7MBYOufVlPBvD2WFs54HxoztDQHCxXdzk',
    text: 'Nov 02 2026 [Venue: Cetus SUI/USDC | Spread: 0.9 bps | Vol: $31M (+45%)]: Clean trend continuation post-consolidation with low leverage (<40%). Long positions scaled safely up to 3x with zero liquidation stress.',
    category: 'CATALYST',
    timestamp: '2026-11-02T08:30:00Z',
    similarityScore: 0.93,
    weightImpact: '+18% Confidence',
    tatumCheckpoint: 100150220,
    latencyMs: 875
  },
  {
    id: 'mem-010',
    blobId: 'F6pMrdzRAen9NQZzsADr7Lj8bUAr8WXzzy_9OwFwKHs',
    text: 'Nov 04 2026 [Venue: Cetus Meme Pools | Scallop Borrow: 86%]: Overleveraged longs on high-beta meme tokens experienced a -22% cascade liquidation within 15 minutes. Mandate: Cap meme asset leverage at 1x spot.',
    category: 'FAILURE_CASE',
    timestamp: '2026-11-04T19:10:00Z',
    similarityScore: 0.95,
    weightImpact: '-40% Confidence',
    tatumCheckpoint: 100115000,
    latencyMs: 920
  },
  {
    id: 'mem-011',
    blobId: '-geRj7clDG5AxtiNpmz35jpoRrUg0LcavGuLAYsnjoM',
    text: 'Nov 06 2026 [Venue: Sui Checkpoint Lag | Oracle Tick: Delayed 25s]: Network congestion caused temporary 25s delay in Pyth price push on Cetus CLMM. Directional market orders suffered 1.2% slippage. Mandate: Enforce limit orders only during congestion.',
    category: 'REGIME_SHIFT',
    timestamp: '2026-11-06T15:20:00Z',
    similarityScore: 0.88,
    weightImpact: '-25% Confidence',
    tatumCheckpoint: 100085440,
    latencyMs: 940
  },
  {
    id: 'mem-012',
    blobId: 'uCWoMfbtNImcsKdyhkHh5Yzql2z3ehK_v6HteE3KJIQ',
    text: 'Nov 08 2026 [Venue: DeepBook v3 Wholesale | Bid Depth: $8.2M]: Wall of institutional bids absorbed heavy sell pressure at $2.02, preventing cascading liquidations across Sui perps. Mandate: Re-enable trend-following above verified wall.',
    category: 'CATALYST',
    timestamp: '2026-11-08T13:40:00Z',
    similarityScore: 0.90,
    weightImpact: '+16% Confidence',
    tatumCheckpoint: 100045100,
    latencyMs: 885
  }
];

export interface ParsedTradeIntent {
  side: 'Long' | 'Short';
  asset: string;
  price: number | null;
  leverage: number;
  isSuiTrackedAsset: boolean;
  regimeId: string | null;
}

const SUI_TRACKED_ASSETS = new Set(['SUI', 'CETUS', 'NAVI', 'DEEP', 'WAL', 'SCA']);

const TRADE_STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'into',
  'from',
  'on',
  'at',
  'in',
  'to',
  'of',
  'by',
  'is',
  'was',
  'are',
  'were',
  'during',
  'after',
  'before',
  'when',
  'while',
  'under',
  'over',
  'above',
  'below',
  'hit',
  'rate',
  'long',
  'short',
  'buy',
  'sell',
  'enter',
  'trade',
  'order',
  'setup',
  'position',
  'size',
  'leverage',
  'lev',
  'margin',
  'price',
  'check',
  'against',
  'perp',
  'perps'
]);

const BROAD_ASSET_TOKENS = new Set([
  'sui',
  'cetus',
  'navi',
  'deep',
  'wal',
  'sca',
  'usdc',
  'usdt',
  'usd',
  'xau',
  'gold',
  'btc',
  'eth',
  'sol'
]);

const SUI_ECOSYSTEM_MARKERS = new Set(['sui', 'cetus', 'navi', 'deep', 'deepbook', 'scallop', 'pyth', 'wal', 'sca']);

const LOW_SIGNAL_MODIFIERS = new Set(['spot']);

const TOKEN_STEM_OVERRIDES: Record<string, string> = {
  liquidations: 'liquidation',
  liquidated: 'liquidation',
  wicked: 'wick',
  wicks: 'wick',
  spikes: 'spike',
  spiked: 'spike',
  spiking: 'spike',
  delays: 'delay',
  delayed: 'delay',
  lagging: 'lag',
  breakouts: 'breakout',
  breaks: 'break',
  crowded: 'crowding',
  pools: 'pool',
  bids: 'bid',
  asks: 'ask',
  orders: 'order',
  memes: 'meme',
  tokens: 'token',
  arbitrage: 'arb',
  hype: 'euphoria'
};

const MEMORY_SYNONYM_EXPANSIONS: Record<string, string[]> = {
  borrow: ['utilization'],
  crowding: ['utilization'],
  squeeze: ['liquidation'],
  cascade: ['liquidation'],
  latency: ['lag'],
  lag: ['latency'],
  delay: ['lag', 'latency'],
  shallow: ['thin'],
  vacuum: ['thin']
};

function canonicalizeToken(raw: string): string {
  const lower = raw.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
  if (!lower) return '';
  if (TOKEN_STEM_OVERRIDES[lower]) return TOKEN_STEM_OVERRIDES[lower];
  if (lower.length > 4 && lower.endsWith('s') && !lower.endsWith('ss')) {
    return lower.slice(0, -1);
  }
  return lower;
}

function tokenizeForMemory(text: string): string[] {
  const rawTokens = text
    .toLowerCase()
    .split(/[^a-z0-9.%]+/)
    .map(t => t.replace(/%+$/, ''))
    .filter(Boolean);

  const tokens: string[] = [];
  for (const raw of rawTokens) {
    // Ignore pure leverage tokens (e.g. "3x", "5x") and standalone nominal prices (e.g. "0.85", "2650")
    if (/^\d+(?:\.\d+)?x$/.test(raw)) continue;
    if (/^\d+\.\d+$/.test(raw)) continue;
    const canon = canonicalizeToken(raw);
    if (!canon || canon.length < 2) continue;
    if (TRADE_STOP_WORDS.has(canon)) continue;
    tokens.push(canon);
  }
  return Array.from(new Set(tokens));
}

function buildMemoryTokenSet(memoryText: string): Set<string> {
  const rawTokens = memoryText
    .toLowerCase()
    .split(/[^a-z0-9.%]+/)
    .map(t => t.replace(/%+$/, ''))
    .filter(Boolean);

  const set = new Set<string>();
  for (const raw of rawTokens) {
    const canon = canonicalizeToken(raw);
    if (!canon || canon.length < 2) continue;
    set.add(canon);
    const expansions = MEMORY_SYNONYM_EXPANSIONS[canon];
    if (expansions) {
      for (const extra of expansions) set.add(extra);
    }
  }
  return set;
}

export function normalizePolicy(override?: Partial<RiskCalibrationPolicy>): RiskCalibrationPolicy {
  const merged = { ...DEFAULT_RISK_POLICY, ...override };
  const weakThreshold = clampNumber(merged.weakMatchThreshold, 0.1, 0.9, DEFAULT_RISK_POLICY.weakMatchThreshold);
  const strongThreshold = clampNumber(
    merged.strongMatchThreshold,
    Math.min(0.95, weakThreshold + 0.05),
    0.98,
    DEFAULT_RISK_POLICY.strongMatchThreshold
  );
  return {
    strongMatchThreshold: Number(strongThreshold.toFixed(2)),
    weakMatchThreshold: Number(weakThreshold.toFixed(2)),
    unfamiliarMaxLeverage: clampNumber(merged.unfamiliarMaxLeverage, 1, 10, DEFAULT_RISK_POLICY.unfamiliarMaxLeverage),
    unfamiliarConfidenceCap: Math.round(clampNumber(merged.unfamiliarConfidenceCap, 20, 80, DEFAULT_RISK_POLICY.unfamiliarConfidenceCap)),
    weakMatchDampening: clampNumber(merged.weakMatchDampening, 0.1, 0.9, DEFAULT_RISK_POLICY.weakMatchDampening),
    weakMatchMaxLeverage: clampNumber(merged.weakMatchMaxLeverage, 1, 10, DEFAULT_RISK_POLICY.weakMatchMaxLeverage)
  };
}

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? Math.max(min, Math.min(max, val)) : fallback;
}

export function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

export function classifyMatchQuality(
  topSimilarity: number,
  policy: RiskCalibrationPolicy = DEFAULT_RISK_POLICY
): RecallMatchQuality {
  if (topSimilarity >= policy.strongMatchThreshold) return 'STRONG_MATCH';
  if (topSimilarity >= policy.weakMatchThreshold) return 'WEAK_MATCH';
  return 'UNFAMILIAR_REGIME';
}

export function inferMemoryCategory(text: string): WalrusMemoryItem['category'] {
  const lower = text.toLowerCase();
  if (/(catalyst|accumulation|absorption|continuation|bid wall|confirmed real trend)/.test(lower)) {
    return 'CATALYST';
  }
  if (/(epoch|oracle|pyth|checkpoint|congestion)/.test(lower)) {
    return 'REGIME_SHIFT';
  }
  return 'FAILURE_CASE';
}

export function parseTradeIntent(input: string): ParsedTradeIntent {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  const levMatch = lower.match(/(\d+(?:\.\d+)?)\s*x\b/);
  const leverage = levMatch ? Math.max(1, Math.min(50, Number(levMatch[1]))) : 1;

  const priceMatch = trimmed.match(/(?:^|\s|\$)(\d+(?:\.\d+)?)(?!\s*x|\s*%)/i);
  const side: 'Long' | 'Short' = /\b(short|sell)\b/.test(lower) ? 'Short' : 'Long';

  // Extract explicit ticker after action verb or known ticker anywhere in prompt
  const directionalAssetMatch = trimmed.match(
    /\b(?:long|short|buy|sell)\s+(?:the\s+)?([A-Z0-9]{2,10}(?:\/[A-Z0-9]{2,10})?)\b/i
  );
  const candidateAsset = directionalAssetMatch?.[1]?.toUpperCase();
  const knownTickerMatch = trimmed.match(
    /\b(SUI|CETUS|NAVI|DEEP|WAL|SCA|XAU\/USD|XAU|GOLD|BTC|ETH|SOL|ARB|AVAX|DOGE)\b/i
  );

  let asset = 'UNKNOWN';
  if (knownTickerMatch?.[1]) {
    asset = knownTickerMatch[1].toUpperCase();
  } else if (candidateAsset && !/^\d+(?:\.\d+)?$/.test(candidateAsset) && !/^(ON|AT|IN|THE)$/.test(candidateAsset)) {
    asset = candidateAsset;
  }

  const baseSymbol = asset.split('/')[0];
  const isSuiTrackedAsset = SUI_TRACKED_ASSETS.has(baseSymbol);

  let regimeId: string | null = null;
  if (isSuiTrackedAsset) {
    const hasUnfamiliarMacroCue = /\b(fomc|cpi|fed|nfp|macro|outage|validator|halt|bridge|exploit|hack|funding|tariff|etf)\b/.test(
      lower
    );

    if (!hasUnfamiliarMacroCue) {
      if (/\b(epoch|oracle|pyth|discount|arb|congestion|latency)\b/.test(lower)) {
        regimeId = 'pyth-epoch-latency';
      } else if (/\b(social|hype|euphoria|meme|twitter|viral)\b/.test(lower) && !/\bdiscount\b/.test(lower)) {
        regimeId = 'meme-euphoria-trap';
      } else if (/\b(spot|whale|institutional|absorption|bid wall)\b/.test(lower) && leverage <= 2) {
        regimeId = 'cetus-institutional-breakout';
      } else if (
        /\b(navi|borrow|crowding|utilization|78\.4)\b/.test(lower) ||
        /^long\s+sui(?:\s+at)?\s+\$?0\.85\b/i.test(trimmed)
      ) {
        regimeId = 'oct-navi-trap';
      }
    }
  }

  return {
    side,
    asset,
    price: priceMatch ? Number(priceMatch[1]) : null,
    leverage,
    isSuiTrackedAsset,
    regimeId
  };
}

/**
 * Computes normalized semantic similarity [0..1] between a trade/search query and a Walrus memory.
 * Broad asset names alone (e.g. "SUI") cannot manufacture a regime match when regime cues are absent or unmatched,
 * and external assets (e.g. "GOLD", "XAU") do not cross-match Sui-only records.
 */
export function scoreMemoryRelevance(query: string, memoryText: string, isUserSaved = false): number {
  const queryTokens = tokenizeForMemory(query);
  if (queryTokens.length === 0) return 0;

  const memorySet = buildMemoryTokenSet(memoryText);

  const assetTokens: string[] = [];
  const modifierTokens: string[] = [];
  const regimeTokens: string[] = [];
  for (const token of queryTokens) {
    if (BROAD_ASSET_TOKENS.has(token)) {
      assetTokens.push(token);
    } else if (LOW_SIGNAL_MODIFIERS.has(token)) {
      modifierTokens.push(token);
    } else {
      regimeTokens.push(token);
    }
  }

  // Cross-asset isolation: if the query names an external (non-Sui, non-quote) asset that is absent from this memory,
  // prevent order-type tokens like "spot" from creating a false regime match.
  const externalAssets = assetTokens.filter(
    t => !SUI_ECOSYSTEM_MARKERS.has(t) && t !== 'usd' && t !== 'usdc' && t !== 'usdt'
  );
  if (externalAssets.length > 0 && externalAssets.some(a => !memorySet.has(a))) {
    return 0;
  }

  let matchedAssetCount = 0;
  for (const t of assetTokens) {
    if (memorySet.has(t)) matchedAssetCount += 1;
  }

  let matchedModifierCount = 0;
  for (const t of modifierTokens) {
    if (memorySet.has(t)) matchedModifierCount += 1;
  }

  let matchedRegimeCount = 0;
  for (const t of regimeTokens) {
    if (memorySet.has(t)) matchedRegimeCount += 1;
  }

  const assetWeight = 0.25;
  const modifierWeight = 0.35;
  const regimeWeight = 1.0;
  const totalWeight =
    assetTokens.length * assetWeight +
    modifierTokens.length * modifierWeight +
    regimeTokens.length * regimeWeight;
  const matchedWeight =
    matchedAssetCount * assetWeight +
    matchedModifierCount * modifierWeight +
    matchedRegimeCount * regimeWeight;
  const rawRatio = totalWeight > 0 ? matchedWeight / totalWeight : 0;

  let score = 0;
  if (regimeTokens.length === 0) {
    // Asset/modifier-only query (e.g. "Long SUI 3x" or "Long GOLD 1x spot"): no regime evidence
    score = matchedAssetCount > 0 ? 0.25 : 0;
  } else if (matchedRegimeCount === 0) {
    // Broad ticker overlap with zero matching regime cues -> Unfamiliar regime
    score = matchedAssetCount > 0 ? Math.min(0.28, rawRatio) : 0;
  } else {
    const specificityCap = matchedRegimeCount === 1 && matchedModifierCount === 0 ? 0.76 : 0.96;
    score = Math.min(specificityCap, rawRatio * 0.96);
    if (isUserSaved) {
      score = Math.min(0.98, score + 0.02);
    }
  }

  return Number(Math.max(0, Math.min(0.98, score)).toFixed(2));
}

export interface RankedRecallOutput {
  results: WalrusMemoryItem[];
  allCandidates: WalrusMemoryItem[];
  topSimilarity: number;
  matchQuality: RecallMatchQuality;
}

export function rankMemoriesLocally(
  query: string,
  memories: WalrusMemoryItem[],
  policy: RiskCalibrationPolicy = DEFAULT_RISK_POLICY,
  limit = 3,
  latencyMs = 860
): RankedRecallOutput {
  const scored = memories
    .map(m => ({
      ...m,
      similarityScore: scoreMemoryRelevance(query, m.text, m.id.startsWith('wal-')),
      latencyMs
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore);

  const topSimilarity = scored[0]?.similarityScore ?? 0;
  const matchQuality = classifyMatchQuality(topSimilarity, policy);
  const qualified = scored.filter(m => m.similarityScore >= policy.weakMatchThreshold).slice(0, limit);

  return {
    results: qualified,
    allCandidates: scored.slice(0, limit),
    topSimilarity,
    matchQuality
  };
}

export interface CalibrationOutcome {
  matchQuality: RecallMatchQuality;
  topCandidateSimilarity: number;
  recalledMemory: WalrusMemoryItem | null;
  statelessConfidence: number;
  walrusConfidence: number;
  calibratedLeverage: number;
  walrusStance: string;
  walrusRationale: string;
  policyApplied: string;
}

export function computeRiskCalibration(params: {
  proposedLeverage: number;
  statelessConfidence: number;
  ranked: RankedRecallOutput;
  policy?: RiskCalibrationPolicy;
  strongCalibratedStanceOverride?: string;
}): CalibrationOutcome {
  const policy = normalizePolicy(params.policy);
  const { proposedLeverage, statelessConfidence, ranked } = params;
  const topMemory = ranked.results[0] ?? null;
  const matchQuality = ranked.matchQuality;

  // State 3: No meaningful match -> explicit, deterministic baseline risk constraint
  if (matchQuality === 'UNFAMILIAR_REGIME' || !topMemory) {
    const walrusConfidence = Math.min(statelessConfidence, policy.unfamiliarConfidenceCap);
    const calibratedLeverage =
      proposedLeverage <= 1
        ? proposedLeverage
        : Math.min(proposedLeverage, policy.unfamiliarMaxLeverage);

    const stance =
      proposedLeverage > policy.unfamiliarMaxLeverage
        ? 'UNFAMILIAR REGIME · BASELINE CAP'
        : 'UNFAMILIAR REGIME · MONITORED';

    const rationale = `No close match in Walrus memory (top similarity ${Math.round(
      ranked.topSimilarity * 100
    )}% < ${Math.round(policy.weakMatchThreshold * 100)}% floor). Catalyst boosts disabled; confidence capped at ${
      policy.unfamiliarConfidenceCap
    }% and leverage capped at ${policy.unfamiliarMaxLeverage}x baseline limit.`;

    return {
      matchQuality: 'UNFAMILIAR_REGIME',
      topCandidateSimilarity: ranked.topSimilarity,
      recalledMemory: null,
      statelessConfidence,
      walrusConfidence,
      calibratedLeverage,
      walrusStance: stance,
      walrusRationale: rationale,
      policyApplied: `unfamiliar_baseline_cap (max ${policy.unfamiliarMaxLeverage}x, conf ≤ ${policy.unfamiliarConfidenceCap}%)`
    };
  }

  // State 2: Weak / partial match -> dampen memory adjustment, disallow catalyst boost, cap leverage
  if (matchQuality === 'WEAK_MATCH') {
    const riskMemories = ranked.results.filter(m => m.category !== 'CATALYST');
    const avgRiskSimilarity =
      riskMemories.length > 0
        ? riskMemories.reduce((acc, m) => acc + m.similarityScore, 0) / riskMemories.length
        : 0;

    let walrusConfidence: number;
    if (topMemory.category === 'CATALYST') {
      walrusConfidence = Math.min(Math.max(42, statelessConfidence - 10), 65);
    } else {
      const dampenedPenalty = Math.max(
        10,
        Math.round((avgRiskSimilarity || ranked.topSimilarity) * 34 * policy.weakMatchDampening)
      );
      walrusConfidence = Math.max(40, statelessConfidence - dampenedPenalty);
    }

    const scaledLev =
      proposedLeverage <= 1
        ? proposedLeverage
        : Math.max(1, roundHalf(proposedLeverage * (walrusConfidence / statelessConfidence)));
    const calibratedLeverage =
      proposedLeverage <= 1
        ? proposedLeverage
        : Math.min(proposedLeverage, policy.weakMatchMaxLeverage, scaledLev);

    const rationale = `Partial Walrus match (${Math.round(ranked.topSimilarity * 100)}% < ${Math.round(
      policy.strongMatchThreshold * 100
    )}% strong threshold): "${topMemory.text}". Memory weight dampened to ${Math.round(
      policy.weakMatchDampening * 100
    )}% and leverage capped at ${policy.weakMatchMaxLeverage}x.`;

    return {
      matchQuality: 'WEAK_MATCH',
      topCandidateSimilarity: ranked.topSimilarity,
      recalledMemory: topMemory,
      statelessConfidence,
      walrusConfidence,
      calibratedLeverage,
      walrusStance: 'PARTIAL MATCH · CONSERVATIVE CAP',
      walrusRationale: rationale,
      policyApplied: `weak_match_dampened (${Math.round(policy.weakMatchDampening * 100)}% weight, max ${
        policy.weakMatchMaxLeverage
      }x)`
    };
  }

  // State 1: Strong match -> full historical memory calibration
  const isPositiveCatalyst = topMemory.category === 'CATALYST';
  if (isPositiveCatalyst) {
    const walrusConfidence = Math.min(88, statelessConfidence + 12);
    const calibratedLeverage =
      proposedLeverage <= 1
        ? proposedLeverage
        : Math.max(1, Math.min(proposedLeverage, roundHalf(proposedLeverage)));

    return {
      matchQuality: 'STRONG_MATCH',
      topCandidateSimilarity: ranked.topSimilarity,
      recalledMemory: topMemory,
      statelessConfidence,
      walrusConfidence,
      calibratedLeverage,
      walrusStance: params.strongCalibratedStanceOverride || 'HIGH-CONVICTION ENTRY',
      walrusRationale: topMemory.text,
      policyApplied: 'strong_match_catalyst_backed'
    };
  }

  const failureMemories = ranked.results.filter(m => m.category !== 'CATALYST');
  const avgFailureSimilarity =
    failureMemories.length > 0
      ? failureMemories.reduce((acc, m) => acc + m.similarityScore, 0) / failureMemories.length
      : ranked.topSimilarity;

  const computedPenalty = Math.round(avgFailureSimilarity * 34) || 22;
  const walrusConfidence = Math.max(38, statelessConfidence - computedPenalty);
  const calibratedLeverage =
    proposedLeverage <= 1
      ? proposedLeverage
      : Math.max(1, Math.min(proposedLeverage, roundHalf(proposedLeverage * (walrusConfidence / statelessConfidence))));

  return {
    matchQuality: 'STRONG_MATCH',
    topCandidateSimilarity: ranked.topSimilarity,
    recalledMemory: topMemory,
    statelessConfidence,
    walrusConfidence,
    calibratedLeverage,
    walrusStance: params.strongCalibratedStanceOverride || 'PROTECTED SIZING',
    walrusRationale: topMemory.text,
    policyApplied: 'strong_match_failure_shrinkage'
  };
}
