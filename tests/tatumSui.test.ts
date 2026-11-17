import assert from 'node:assert/strict';
import test from 'node:test';
import { TatumSuiService } from '../src/services/tatumSui.ts';
import handler from '../api/x402/check.ts';

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

test('TatumSuiService queries Tatum Sui GraphQL with x-api-key and never sends deprecated JSON-RPC', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; headers: Record<string, string>; body: any }> = [];

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, headers, body });

    return new Response(JSON.stringify({ data: { checkpoint: { sequenceNumber: 344100999 } } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }) as typeof fetch;

  try {
    const svc = new TatumSuiService();
    svc.setApiKey('t-test-key-123');
    const cp = await svc.getLatestCheckpoint();
    assert.equal(cp, 344100999);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://sui-mainnet.gateway.tatum.io/graphql');
    assert.equal(calls[0].headers['x-api-key'], 't-test-key-123');
    assert.equal(calls[0].body.jsonrpc, undefined);
    assert.match(calls[0].body.query, /checkpoint\s*\{\s*sequenceNumber\s*\}/);
    assert.equal(svc.getGatewayHost(), 'sui-mainnet.gateway.tatum.io/graphql');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('TatumSuiService falls back from Tatum GraphQL to public Sui GraphQL and strictly checks transaction status', async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    urls.push(url);
    const body = init?.body ? JSON.parse(String(init.body)) : {};

    if (url.includes('tatum.io')) {
      return new Response('rate limited', { status: 429 });
    }
    const digest = body?.variables?.digest;
    if (digest === 'validTxDigest123') {
      return new Response(
        JSON.stringify({
          data: { transaction: { digest, effects: { status: 'SUCCESS', checkpoint: { sequenceNumber: 344101001 } } } }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ data: { transaction: null } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }) as typeof fetch;

  try {
    const svc = new TatumSuiService();
    svc.setApiKey('t-test-key-123');

    assert.equal(await svc.verifyTransaction('validTxDigest123'), true);
    assert.deepEqual(urls, [
      'https://sui-mainnet.gateway.tatum.io/graphql',
      'https://graphql.mainnet.sui.io/graphql'
    ]);

    assert.equal(await svc.verifyTransaction('nonExistentTxDigest'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('api/x402/check verifies custom payments via Tatum Sui GraphQL and rejects insufficient SUI transfers', async () => {
  const originalFetch = globalThis.fetch;
  const prevTatumKey = process.env.TATUM_API_KEY;
  process.env.TATUM_API_KEY = 't-server-key-456';

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const body = init?.body ? JSON.parse(String(init.body)) : {};

    // Ensure zero deprecated JSON-RPC requests are issued
    assert.equal(body.jsonrpc, undefined);

    if (url === 'https://sui-mainnet.gateway.tatum.io/graphql') {
      const digest = body?.variables?.digest;
      if (digest === 'CustomPaidTxDigest999') {
        return new Response(
          JSON.stringify({
            data: {
              transaction: {
                digest,
                effects: {
                  status: 'SUCCESS',
                  checkpoint: { sequenceNumber: 344200555 },
                  balanceChangesJson: [
                    {
                      address: '0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d',
                      coinType: '0x2::sui::SUI',
                      amount: '50000000'
                    }
                  ]
                }
              }
            }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (digest === 'CustomUnderpaidTxDigest111') {
        return new Response(
          JSON.stringify({
            data: {
              transaction: {
                digest,
                effects: {
                  status: 'SUCCESS',
                  checkpoint: { sequenceNumber: 344200556 },
                  balanceChangesJson: [
                    {
                      address: '0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d',
                      coinType: '0x2::sui::SUI',
                      amount: '10000000'
                    }
                  ]
                }
              }
            }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(JSON.stringify({ data: { transaction: null } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }) as typeof fetch;

  try {
    const paid = await runHandler(
      { 'x-payment': 'sui:CustomPaidTxDigest999' },
      { trade: 'Long SUI 0.85, 3x' }
    );
    assert.equal(paid.statusCode, 200);
    assert.equal(paid.payload.settlement.verificationSource, 'tatum-sui-graphql');
    assert.equal(paid.payload.settlement.checkpoint, 344200555);

    const underpaid = await runHandler(
      { 'x-payment': 'sui:CustomUnderpaidTxDigest111' },
      { trade: 'Long SUI 0.85, 3x' }
    );
    assert.equal(underpaid.statusCode, 402);
    assert.equal(underpaid.payload.error, 'Insufficient SUI Payment');
  } finally {
    globalThis.fetch = originalFetch;
    if (prevTatumKey === undefined) {
      delete process.env.TATUM_API_KEY;
    } else {
      process.env.TATUM_API_KEY = prevTatumKey;
    }
  }
});
