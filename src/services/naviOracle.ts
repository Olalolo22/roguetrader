import type { NaviBorrowMetrics } from '../types/index.ts';

/**
 * Official NAVI Protocol Mainnet SUI Reserve Move object on Sui.
 * Source: NAVI Lending SDK pool registry (`main-0` / `0x2::sui::SUI`).
 */
export const NAVI_SUI_RESERVE_OBJECT_ID =
  '0xab644b5fd11aa11e930d1c7bc903ef609a9feaf9ffe1b23532ad8441854fbfaf';

export const NAVI_OVERHEAT_UTILIZATION_PCT = 75;

const TATUM_GRAPHQL_URL = 'https://sui-mainnet.gateway.tatum.io/graphql';
const PUBLIC_SUI_GRAPHQL_URL = 'https://graphql.mainnet.sui.io/graphql';
const DEFILLAMA_BORROW_POOLS_URL = 'https://yields.llama.fi/poolsBorrow';

const NAVI_RESERVE_OBJECT_QUERY = `
  query GetNaviSuiReserve($address: SuiAddress!) {
    object(address: $address) {
      asMoveObject {
        contents {
          json
        }
      }
    }
  }
`;

const RAY_SCALE = 1e27;

function toPositiveNumber(val: unknown): number | null {
  if (typeof val === 'number') return Number.isFinite(val) && val >= 0 ? val : null;
  if (typeof val === 'string' && val.trim() !== '') {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

function unwrapMoveFields(node: any): Record<string, any> | null {
  if (!node || typeof node !== 'object') return null;
  if (node.value && typeof node.value === 'object') {
    return unwrapMoveFields(node.value);
  }
  if (node.fields && typeof node.fields === 'object') {
    return unwrapMoveFields(node.fields);
  }
  return node as Record<string, any>;
}

function extractTotalFromBalanceNode(node: any): number | null {
  const direct = toPositiveNumber(node);
  if (direct != null) return direct;
  const unwrapped = unwrapMoveFields(node);
  if (!unwrapped) return null;
  return (
    toPositiveNumber(unwrapped.total_supply) ??
    toPositiveNumber(unwrapped.totalSupply) ??
    toPositiveNumber(unwrapped.value) ??
    null
  );
}

/**
 * Parses NAVI Protocol on-chain Move ReserveData JSON (from Sui GraphQL) into live
 * borrow utilization %, borrow APR %, and supply APR %.
 *
 * NAVI uses Ray fixed-point (1e27 = 100%):
 *   APR % = rawRate / 1e25
 *   Actual Supplied = supply_balance.total_supply * (current_supply_index / 1e27)
 *   Actual Borrowed = borrow_balance.total_supply * (current_borrow_index / 1e27)
 */
export function parseNaviMoveReserveJson(
  rawJson: unknown
): { borrowUtilizationPct: number; borrowAprPct: number | null; supplyAprPct: number | null } | null {
  const fields = unwrapMoveFields(rawJson);
  if (!fields) return null;

  const rawBorrowRate =
    toPositiveNumber(fields.current_borrow_rate) ?? toPositiveNumber(fields.currentBorrowRate);
  const rawSupplyRate =
    toPositiveNumber(fields.current_supply_rate) ?? toPositiveNumber(fields.currentSupplyRate);

  const borrowAprPct =
    rawBorrowRate != null ? Number(((rawBorrowRate / RAY_SCALE) * 100).toFixed(2)) : null;
  const supplyAprPct =
    rawSupplyRate != null ? Number(((rawSupplyRate / RAY_SCALE) * 100).toFixed(2)) : null;

  // Prefer already-indexed amounts if provided, else compute from raw totals * Ray indices
  const directSupplyAmt = toPositiveNumber(fields.totalSupplyAmount);
  const directBorrowAmt = toPositiveNumber(fields.borrowedAmount);

  let effectiveSupply: number | null = directSupplyAmt;
  let effectiveBorrow: number | null = directBorrowAmt;

  if (effectiveSupply == null || effectiveBorrow == null) {
    const rawSupply =
      extractTotalFromBalanceNode(fields.supply_balance) ??
      toPositiveNumber(fields.total_supply) ??
      toPositiveNumber(fields.totalSupply);
    const rawBorrow =
      extractTotalFromBalanceNode(fields.borrow_balance) ??
      toPositiveNumber(fields.total_borrow) ??
      toPositiveNumber(fields.totalBorrow);

    if (rawSupply == null || rawBorrow == null || rawSupply <= 0) return null;

    const supplyIdx =
      toPositiveNumber(fields.current_supply_index) ??
      toPositiveNumber(fields.currentSupplyIndex) ??
      RAY_SCALE;
    const borrowIdx =
      toPositiveNumber(fields.current_borrow_index) ??
      toPositiveNumber(fields.currentBorrowIndex) ??
      RAY_SCALE;

    effectiveSupply = rawSupply * (supplyIdx / RAY_SCALE);
    effectiveBorrow = rawBorrow * (borrowIdx / RAY_SCALE);
  }

  if (!effectiveSupply || effectiveSupply <= 0 || effectiveBorrow == null) return null;

  const utilizationPct = Number(
    Math.max(0, Math.min(100, (effectiveBorrow / effectiveSupply) * 100)).toFixed(1)
  );

  return {
    borrowUtilizationPct: utilizationPct,
    borrowAprPct,
    supplyAprPct
  };
}

/**
 * Parses DeFiLlama `/poolsBorrow` payload to locate the live NAVI SUI lending pool on Sui.
 */
export function parseDefiLlamaNaviPool(
  payload: unknown
): { borrowUtilizationPct: number; borrowAprPct: number | null; supplyAprPct: number | null } | null {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] } | null)?.data)
      ? ((payload as { data: unknown[] }).data as any[])
      : [];

  const suiPool = list.find((p: any) => {
    const chain = String(p?.chain ?? '').toLowerCase();
    const project = String(p?.project ?? '').toLowerCase();
    const symbol = String(p?.symbol ?? '').toUpperCase();
    return chain === 'sui' && project.includes('navi') && symbol === 'SUI';
  });

  if (!suiPool) return null;

  const supplyUsd = toPositiveNumber(suiPool.totalSupplyUsd);
  const borrowUsd = toPositiveNumber(suiPool.totalBorrowUsd);
  if (supplyUsd == null || borrowUsd == null || supplyUsd <= 0) return null;

  const utilizationPct = Number(
    Math.max(0, Math.min(100, (borrowUsd / supplyUsd) * 100)).toFixed(1)
  );
  const rawBorrowApr = toPositiveNumber(suiPool.apyBaseBorrow);
  const rawSupplyApr = toPositiveNumber(suiPool.apyBase);

  return {
    borrowUtilizationPct: utilizationPct,
    borrowAprPct: rawBorrowApr != null ? Number(rawBorrowApr.toFixed(2)) : null,
    supplyAprPct: rawSupplyApr != null ? Number(rawSupplyApr.toFixed(2)) : null
  };
}

export async function fetchLiveNaviSuiMetrics(options?: {
  tatumApiKey?: string;
  timeoutMs?: number;
}): Promise<NaviBorrowMetrics> {
  const apiKey = (options?.tatumApiKey ?? '').trim();
  const timeoutMs = options?.timeoutMs ?? 4500;
  const fetchedAt = new Date().toISOString();

  // 1. Primary: Read NAVI SUI Reserve Move object directly from Sui Mainnet via Tatum Sui GraphQL
  const graphqlTargets: Array<{
    url: string;
    headers: Record<string, string>;
    source: 'tatum_sui_graphql' | 'public_sui_graphql';
  }> = apiKey
    ? [
        {
          url: TATUM_GRAPHQL_URL,
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
          source: 'tatum_sui_graphql'
        },
        {
          url: PUBLIC_SUI_GRAPHQL_URL,
          headers: { 'Content-Type': 'application/json' },
          source: 'public_sui_graphql'
        }
      ]
    : [
        {
          url: PUBLIC_SUI_GRAPHQL_URL,
          headers: { 'Content-Type': 'application/json' },
          source: 'public_sui_graphql'
        }
      ];

  for (const target of graphqlTargets) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetch(target.url, {
        method: 'POST',
        headers: target.headers,
        signal: controller?.signal,
        body: JSON.stringify({
          query: NAVI_RESERVE_OBJECT_QUERY,
          variables: { address: NAVI_SUI_RESERVE_OBJECT_ID }
        })
      });
      if (!res.ok) continue;

      const body = (await res.json()) as {
        data?: { object?: { asMoveObject?: { contents?: { json?: unknown } | null } | null } | null };
        errors?: unknown[];
      };
      const moveJson = body?.data?.object?.asMoveObject?.contents?.json;
      const parsed = parseNaviMoveReserveJson(moveJson);
      if (parsed) {
        return {
          borrowUtilizationPct: parsed.borrowUtilizationPct,
          borrowAprPct: parsed.borrowAprPct,
          supplyAprPct: parsed.supplyAprPct,
          isOverheated: parsed.borrowUtilizationPct >= NAVI_OVERHEAT_UTILIZATION_PCT,
          source: target.source,
          reserveObjectId: NAVI_SUI_RESERVE_OBJECT_ID,
          fetchedAt
        };
      }
    } catch {
      // Try next live source
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  // 2. Secondary Live Fallback: DeFiLlama live borrow pools endpoint
  {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetch(DEFILLAMA_BORROW_POOLS_URL, { signal: controller?.signal });
      if (res.ok) {
        const body = await res.json();
        const parsed = parseDefiLlamaNaviPool(body);
        if (parsed) {
          return {
            borrowUtilizationPct: parsed.borrowUtilizationPct,
            borrowAprPct: parsed.borrowAprPct,
            supplyAprPct: parsed.supplyAprPct,
            isOverheated: parsed.borrowUtilizationPct >= NAVI_OVERHEAT_UTILIZATION_PCT,
            source: 'defillama_live',
            reserveObjectId: NAVI_SUI_RESERVE_OBJECT_ID,
            fetchedAt
          };
        }
      }
    } catch {
      // Fall through to honest unavailable state
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  // 3. Honest unavailable state — never fabricate fake live borrow rates
  return {
    borrowUtilizationPct: null,
    borrowAprPct: null,
    supplyAprPct: null,
    isOverheated: false,
    source: 'unavailable',
    reserveObjectId: NAVI_SUI_RESERVE_OBJECT_ID,
    fetchedAt
  };
}
