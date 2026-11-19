import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fetchLiveNaviSuiMetrics,
  NAVI_OVERHEAT_UTILIZATION_PCT,
  NAVI_SUI_RESERVE_OBJECT_ID,
  parseDefiLlamaNaviPool,
  parseNaviMoveReserveJson
} from '../src/services/naviOracle.ts';

test('parseNaviMoveReserveJson accurately decodes NAVI Ray 1e27 Move ReserveData JSON', () => {
  // Exact Move field structure from NAVI Protocol Mainnet SUI Reserve object
  const moveReserveJson = {
    value: {
      fields: {
        current_borrow_rate: '80200000000000000000000000', // 8.02% APR (raw / 1e25)
        current_supply_rate: '34300000000000000000000000', // 3.43% APR (raw / 1e25)
        current_supply_index: '1100000000000000000000000000', // 1.10x
        current_borrow_index: '1200000000000000000000000000', // 1.20x
        supply_balance: {
          fields: {
            total_supply: '1000000000000' // effective = 1.1e12
          }
        },
        borrow_balance: {
          fields: {
            total_supply: '489500000000' // effective = 5.874e11 => 5.874e11 / 1.1e12 = 53.4%
          }
        }
      }
    }
  };

  const parsed = parseNaviMoveReserveJson(moveReserveJson);
  assert.ok(parsed);
  assert.equal(parsed.borrowUtilizationPct, 53.4);
  assert.equal(parsed.borrowAprPct, 8.02);
  assert.equal(parsed.supplyAprPct, 3.43);

  // Rejects malformed / zero-supply payloads cleanly
  assert.equal(parseNaviMoveReserveJson(null), null);
  assert.equal(parseNaviMoveReserveJson({ supply_balance: { total_supply: '0' }, borrow_balance: { total_supply: '10' } }), null);
});

test('parseDefiLlamaNaviPool extracts live NAVI SUI pool metrics', () => {
  const payload = {
    status: 'success',
    data: [
      { chain: 'Ethereum', project: 'aave-v3', symbol: 'USDC', totalSupplyUsd: 1000, totalBorrowUsd: 500 },
      {
        chain: 'Sui',
        project: 'navi-lending',
        symbol: 'SUI',
        totalSupplyUsd: 100_000_000,
        totalBorrowUsd: 78_400_000,
        apyBaseBorrow: 11.45,
        apyBase: 6.12
      }
    ]
  };

  const parsed = parseDefiLlamaNaviPool(payload);
  assert.ok(parsed);
  assert.equal(parsed.borrowUtilizationPct, 78.4);
  assert.equal(parsed.borrowAprPct, 11.45);
  assert.equal(parsed.supplyAprPct, 6.12);
});

test('fetchLiveNaviSuiMetrics reads NAVI Reserve via Tatum Sui GraphQL first with x-api-key', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; headers: Record<string, string>; body: any }> = [];

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, headers, body });

    return new Response(
      JSON.stringify({
        data: {
          object: {
            asMoveObject: {
              contents: {
                json: {
                  current_borrow_rate: '125000000000000000000000000', // 12.50%
                  current_supply_rate: '71000000000000000000000000', // 7.10%
                  current_supply_index: '1000000000000000000000000000',
                  current_borrow_index: '1000000000000000000000000000',
                  supply_balance: { total_supply: '1000' },
                  borrow_balance: { total_supply: '790' }
                }
              }
            }
          }
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const metrics = await fetchLiveNaviSuiMetrics({ tatumApiKey: 't-live-key' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://sui-mainnet.gateway.tatum.io/graphql');
    assert.equal(calls[0].headers['x-api-key'], 't-live-key');
    assert.equal(calls[0].body.variables.address, NAVI_SUI_RESERVE_OBJECT_ID);
    assert.equal(metrics.source, 'tatum_sui_graphql');
    assert.equal(metrics.borrowUtilizationPct, 79.0);
    assert.equal(metrics.borrowAprPct, 12.5);
    assert.equal(metrics.supplyAprPct, 7.1);
    assert.equal(metrics.isOverheated, 79.0 >= NAVI_OVERHEAT_UTILIZATION_PCT);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchLiveNaviSuiMetrics falls back cleanly to DeFiLlama and returns honest unavailable (nulls) when offline', async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];

  // Scenario A: GraphQL fails -> DeFiLlama succeeds
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    urls.push(url);

    if (url.includes('graphql')) {
      return new Response('unavailable', { status: 503 });
    }
    if (url.includes('yields.llama.fi')) {
      return new Response(
        JSON.stringify({
          data: [
            {
              chain: 'Sui',
              project: 'navi-lending',
              symbol: 'SUI',
              totalSupplyUsd: 50_000_000,
              totalBorrowUsd: 26_700_000,
              apyBaseBorrow: 8.1,
              apyBase: 3.4
            }
          ]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;

  try {
    const fallbackRes = await fetchLiveNaviSuiMetrics({ tatumApiKey: 't-key' });
    assert.deepEqual(urls, [
      'https://sui-mainnet.gateway.tatum.io/graphql',
      'https://graphql.mainnet.sui.io/graphql',
      'https://yields.llama.fi/poolsBorrow'
    ]);
    assert.equal(fallbackRes.source, 'defillama_live');
    assert.equal(fallbackRes.borrowUtilizationPct, 53.4);
    assert.equal(fallbackRes.isOverheated, false);

    // Scenario B: All live endpoints fail -> honest unavailable with null metrics (zero fabricated numbers)
    globalThis.fetch = (async () => {
      throw new Error('network offline');
    }) as typeof fetch;

    const offlineRes = await fetchLiveNaviSuiMetrics({ tatumApiKey: 't-key' });
    assert.equal(offlineRes.source, 'unavailable');
    assert.equal(offlineRes.borrowUtilizationPct, null);
    assert.equal(offlineRes.borrowAprPct, null);
    assert.equal(offlineRes.supplyAprPct, null);
    assert.equal(offlineRes.isOverheated, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
