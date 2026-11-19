import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeRiskCalibration,
  DEFAULT_RISK_POLICY,
  INITIAL_WALRUS_MEMORIES,
  parseTradeIntent,
  rankMemoriesLocally,
  scoreMemoryRelevance
} from '../src/services/riskPolicy.ts';
import handler from '../api/x402/check.ts';

test('Known Sui preset queries classify as STRONG_MATCH with expected memories', () => {
  const cases = [
    {
      input: 'Long SUI 0.85, 3x',
      expectedRegime: 'oct-navi-trap',
      recallQuery: 'SUI breakout Cetus $14.2M NAVI borrow crowding >75% long-squeeze',
      expectedBlob: 'thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0',
      expectedCategory: 'FAILURE_CASE'
    },
    {
      input: 'Long CETUS on social spike, 5x',
      expectedRegime: 'meme-euphoria-trap',
      recallQuery: 'Long CETUS on social spike, 5x',
      expectedBlob: 'gi3MnkJ1wY-f7nPs1ODkjnx7D0CJBdKixFqH1LoNxW0',
      expectedCategory: 'FAILURE_CASE'
    },
    {
      input: 'Buy SUI Cetus discount at epoch boundary, 2x',
      expectedRegime: 'pyth-epoch-latency',
      recallQuery: 'Buy SUI Cetus discount at epoch boundary, 2x',
      expectedBlob: 'BamlyvKWqCgUcjK_kQ2YiM94grCFrkl5u1f3fRYA2z8',
      expectedCategory: 'REGIME_SHIFT'
    },
    {
      input: 'Long SUI breakout, 1x spot',
      expectedRegime: 'cetus-institutional-breakout',
      recallQuery: 'Long SUI breakout, 1x spot',
      expectedBlob: '1ZOLBULVD-pOR80s3qADLhBbPHmA6yVQ1rs7Y4QoiJM',
      expectedCategory: 'CATALYST'
    }
  ];

  for (const c of cases) {
    const parsed = parseTradeIntent(c.input);
    assert.equal(parsed.regimeId, c.expectedRegime, `Failed regime parse for: ${c.input}`);
    const ranked = rankMemoriesLocally(c.recallQuery, INITIAL_WALRUS_MEMORIES, DEFAULT_RISK_POLICY, 3);
    assert.equal(
      ranked.matchQuality,
      'STRONG_MATCH',
      `Expected STRONG_MATCH for: ${c.input}, got ${ranked.matchQuality} (${ranked.topSimilarity})`
    );
    assert.equal(ranked.results[0]?.blobId, c.expectedBlob);
    assert.equal(ranked.results[0]?.category, c.expectedCategory);
  }
});

test('Unseen assets and unseen macro regimes on SUI classify as UNFAMILIAR_REGIME with zero false matches', () => {
  const unseenInputs = [
    'Long XAU/USD on FOMC shock, 5x',
    'Short GOLD 4x',
    'Long BTC 95000, 10x',
    'Long SUI on CPI print, 5x',
    'Short SUI during validator outage, 4x',
    'Long SUI 1.40, 5x',
    'Long SUI 3x'
  ];

  for (const input of unseenInputs) {
    const parsed = parseTradeIntent(input);
    assert.equal(parsed.regimeId, null, `Expected null preset for unseen input: ${input}`);
    const ranked = rankMemoriesLocally(input, INITIAL_WALRUS_MEMORIES, DEFAULT_RISK_POLICY, 3);
    assert.equal(
      ranked.matchQuality,
      'UNFAMILIAR_REGIME',
      `Expected UNFAMILIAR_REGIME for "${input}", got ${ranked.matchQuality} (sim=${ranked.topSimilarity})`
    );
    assert.equal(ranked.results.length, 0);

    const cal = computeRiskCalibration({
      proposedLeverage: parsed.leverage,
      statelessConfidence: 87,
      ranked,
      policy: DEFAULT_RISK_POLICY
    });
    assert.equal(cal.recalledMemory, null);
    assert.equal(cal.calibratedLeverage, Math.min(parsed.leverage, DEFAULT_RISK_POLICY.unfamiliarMaxLeverage));
    assert.ok(cal.walrusConfidence <= DEFAULT_RISK_POLICY.unfamiliarConfidenceCap);
  }
});

test('Unfamiliar regime with low proposed leverage (1x) preserves 1x without cutting below baseline', () => {
  for (const input of ['Long GOLD 1x spot', 'Long SUI 1x spot']) {
    const parsed = parseTradeIntent(input);
    const ranked = rankMemoriesLocally(input, INITIAL_WALRUS_MEMORIES, DEFAULT_RISK_POLICY, 3);
    assert.equal(
      ranked.matchQuality,
      'UNFAMILIAR_REGIME',
      `Expected UNFAMILIAR_REGIME for ${input}, got ${ranked.matchQuality} (${ranked.topSimilarity})`
    );
    const cal = computeRiskCalibration({
      proposedLeverage: parsed.leverage,
      statelessConfidence: 75,
      ranked,
      policy: DEFAULT_RISK_POLICY
    });
    assert.equal(cal.calibratedLeverage, 1);
    assert.equal(cal.walrusStance, 'UNFAMILIAR REGIME · MONITORED');
  }
});

test('Partial/weak match dampens memory weight and never gives catalyst boost', () => {
  const input = 'Long SUI borrow crowding macro, 5x';
  const ranked = rankMemoriesLocally(input, INITIAL_WALRUS_MEMORIES, DEFAULT_RISK_POLICY, 3);
  assert.equal(
    ranked.matchQuality,
    'WEAK_MATCH',
    `Expected WEAK_MATCH, got ${ranked.matchQuality} (${ranked.topSimilarity})`
  );
  const cal = computeRiskCalibration({
    proposedLeverage: 5,
    statelessConfidence: 87,
    ranked,
    policy: DEFAULT_RISK_POLICY
  });
  assert.ok(cal.calibratedLeverage <= DEFAULT_RISK_POLICY.weakMatchMaxLeverage);
  assert.ok(cal.walrusConfidence < 87);
  assert.equal(cal.walrusStance, 'PARTIAL MATCH · CONSERVATIVE CAP');

  const weakCatalystRanked = {
    results: [{ ...INITIAL_WALRUS_MEMORIES[1], similarityScore: 0.55 }],
    allCandidates: [{ ...INITIAL_WALRUS_MEMORIES[1], similarityScore: 0.55 }],
    topSimilarity: 0.55,
    matchQuality: 'WEAK_MATCH' as const
  };
  const weakCatCal = computeRiskCalibration({
    proposedLeverage: 4,
    statelessConfidence: 74,
    ranked: weakCatalystRanked,
    policy: DEFAULT_RISK_POLICY
  });
  assert.ok(weakCatCal.walrusConfidence < 74);
  assert.ok(weakCatCal.calibratedLeverage <= DEFAULT_RISK_POLICY.weakMatchMaxLeverage);
});

test('Saving an unseen regime lesson transitions future recall from UNFAMILIAR_REGIME to STRONG_MATCH', () => {
  const query = 'Long XAU/USD on FOMC shock, 5x';
  const before = rankMemoriesLocally(query, INITIAL_WALRUS_MEMORIES, DEFAULT_RISK_POLICY, 3);
  assert.equal(before.matchQuality, 'UNFAMILIAR_REGIME');

  const updatedMemories = [
    {
      id: `wal-${Date.now()}`,
      blobId: 'walrus_test_xau_fomc',
      text: 'Nov 15 2026 [XAU/USD FOMC shock]: FOMC rate shock caused -4.5% liquidity gap wick. Cap leverage at 1.5x.',
      category: 'FAILURE_CASE' as const,
      timestamp: new Date().toISOString(),
      similarityScore: 1,
      weightImpact: '-30% Confidence'
    },
    ...INITIAL_WALRUS_MEMORIES
  ];

  const after = rankMemoriesLocally(query, updatedMemories, DEFAULT_RISK_POLICY, 3);
  assert.equal(after.matchQuality, 'STRONG_MATCH');
  assert.equal(after.results[0]?.blobId, 'walrus_test_xau_fomc');
});

test('borrow utilization spike search in MemoryInspector finds relevant memories cleanly', () => {
  const ranked = rankMemoriesLocally('borrow utilization spike', INITIAL_WALRUS_MEMORIES, DEFAULT_RISK_POLICY, 8);
  assert.ok(ranked.results.length >= 2);
  assert.ok(ranked.topSimilarity >= DEFAULT_RISK_POLICY.strongMatchThreshold);
  assert.equal(scoreMemoryRelevance('banana quantum unicorn', INITIAL_WALRUS_MEMORIES[0].text), 0);
});

test('api/x402/check handler returns BASELINE_CAPPED for unfamiliar regimes and honors policy overrides', async () => {
  function runHandler(headers: Record<string, string>, body?: unknown) {
    return new Promise<{ statusCode: number; payload: any }>(resolve => {
      const req: any = { method: 'POST', headers, body, query: {} };
      const res: any = {
        headers: {},
        statusCode: 200,
        setHeader(k: string, v: string) {
          this.headers[k] = v;
          return this;
        },
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          resolve({ statusCode: this.statusCode, payload: data });
          return this;
        }
      };
      void handler(req, res);
    });
  }

  const unpaid = await runHandler({}, { trade: 'Long SUI 0.85, 3x' });
  assert.equal(unpaid.statusCode, 402);

  const known = await runHandler(
    { 'x-payment': 'sui:5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N' },
    { trade: 'Long SUI 0.85, 3x' }
  );
  assert.equal(known.statusCode, 200);
  assert.equal(known.payload.status, 'PROTECTED');
  assert.equal(known.payload.walrusMemoryRecall.matchQuality, 'STRONG_MATCH');
  assert.equal(known.payload.walrusMemoryRecall.matchedBlobId, 'thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0');
  assert.equal(known.payload.riskEvaluation.calibratedSizing.leverage, 2);

  const unseen = await runHandler(
    { 'x-payment': 'sui:5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N' },
    { trade: 'Long XAU/USD on FOMC shock, 5x' }
  );
  assert.equal(unseen.statusCode, 200);
  assert.equal(unseen.payload.status, 'BASELINE_CAPPED');
  assert.equal(unseen.payload.walrusMemoryRecall.matchQuality, 'UNFAMILIAR_REGIME');
  assert.equal(unseen.payload.walrusMemoryRecall.matchedBlobId, null);
  assert.equal(unseen.payload.riskEvaluation.calibratedSizing.leverage, 2);
  assert.equal(unseen.payload.riskEvaluation.calibratedSizing.calibratedBrierPenalty, null);

  const customPolicy = await runHandler(
    { 'x-payment': 'sui:5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N' },
    { trade: 'Long SUI on CPI print, 5x', policy: { unfamiliarMaxLeverage: 1, unfamiliarConfidenceCap: 40 } }
  );
  assert.equal(customPolicy.statusCode, 200);
  assert.equal(customPolicy.payload.walrusMemoryRecall.matchQuality, 'UNFAMILIAR_REGIME');
  assert.equal(customPolicy.payload.riskEvaluation.calibratedSizing.leverage, 1);
  assert.equal(customPolicy.payload.riskEvaluation.calibratedSizing.calibratedConfidence, '40%');
});

test('Live NAVI borrow utilization >= 75% enforces deterministic 2x ceiling on SUI-tracked trades', () => {
  // Even on a strong CATALYST match, live NAVI overheat (>= 75%) overrides leverage to <= 2x
  const catalystRanked = {
    results: [{ ...INITIAL_WALRUS_MEMORIES[1], similarityScore: 0.91 }],
    allCandidates: [{ ...INITIAL_WALRUS_MEMORIES[1], similarityScore: 0.91 }],
    topSimilarity: 0.91,
    matchQuality: 'STRONG_MATCH' as const
  };

  const overheated = computeRiskCalibration({
    proposedLeverage: 5,
    statelessConfidence: 87,
    ranked: catalystRanked,
    policy: DEFAULT_RISK_POLICY,
    liveNaviUtilizationPct: 79.4,
    isSuiTrackedAsset: true
  });

  assert.equal(overheated.liveNaviApplied, true);
  assert.equal(overheated.calibratedLeverage, 2);
  assert.ok(overheated.walrusConfidence <= 65);
  assert.match(overheated.policyApplied, /live_navi_overheat_cap/);
  assert.match(overheated.shortExplanation, /79\.4%/);

  // Normal live NAVI utilization (< 75%) does NOT trigger overheat cap
  const normal = computeRiskCalibration({
    proposedLeverage: 5,
    statelessConfidence: 87,
    ranked: catalystRanked,
    policy: DEFAULT_RISK_POLICY,
    liveNaviUtilizationPct: 53.4,
    isSuiTrackedAsset: true
  });
  assert.equal(normal.liveNaviApplied, false);
  assert.equal(normal.calibratedLeverage, 5);

  // Non-SUI external asset is isolated from SUI NAVI utilization
  const externalAsset = computeRiskCalibration({
    proposedLeverage: 5,
    statelessConfidence: 87,
    ranked: catalystRanked,
    policy: DEFAULT_RISK_POLICY,
    liveNaviUtilizationPct: 88.0,
    isSuiTrackedAsset: false
  });
  assert.equal(externalAsset.liveNaviApplied, false);
  assert.equal(externalAsset.calibratedLeverage, 5);
});

