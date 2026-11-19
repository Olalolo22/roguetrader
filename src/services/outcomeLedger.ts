import type {
  LiveBrierSummary,
  ResolvedTradeOutcome,
  TradeOutcomeRecord,
  WalrusMemoryItem
} from '../types/index.ts';
import { walrusMemory } from './walrusMemory.ts';

const OUTCOMES_STORAGE_KEY = 'roguetrader-live-outcomes-v1';

export interface RecordOutcomeInput {
  tradeText: string;
  asset: string;
  side: 'Long' | 'Short';
  proposedLeverage: number;
  calibratedLeverage: number;
  statelessConfidence: number;
  walrusConfidence: number;
  outcome: ResolvedTradeOutcome;
  realizedMovePct: number;
  note?: string;
  naviBorrowPct: number | null;
  tatumCheckpoint: number;
}

export function computeTradeBrierScores(
  statelessConfidencePct: number,
  walrusConfidencePct: number,
  outcomeNumeric: 0 | 1
): { statelessBrier: number; walrusBrier: number } {
  const fStateless = Math.max(0, Math.min(1, statelessConfidencePct / 100));
  const fWalrus = Math.max(0, Math.min(1, walrusConfidencePct / 100));
  return {
    statelessBrier: Number(Math.pow(fStateless - outcomeNumeric, 2).toFixed(4)),
    walrusBrier: Number(Math.pow(fWalrus - outcomeNumeric, 2).toFixed(4))
  };
}

export function computeLiveBrierSummary(records: TradeOutcomeRecord[]): LiveBrierSummary {
  if (records.length === 0) {
    return {
      count: 0,
      blowupsLogged: 0,
      winsLogged: 0,
      avgStatelessBrier: null,
      avgWalrusBrier: null,
      reductionPct: null
    };
  }

  let sumStateless = 0;
  let sumWalrus = 0;
  let blowupsLogged = 0;
  let winsLogged = 0;

  for (const r of records) {
    sumStateless += r.statelessBrier;
    sumWalrus += r.walrusBrier;
    if (r.outcomeNumeric === 0) blowupsLogged += 1;
    else winsLogged += 1;
  }

  const avgStatelessBrier = Number((sumStateless / records.length).toFixed(3));
  const avgWalrusBrier = Number((sumWalrus / records.length).toFixed(3));
  const reductionPct =
    avgStatelessBrier > 0
      ? Math.round(((avgStatelessBrier - avgWalrusBrier) / avgStatelessBrier) * 100)
      : null;

  return {
    count: records.length,
    blowupsLogged,
    winsLogged,
    avgStatelessBrier,
    avgWalrusBrier,
    reductionPct
  };
}

/**
 * Formats a resolved live trade outcome into a structured, semantically searchable
 * Walrus memory entry so future checks on similar assets/setups recall it cleanly.
 */
export function formatOutcomeForWalrus(input: RecordOutcomeInput): {
  text: string;
  category: WalrusMemoryItem['category'];
  outcomeNumeric: 0 | 1;
} {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  const outcomeNumeric: 0 | 1 = input.outcome === 'SURVIVED_OR_TARGET_HIT' ? 1 : 0;
  const category: WalrusMemoryItem['category'] =
    outcomeNumeric === 0 ? 'FAILURE_CASE' : 'CATALYST';

  const moveStr = `${input.realizedMovePct >= 0 ? '+' : ''}${input.realizedMovePct.toFixed(1)}%`;
  const borrowPart =
    input.naviBorrowPct != null ? ` | Borrow: ${input.naviBorrowPct.toFixed(1)}% NAVI` : '';
  const safeCap = outcomeNumeric === 0 ? Math.max(1, Math.min(2, input.calibratedLeverage - 0.5)) : input.calibratedLeverage;
  const trimmedNote = input.note?.trim();

  const summary =
    outcomeNumeric === 0
      ? `Stopped out / liquidated (${moveStr}) on "${input.tradeText}". Mandate: Cap ${input.asset} leverage at ${safeCap}x.`
      : `Confirmed trend continuation (${moveStr}) on "${input.tradeText}". Sizing at ${input.calibratedLeverage}x survived cleanly.`;

  const text = `${dateStr} [Live Outcome | ${input.side} ${input.asset} ${input.proposedLeverage}x${borrowPart}]: ${summary}${
    trimmedNote ? ` Note: ${trimmedNote}` : ''
  }`;

  return { text, category, outcomeNumeric };
}

function loadRecords(): TradeOutcomeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OUTCOMES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecords(records: TradeOutcomeRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota errors
  }
}

class OutcomeLedgerService {
  private records: TradeOutcomeRecord[] = loadRecords();

  public getRecords(): TradeOutcomeRecord[] {
    return [...this.records];
  }

  public getSummary(): LiveBrierSummary {
    return computeLiveBrierSummary(this.records);
  }

  public async recordOutcome(input: RecordOutcomeInput): Promise<{
    record: TradeOutcomeRecord;
    memory: WalrusMemoryItem;
    storedOnLiveRelayer: boolean;
  }> {
    const formatted = formatOutcomeForWalrus(input);
    const brier = computeTradeBrierScores(
      input.statelessConfidence,
      input.walrusConfidence,
      formatted.outcomeNumeric
    );

    const remembered = await walrusMemory.remember(
      formatted.text,
      formatted.category,
      input.tatumCheckpoint,
      {
        origin: 'LIVE_OUTCOME',
        outcomeNumeric: formatted.outcomeNumeric
      }
    );

    const record: TradeOutcomeRecord = {
      id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      tradeText: input.tradeText,
      asset: input.asset,
      side: input.side,
      proposedLeverage: input.proposedLeverage,
      calibratedLeverage: input.calibratedLeverage,
      statelessConfidence: input.statelessConfidence,
      walrusConfidence: input.walrusConfidence,
      outcome: input.outcome,
      outcomeNumeric: formatted.outcomeNumeric,
      realizedMovePct: input.realizedMovePct,
      note: input.note?.trim() || '',
      naviBorrowPct: input.naviBorrowPct,
      tatumCheckpoint: input.tatumCheckpoint,
      walrusBlobId: remembered.memory.blobId,
      statelessBrier: brier.statelessBrier,
      walrusBrier: brier.walrusBrier,
      origin: 'LIVE_OUTCOME'
    };

    this.records.unshift(record);
    saveRecords(this.records);

    return {
      record,
      memory: remembered.memory,
      storedOnLiveRelayer: remembered.storedOnLiveRelayer
    };
  }
}

export const outcomeLedger = new OutcomeLedgerService();
