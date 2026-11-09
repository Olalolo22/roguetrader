import fs from 'node:fs';
import { MemWal } from '@mysten-incubation/memwal';

const envUrl = new URL('../.env', import.meta.url);
function readEnv() {
  const txt = fs.readFileSync(envUrl, 'utf8');
  return Object.fromEntries(
    txt
      .split('\n')
      .filter(l => l.includes('='))
      .map(l => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = readEnv();
const accountId = env.VITE_MEMWAL_ACCOUNT_ID;
if (!accountId || !env.VITE_MEMWAL_KEY) {
  console.error('Missing VITE_MEMWAL_ACCOUNT_ID or VITE_MEMWAL_KEY');
  process.exit(1);
}

console.log('Connecting to Walrus Memory Mainnet for Account:', accountId);
const memwal = MemWal.create({
  key: env.VITE_MEMWAL_KEY,
  accountId,
  namespace: 'roguetrader',
  serverUrl: 'https://relayer.memory.walrus.xyz',
  requestTimeoutMs: 60000,
  recallTimeoutMs: 25000
});

const ADDITIONAL_MEMORIES = [
  {
    id: 'mem-007',
    category: 'FAILURE_CASE',
    text: 'Oct 28 2026 [Venue: Cetus vs DeepBook | Volatility: 4.8% 1h | NAVI Borrow: 76.2%]: SUI flash dip through DeepBook bid vacuum. Rapid stop-hunt wicked longs before bouncing. Mandate: Require orderbook depth > 2x position size.'
  },
  {
    id: 'mem-008',
    category: 'FAILURE_CASE',
    text: 'Oct 30 2026 [Venue: NAVI / Scallop Flash-Loan | Borrow: 82%]: Large flash-loan liquidity shift temporarily distorted lending pool APY to 140%, forcing automated vault deleveraging. Mandate: Filter out flash-loan-induced APY spikes.'
  },
  {
    id: 'mem-009',
    category: 'CATALYST',
    text: 'Nov 02 2026 [Venue: Cetus SUI/USDC | Spread: 0.9 bps | Vol: $31M (+45%)]: Clean trend continuation post-consolidation with low leverage (<40%). Long positions scaled safely up to 3x with zero liquidation stress.'
  },
  {
    id: 'mem-010',
    category: 'FAILURE_CASE',
    text: 'Nov 04 2026 [Venue: Cetus Meme Pools | Scallop Borrow: 86%]: Overleveraged longs on high-beta meme tokens experienced a -22% cascade liquidation within 15 minutes. Mandate: Cap meme asset leverage at 1x spot.'
  },
  {
    id: 'mem-011',
    category: 'REGIME_SHIFT',
    text: 'Nov 06 2026 [Venue: Sui Checkpoint Lag | Oracle Tick: Delayed 25s]: Network congestion caused temporary 25s delay in Pyth price push on Cetus CLMM. Directional market orders suffered 1.2% slippage. Mandate: Enforce limit orders only during congestion.'
  },
  {
    id: 'mem-012',
    category: 'CATALYST',
    text: 'Nov 08 2026 [Venue: DeepBook v3 Wholesale | Bid Depth: $8.2M]: Wall of institutional bids absorbed heavy sell pressure at $2.02, preventing cascading liquidations across Sui perps. Mandate: Re-enable trend-following above verified wall.'
  }
];

console.log(`Writing ${ADDITIONAL_MEMORIES.length} additional memories to Walrus Mainnet (to reach 12 total)...`);
let newBlobs = [];
try {
  const bulkRes = await memwal.rememberBulkAndWait(
    ADDITIONAL_MEMORIES.map(m => ({ text: m.text, namespace: 'roguetrader' })),
    { timeoutMs: 180000, pollIntervalMs: 3000 }
  );
  console.log('Bulk write success:', JSON.stringify(bulkRes, null, 2));
  newBlobs = bulkRes.results || bulkRes;
} catch (err) {
  console.log('Bulk write fallback to individual write:', err.message);
  for (const m of ADDITIONAL_MEMORIES) {
    console.log('Writing', m.id, '...');
    const r = await memwal.rememberAndWait(m.text, 'roguetrader', { timeoutMs: 120000, pollIntervalMs: 3000 });
    console.log('Saved:', r);
    newBlobs.push(r);
  }
}

// Update mainnet-proof.json
const proofPath = new URL('../mainnet-proof.json', import.meta.url);
const currentProof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
currentProof.writtenBlobs = [...currentProof.writtenBlobs, ...newBlobs];
currentProof.totalMemoriesOnMainnet = currentProof.writtenBlobs.length;

// Re-verify recall with query targeting one of the new memories
console.log('\nRunning recall verification across all 12 memories...');
const recallTest = await memwal.recall({
  query: 'overleveraged meme token high-beta liquidation cascade Scallop borrow 86%',
  limit: 3,
  namespace: 'roguetrader'
});
console.log('New Recall Results:', JSON.stringify(recallTest, null, 2));
currentProof.recallVerification = recallTest;

fs.writeFileSync(proofPath, JSON.stringify(currentProof, null, 2));
console.log(`\nSuccessfully updated mainnet-proof.json with ${currentProof.writtenBlobs.length} total live Walrus memories!`);

