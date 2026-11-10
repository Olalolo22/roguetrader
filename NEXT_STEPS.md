# RogueTrader — Post-Hackathon Roadmap & Next Steps

This document outlines the engineering roadmap and potential architecture extensions for **RogueTrader** following the initial submission to the **Tatum × Walrus Memory Hackathon ("Total Recall")**.

---

## 1. Live Lending & Borrow Rate Oracle (Potential Step)

### Context & Current State
In the hackathon prototype, macroeconomic feeds (Sui block height, SUI USD reference price, 24h DEX volume, and liquidity) are queried live via **Tatum RPC**, **Tatum Rate API**, and **DexScreener**. 

Microstructure lending variables—such as **NAVI Protocol borrow utilization (78.4%)**—are currently modeled using historical scenario presets (`MARKET_REGIMES`). This design was chosen intentionally to allow repeatable stress testing against severe historical crash setups (e.g., the Oct 14 long-squeeze cascade). On a typical day, borrow rates may hover around a calm 12%–18%, which does not trigger risk mitigation logic; presets ensure judges and developers can audit how the system behaves under extreme leverage stress.

### Proposed Improvement
Add a **Dual-Mode Microstructure Engine**:
1. **Live Market Mode:** Automatically fetch the real-time SUI borrow rate directly from NAVI Protocol's on-chain reserve objects on Sui Mainnet.
2. **Stress Replay Mode:** Allow traders and developers to toggle historical crisis regimes (e.g., Oct 14 borrow squeeze, Scallop flash-loan distortion) to audit how memory-adjusted shrinkage protects capital.

### Implementation Blueprint
NAVI exposes an official TypeScript SDK (`@naviprotocol/lending`) that reads reserve state directly from Sui Mainnet without requiring custom Move parsing:

```bash
npm install @naviprotocol/lending
```

```typescript
// src/services/naviOracle.ts
import { getPools } from '@naviprotocol/lending';

export interface NaviMarketData {
  borrowRatePct: number;
  supplyRatePct: number;
  isOverheated: boolean;
}

export async function getLiveNaviBorrowRate(): Promise<NaviMarketData> {
  try {
    const pools = await getPools({ env: 'prod', cacheTime: 30000 });
    const suiPool = pools.find(p => p.coinType.endsWith('::sui::SUI'));
    
    if (suiPool && suiPool.currentBorrowRate) {
      const borrowRatePct = parseFloat(suiPool.currentBorrowRate);
      return {
        borrowRatePct,
        supplyRatePct: parseFloat(suiPool.currentSupplyRate || '0'),
        isOverheated: borrowRatePct > 70.0
      };
    }
  } catch (err) {
    console.warn('[NAVI Oracle] Live borrow query failed, using baseline:', err);
  }
  
  // Safe baseline fallback when offline
  return { borrowRatePct: 18.2, supplyRatePct: 4.1, isOverheated: false };
}
```

---

## 2. Automated Outcome Resolution Keeper for Walrus Forecasts

### Context & Current State
On November 9, 2026, three out-of-sample forward forecast records were committed directly to Walrus Mainnet (`forecast-20261109-001` through `003` under account `0xf7bb…e223`) prior to market resolution:
* `forecast-001` (`PWaVduVd…`): SUI/USD breakout long.
* `forecast-002` (`8AXIPosW…`): SUI/USD dip-buy at support.
* `forecast-003` (`8YTdc-av…`): SUI/USD 5m momentum scalp.

Currently, logging new trade lessons is triggered manually or through caller API requests.

### Proposed Improvement
Build a lightweight autonomous **Keeper Bot** that:
1. Monitors open forecast blobs on Walrus via their expiration timestamps.
2. At resolution, queries the live SUI reference price and checkpoint via Tatum's API to evaluate whether the price target or stop-loss was triggered.
3. Computes the binary outcome (`o_t = 1` for win, `0` for stop-out/liquidation) and calculates the definitive Brier score penalty:
   ```text
   Brier_Penalty = (f_calibrated - o_t)^2
   ```
4. Commits the final post-mortem autopsy blob back to Walrus Mainnet (`memwal.remember`), closing the empirical feedback loop autonomously.

---

## 3. DeepBook v3 Orderbook Imbalance Feed

### Context & Current State
The 5-variable market state vector includes **Orderbook Imbalance (`Bid_Depth / Ask_Depth`)**. In the current release, orderbook depth scenarios are simulated via `MARKET_REGIMES`.

### Proposed Improvement
Integrate the `@mysten/deepbook-v3` SDK to pull the live bid/ask orderbook state on the `SUI/USDC` pair directly from Sui Mainnet:
* Calculate depth within 1% and 2% of the mid-market price.
* Identify "bid vacuums" where thin liquidity leaves long positions vulnerable to high-slippage wick liquidations.

---

## 4. Production-Grade x402 Replay Cache & Session Payments

### Context & Current State
The latest [`api/x402/check.ts`](./api/x402/check.ts) verifies transaction digests on-chain using `SuiGrpcClient`, confirms that the recipient address received $\ge 0.05$ SUI via `balanceChanges`, and enforces replay protection through an in-memory `Set<string>`.

### Proposed Improvement
1. **Distributed Replay Store:** Connect the replay cache to a distributed key-value store (e.g., Redis / Vercel KV) or an on-chain Sui nonce registry to ensure digest redemption is strictly atomic across multi-region serverless deployments.
2. **Session / Channel Payments (Metered Billing):** For high-frequency algorithmic bots, individual per-trade micropayments introduce roundtrip latency. Implement x402 payment channels where an agent deposits 1.0 SUI upfront and burns micro-vouchers per check off-chain, settling the channel periodically.

---

## 5. Inline DEX Router Hook (Enforcement Mode)

### Context & Current State
RogueTrader is currently positioned as an advisory **Pre-Trade Risk System (PTRS)**. It evaluates risk over HTTP or UI and returns calibrated sizing before the trader or bot signs their transaction. It does not physically block orders inside smart contracts.

### Proposed Improvement
Deploy an optional Sui Move wrapper module (`roguetrader::router`) that wraps Cetus and DeepBook swap endpoints:
* Traders configure risk mandates (e.g., *"Do not execute any order where Walrus similarity to past liquidation traps exceeds 0.80"*).
* The Move contract verifies an off-chain risk signature or viewing key before dispatching the trade, providing optional hard execution enforcement for risk-averse treasuries and autonomous agents.
