import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeLiveBrierSummary,
  computeTradeBrierScores,
  formatOutcomeForWalrus,
  outcomeLedger
} from '../src/services/outcomeLedger.ts';
import {
  computeRiskCalibration,
  DEFAULT_RISK_POLICY
} from '../src/services/riskPolicy.ts';
import { walrusMemory } from '../src/services/walrusMemory.ts';

test('computeTradeBrierScores calculates exact squared forecast error (f - o)^2', () => {
  const blowup = computeTradeBrierScores(88, 46, 0);
  assert.equal(blowup.statelessBrier, 0.7744);
  assert.equal(blowup.walrusBrier, 0.2116);

  const win = computeTradeBrierScores(74, 86, 1);
  assert.equal(win.statelessBrier, 0.0676);
  assert.equal(win.walrusBrier, 0.0196);
});

test('computeLiveBrierSummary returns empty nulls with zero live trades and aggregates real records cleanly', () => {
  const empty = computeLiveBrierSummary([]);
  assert.equal(empty.count, 0);
  assert.equal(empty.avgStatelessBrier, null);
  assert.equal(empty.avgWalrusBrier, null);
  assert.equal(empty.reductionPct, null);

  const summary = computeLiveBrierSummary([
    {
      id: 'out-1',
      timestamp: '2026-11-19T00:00:00Z',
      tradeText: 'Long SUI 5x',
      asset: 'SUI',
      side: 'Long',
      proposedLeverage: 5,
      calibratedLeverage: 2,
      statelessConfidence: 87,
      walrusConfidence: 50,
      outcome: 'LIQUIDATED_OR_STOPPED',
      outcomeNumeric: 0,
      realizedMovePct: -9.5,
      note: 'Stopped out',
      naviBorrowPct: 79.0,
      tatumCheckpoint: 344000001,
      walrusBlobId: 'walrus_test_1',
      statelessBrier: 0.7569,
      walrusBrier: 0.25,
      origin: 'LIVE_OUTCOME'
    },
    {
      id: 'out-2',
      timestamp: '2026-11-19T01:00:00Z',
      tradeText: 'Long SUI 2x',
      asset: 'SUI',
      side: 'Long',
      proposedLeverage: 2,
      calibratedLeverage: 2,
      statelessConfidence: 78,
      walrusConfidence: 86,
      outcome: 'SURVIVED_OR_TARGET_HIT',
      outcomeNumeric: 1,
      realizedMovePct: 11.2,
      note: 'Hit target',
      naviBorrowPct: 52.0,
      tatumCheckpoint: 344000100,
      walrusBlobId: 'walrus_test_2',
      statelessBrier: 0.0484,
      walrusBrier: 0.0196,
      origin: 'LIVE_OUTCOME'
    }
  ]);

  assert.equal(summary.count, 2);
  assert.equal(summary.blowupsLogged, 1);
  assert.equal(summary.winsLogged, 1);
  assert.equal(summary.avgStatelessBrier, 0.403);
  assert.equal(summary.avgWalrusBrier, 0.135);
  assert.equal(summary.reductionPct, 67);
});

test('formatOutcomeForWalrus maps blowups to FAILURE_CASE (o=0) and wins to CATALYST (o=1)', () => {
  const loss = formatOutcomeForWalrus({
    tradeText: 'Long XAU/USD 5x — FOMC shock',
    asset: 'XAU/USD',
    side: 'Long',
    proposedLeverage: 5,
    calibratedLeverage: 2,
    statelessConfidence: 87,
    walrusConfidence: 50,
    outcome: 'LIQUIDATED_OR_STOPPED',
    realizedMovePct: -6.4,
    note: 'Liquidity gap on Powell presser',
    naviBorrowPct: null,
    tatumCheckpoint: 344111000
  });

  assert.equal(loss.category, 'FAILURE_CASE');
  assert.equal(loss.outcomeNumeric, 0);
  assert.match(loss.text, /Live Outcome \| Long XAU\/USD 5x/);
  assert.match(loss.text, /-6\.4%/);

  const win = formatOutcomeForWalrus({
    tradeText: 'Long DEEP 2x — spot accumulation',
    asset: 'DEEP',
    side: 'Long',
    proposedLeverage: 2,
    calibratedLeverage: 2,
    statelessConfidence: 78,
    walrusConfidence: 78,
    outcome: 'SURVIVED_OR_TARGET_HIT',
    realizedMovePct: 14.2,
    naviBorrowPct: 48.1,
    tatumCheckpoint: 344111200
  });

  assert.equal(win.category, 'CATALYST');
  assert.equal(win.outcomeNumeric, 1);
  assert.match(win.text, /Borrow: 48\.1% NAVI/);
  assert.match(win.text, /\+14\.2%/);
});

test('Closed feedback loop: recording a live blowup on an unseen setup shifts the next check from UNFAMILIAR_REGIME to STRONG_MATCH', async () => {
  const query = 'Long AVAX 5x — unlock volatility squeeze';

  // Step 1: Before recording any outcome, AVAX unlock setup is unfamiliar
  const beforeRecall = await walrusMemory.recall(query, 3, DEFAULT_RISK_POLICY);
  assert.equal(beforeRecall.matchQuality, 'UNFAMILIAR_REGIME');
  assert.equal(beforeRecall.results.length, 0);

  const beforeCal = computeRiskCalibration({
    proposedLeverage: 5,
    statelessConfidence: 87,
    ranked: beforeRecall,
    policy: DEFAULT_RISK_POLICY,
    isSuiTrackedAsset: false
  });
  assert.equal(beforeCal.matchQuality, 'UNFAMILIAR_REGIME');
  assert.equal(beforeCal.calibratedLeverage, 2);

  // Step 2: Record real resolved blowup via outcomeLedger (writes LIVE_OUTCOME to walrusMemory)
  const recorded = await outcomeLedger.recordOutcome({
    tradeText: query,
    asset: 'AVAX',
    side: 'Long',
    proposedLeverage: 5,
    calibratedLeverage: beforeCal.calibratedLeverage,
    statelessConfidence: 87,
    walrusConfidence: beforeCal.walrusConfidence,
    outcome: 'LIQUIDATED_OR_STOPPED',
    realizedMovePct: -11.8,
    note: 'Token unlock swept stops',
    naviBorrowPct: null,
    tatumCheckpoint: 344222000
  });

  assert.equal(recorded.record.origin, 'LIVE_OUTCOME');
  assert.equal(recorded.memory.origin, 'LIVE_OUTCOME');
  assert.equal(recorded.record.outcomeNumeric, 0);
  assert.ok(recorded.record.walrusBrier < recorded.record.statelessBrier);

  // Step 3: Re-check the exact same trade -> now recalls the recorded LIVE_OUTCOME at STRONG_MATCH
  const afterRecall = await walrusMemory.recall(query, 3, DEFAULT_RISK_POLICY);
  assert.equal(afterRecall.matchQuality, 'STRONG_MATCH');
  assert.equal(afterRecall.results[0]?.id, recorded.memory.id);
  assert.equal(afterRecall.results[0]?.origin, 'LIVE_OUTCOME');

  const afterCal = computeRiskCalibration({
    proposedLeverage: 5,
    statelessConfidence: 87,
    ranked: afterRecall,
    policy: DEFAULT_RISK_POLICY,
    isSuiTrackedAsset: false
  });
  assert.equal(afterCal.matchQuality, 'STRONG_MATCH');
  assert.equal(afterCal.recalledMemory?.origin, 'LIVE_OUTCOME');
  assert.match(afterCal.shortExplanation, /real blowup you recorded/i);
  assert.ok(afterCal.calibratedLeverage < 5);
});
