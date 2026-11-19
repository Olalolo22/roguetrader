import { MemWal, MemWalMock } from '@mysten-incubation/memwal';
import type {
  MemoryOrigin,
  RecallMatchQuality,
  RiskCalibrationPolicy,
  WalrusMemoryItem
} from '../types/index.ts';
import {
  classifyMatchQuality,
  DEFAULT_RISK_POLICY,
  inferMemoryCategory,
  INITIAL_WALRUS_MEMORIES,
  normalizePolicy,
  rankMemoriesLocally
} from './riskPolicy.ts';

export { INITIAL_WALRUS_MEMORIES };

const LIVE_MEMORIES_STORAGE_KEY = 'roguetrader-live-memories-v1';

export interface WalrusRecallResponse {
  results: WalrusMemoryItem[];
  allCandidates: WalrusMemoryItem[];
  topSimilarity: number;
  matchQuality: RecallMatchQuality;
  latencyMs: number;
  droppedCount: number;
  source: 'live_relayer' | 'sdk_mock';
}

function loadPersistedLiveMemories(): WalrusMemoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LIVE_MEMORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is WalrusMemoryItem => Boolean(item && typeof item.text === 'string' && item.id))
      .map(item => ({
        ...item,
        origin: 'LIVE_OUTCOME' as const
      }));
  } catch {
    return [];
  }
}

function savePersistedLiveMemories(memories: WalrusMemoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const liveOnly = memories.filter(m => m.origin === 'LIVE_OUTCOME');
    window.localStorage.setItem(LIVE_MEMORIES_STORAGE_KEY, JSON.stringify(liveOnly));
  } catch {
    // Ignore storage quota errors
  }
}

function readEnvVar(name: string): string {
  if (typeof import.meta === 'undefined') return '';
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  return (env?.[name] ?? '').trim();
}

class WalrusMemoryService {
  private memwalClient: any = null;
  private mockClient: MemWalMock;
  private isLiveConfigured: boolean = false;
  private memories: WalrusMemoryItem[];

  constructor() {
    const persistedLive = loadPersistedLiveMemories();
    this.memories = [
      ...persistedLive,
      ...INITIAL_WALRUS_MEMORIES.map(m => ({ ...m, origin: 'HISTORICAL_BENCHMARK' as const }))
    ];

    this.mockClient = MemWalMock.create({
      namespace: 'roguetrader',
      initialMemories: this.memories.map(m => ({
        text: m.text,
        namespace: 'roguetrader',
        blobId: m.blobId
      }))
    });

    const envKey = readEnvVar('VITE_MEMWAL_KEY');
    const envAccount = readEnvVar('VITE_MEMWAL_ACCOUNT_ID');
    if (envKey && envAccount) {
      this.configureLive(envKey, envAccount);
    }
  }

  public configureLive(key: string, accountId: string) {
    try {
      this.memwalClient = MemWal.create({
        key,
        accountId,
        serverUrl: 'https://relayer.memory.walrus.xyz',
        namespace: 'roguetrader'
      });
      this.isLiveConfigured = true;
      return { success: true };
    } catch {
      return { success: false, error: 'Invalid MemWal Ed25519 delegate key format' };
    }
  }

  public isConfigured(): boolean {
    return this.isLiveConfigured;
  }

  public async getHealth() {
    try {
      const res = await fetch('https://relayer.memory.walrus.xyz/health');
      if (res.ok) {
        const data = await res.json();
        return { online: true, relayer: 'production', details: data };
      }
      return { online: false, relayer: 'offline' };
    } catch {
      return { online: true, relayer: 'sandbox-mock' };
    }
  }

  public async recall(
    query: string,
    limit: number = 3,
    policyOverride?: Partial<RiskCalibrationPolicy>
  ): Promise<WalrusRecallResponse> {
    const startTime = performance.now();
    const policy = normalizePolicy(policyOverride ?? DEFAULT_RISK_POLICY);

    // 1. Try Live MemWal Relayer if configured
    if (this.isLiveConfigured && this.memwalClient) {
      try {
        const res = await this.memwalClient.recall({ query, limit });
        const latencyMs = Math.round(performance.now() - startTime);

        if (res && Array.isArray(res.results)) {
          const items: WalrusMemoryItem[] = res.results
            .map((r: any, idx: number) => {
              const matchedSeed = this.memories.find(m => m.blobId === r.blob_id);
              const rawDist =
                typeof r.distance === 'number' && Number.isFinite(r.distance) ? r.distance : 1;
              const sim =
                typeof r.similarity === 'number' && Number.isFinite(r.similarity)
                  ? Math.max(0, Math.min(1, Number(r.similarity.toFixed(2))))
                  : Math.max(0, Math.min(1, Number((1 - rawDist).toFixed(2))));
              const text = r.text || r.memory || String(r);

              return {
                id: `relayer-${Date.now()}-${idx}`,
                blobId: r.blob_id || r.id || '',
                text,
                category: matchedSeed?.category || inferMemoryCategory(text),
                origin: matchedSeed?.origin ?? 'LIVE_OUTCOME',
                outcomeNumeric: matchedSeed?.outcomeNumeric,
                timestamp: r.created_at || matchedSeed?.timestamp || new Date().toISOString(),
                similarityScore: sim,
                weightImpact: matchedSeed?.weightImpact || '-30% Confidence',
                tatumCheckpoint: matchedSeed?.tatumCheckpoint,
                latencyMs
              };
            })
            .sort((a: WalrusMemoryItem, b: WalrusMemoryItem) => b.similarityScore - a.similarityScore);

          const topSimilarity = items[0]?.similarityScore ?? 0;
          const matchQuality = classifyMatchQuality(topSimilarity, policy);
          const qualifiedResults = items.filter(m => m.similarityScore >= policy.weakMatchThreshold);

          return {
            results: qualifiedResults,
            allCandidates: items,
            topSimilarity,
            matchQuality,
            latencyMs,
            droppedCount: res.dropped_count || 0,
            source: 'live_relayer'
          };
        }
      } catch {
        // Fall through to local semantic index when live relayer request errors
      }
    }

    // 2. SDK Mock vector recall + normalized semantic scoring across stored memories
    try {
      await this.mockClient.recall({ query, limit });
    } catch {
      // Proceed with normalized semantic scoring over this.memories
    }

    const latencyMs = Math.max(Math.round(performance.now() - startTime), 240);
    const ranked = rankMemoriesLocally(query, this.memories, policy, limit, latencyMs);

    return {
      results: ranked.results,
      allCandidates: ranked.allCandidates,
      topSimilarity: ranked.topSimilarity,
      matchQuality: ranked.matchQuality,
      latencyMs,
      droppedCount: 0,
      source: 'sdk_mock'
    };
  }

  public async remember(
    text: string,
    category: WalrusMemoryItem['category'] = 'FAILURE_CASE',
    tatumCheckpoint: number = 89412950,
    options?: {
      origin?: MemoryOrigin;
      outcomeNumeric?: 0 | 1;
    }
  ): Promise<{
    success: boolean;
    memory: WalrusMemoryItem;
    latencyMs: number;
    isAsyncWal: boolean;
    storedOnLiveRelayer: boolean;
  }> {
    const startTime = performance.now();
    const origin: MemoryOrigin = options?.origin ?? 'LIVE_OUTCOME';

    let resolvedBlobId = 'walrus_' + Math.random().toString(36).slice(2, 14);
    let storedOnLiveRelayer = false;

    if (this.isLiveConfigured && this.memwalClient) {
      try {
        const relayerRes = await this.memwalClient.rememberAsync(text, 'roguetrader');
        if (relayerRes?.blob_id || relayerRes?.job_id || relayerRes?.id) {
          resolvedBlobId = relayerRes.blob_id || relayerRes.job_id || relayerRes.id;
          storedOnLiveRelayer = true;
        }
      } catch {
        // Fallback to local persisted memory state
      }
    }

    const newMemory: WalrusMemoryItem = {
      id: `wal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      blobId: resolvedBlobId,
      text,
      category,
      origin,
      outcomeNumeric: options?.outcomeNumeric,
      timestamp: new Date().toISOString(),
      similarityScore: 1.0,
      weightImpact: category === 'CATALYST' ? '+14% Confidence' : '-32% Confidence',
      tatumCheckpoint,
      latencyMs: storedOnLiveRelayer ? 19400 : 120
    };

    try {
      await this.mockClient.rememberAsync(text, 'roguetrader');
    } catch {
      // Stored in memory array
    }

    this.memories.unshift(newMemory);
    if (origin === 'LIVE_OUTCOME') {
      savePersistedLiveMemories(this.memories);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      memory: newMemory,
      latencyMs,
      isAsyncWal: true,
      storedOnLiveRelayer
    };
  }

  public getAllMemories(): WalrusMemoryItem[] {
    return this.memories;
  }

  public getMemoryStats(): { total: number; liveOutcomeCount: number; benchmarkCount: number } {
    const liveOutcomeCount = this.memories.filter(m => m.origin === 'LIVE_OUTCOME').length;
    const benchmarkCount = this.memories.length - liveOutcomeCount;
    return {
      total: this.memories.length,
      liveOutcomeCount,
      benchmarkCount
    };
  }
}

export const walrusMemory = new WalrusMemoryService();
