# How I Built a Pre-Trade Risk Guard on Sui That Remembers Past Liquidation Traps

**Every rogue trader—human or AI—has the exact same fatal flaw: nobody remembers the last blowup.**

Most crypto traders and autonomous trading bots don't blow up their accounts because they lack price charts. They blow up because nothing stops them from taking the **exact same losing setup** they took two weeks ago.

Ask a stateless LLM trading agent whether to go `3x Long SUI` during a Cetus volume spike, and it will hallucinate `88% confidence` and tell you to ape in—completely oblivious to the fact that the last three times NAVI borrow utilization was above `75%` with a thin DeepBook bid book, late longs got wiped out by an `-8.2%` long-squeeze wick within 40 minutes.

So for the **Tatum × Walrus Memory Hackathon ("Total Recall")**, I built **RogueTrader**: a 1-click pre-trade risk guard on **Sui Mainnet** powered by **Walrus Memory (`@mysten-incubation/memwal`)**, **Tatum RPC & Price API**, and **HTTP 402 (`x402`)** agent micropayments.

- **Primary Track:** Track 1: Markets & Sports Prediction ($1,000)
- **Special Bounties:** Best Walrus Memory ($500) · Best Use of Agent Payments on Sui ($500)
- **Live App:** [roguetrader.vercel.app](https://roguetrader.vercel.app)
- **GitHub Repository:** [github.com/Olalolo22/roguetrader](https://github.com/Olalolo22/roguetrader)
- **Sui Mainnet `MemWalAccount`:** `0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223`

---

## 1. The 20-Second Payoff: What RogueTrader Actually Does

RogueTrader is an advisory pre-flight risk check for traders and autonomous bots on Sui (accessible via a web desk or an HTTP 402 endpoint).

When you type an intended trade like `Long SUI 0.85, 3x` and click **Check Trade**:

1. **Reads Live Sui Market Data + Microstructure Presets:** Pulls the current Sui Mainnet checkpoint (`sui_getLatestCheckpointSequenceNumber` via `sui-mainnet.gateway.tatum.io`), live SUI reference price (`~$0.85` via Tatum Rate API), and 24h SUI DEX volume/liquidity (via DexScreener), while mapping microstructure regime metrics (such as NAVI borrow utilization and orderbook skew) via selectable benchmark presets (`MARKET_REGIMES`).
2. **Recalls Matching Blowups from Walrus Mainnet (`<1s`):** Queries our `roguetrader` namespace on `relayer.memory.walrus.xyz` across **12 seeded historical Sui DEX liquidation and breakout regimes** stored on Walrus Mainnet.
3. **Advises Cutting Leverage Before You Get Liquidated:** Instead of letting you enter blind at `3.0x` leverage (where a `33.3%` move wipes you out), RogueTrader matches the `78.4% NAVI borrow squeeze` regime, penalizes overconfidence from `84%` down to `62%`, and **advises cutting your size from `3.0x` to `2.0x`**—widening your wipeout buffer to `50.0%` and **protecting `$1,420` from a repeat stop-out** *(illustrative on a $10,000 position: cutting leverage from 3.0x to 2.0x widens liquidation buffer by +16.7% against an adverse wick)*.
4. **Logs Post-Trade Outcomes Back to Walrus:** Below the check card, our post-trade outcome logger (`0xaff0…4b4d`) lets you (or a bot via the SDK) commit post-trade outcome lessons directly back to Walrus Mainnet (`memwal.remember`) so the guard expands its memory bank after completed trades.

---

## 2. Why Nominal Prices Don't Cause Liquidations—Microstructure Does

One of the biggest traps in building AI trading memory is storing naive text diaries like *"Bought SUI at $2.14 and lost money."* Nominal price levels go stale the moment a market trends from `$2.14` to `$0.85`.

What actually causes liquidations is **sizing into the wrong market microstructure**. Every memory in RogueTrader encodes a **5-variable entry state fingerprint (`State_t`)**:

```text
1. Size-to-Depth Ratio:     Order_Size / Active_Tick_Liquidity (Cetus / DeepBook pool depth)
2. Crowding & Borrow Skew:  NAVI / Scallop Borrow_Utilization (e.g. >75% crowded longs)
3. Orderbook Imbalance:     DeepBook_Bid_Depth / Ask_Depth (spot support vs. air pocket)
4. Wipeout Buffer vs. Wick: (100% / Leverage) vs. Historical_Regime_Max_Adverse_Wick
5. Venue / Oracle Lag:      abs(AMM_Spot_Price - Pyth_Reference_Price) at Sui epoch boundaries
```

When a proposed order matches a high-wick microstructure fingerprint recalled from Walrus, RogueTrader advises scaling down leverage so your **Wipeout Buffer (`100% / Leverage`)** remains safely wider than that regime's historical wick.

- **Scope Boundary (Directional Sizing vs. Alpha Generation):** RogueTrader is not an alpha strategy generator (it does not run statistical arbitrage, delta-neutral basis farming, or LP tick optimization). The trader or autonomous agent brings its own directional thesis (`1x–5x` Long/Short on Sui DEXs); RogueTrader acts strictly as an **advisory pre-flight risk check** that evaluates whether current Sui liquidity, borrow utilization, and historical memory justify the proposed size.

---

## 3. Epistemic Calibration Shrinkage Benchmark (Brier: `0.468` -> `0.128`)

When a trade is checked, the uncalibrated LLM proposes a baseline prior confidence (`f_prior = 84%`). RogueTrader queries Walrus vector memory, retrieves the top-3 similar historical regimes (`memwal.recall`), computes the similarity-weighted failure severity across recalled failure cases, and applies an epistemic shrinkage penalty:

```text
f_calibrated = f_prior - Penalty(recalled_failures, cosine_similarity)
             = 0.84 - 0.22 = 0.62 (leverage cut from 3.0x to 2.0x)
```

In quantitative finance, probabilistic forecasts are audited using the **Brier Score**—the mean squared error between an agent's stated probability and the binary outcome:

```text
Brier = (1 / N) * SUM_{t=1..N} (f_t - o_t)^2
```

Where:
- `f_t` is the agent's forecast confidence (e.g. `0.84` uncalibrated vs. `0.62` calibrated).
- `o_t` is the binary regime outcome (`1` if the continuation setup followed through, `0` if it wicked out or liquidated).
- `N` is the number of evaluated benchmark scenarios.

Across our 5-scenario Sui microstructure benchmark (`HISTORICAL_BENCHMARK_ROWS` in `src/services/agentEngine.ts`):
- **Stateless Baseline (Without Memory):** Assigns `81%–94%` confidence on crowded breakouts and social spikes. On failure regimes (`o_t = 0`), `(0.88 - 0)^2 = 0.774` drags the baseline error up to **`0.468` Brier error**.
- **RogueTrader (With Walrus Memory Shrinkage):** Down-weights confidence on crowded trap regimes down to 41%–62% while preserving conviction on clean institutional absorption, reducing the benchmark Brier error down to **`0.128`**—a **72.6% error reduction across the seeded benchmark scenarios**.

---

## 4. Real Mainnet Engineering: What Broke & What We Learned

Building against live **Sui Mainnet** and **Walrus Memory Mainnet (`@mysten-incubation/memwal`)** surfaced real operational lessons that shaped RogueTrader's architecture:

1. **Asymmetric Latency (20-Second Writes vs. Sub-Second Recalls):**
   - On Walrus Mainnet, `memwal.recall()` returns vector matches in **`~880–950ms`**, which is fast enough to sit directly in the pre-trade sizing loop.
   - However, `memwal.remember()` takes **`~18–24 seconds`** to encrypt with Seal, erasure-code slivers, commit the Walrus blob, and index the embedding. If you put `remember()` inside the pre-trade path, the UI freezes.
   - **Our Fix:** Strict architectural separation. Pre-trade checks only run fast vector reads (`memwal.recall`), while post-trade lessons are committed asynchronously (`memwal.rememberAsync` / `rememberAndWait`) *after* a trade settles.
2. **`MemWalAccount` Object ID vs. Raw Sui Wallet Address:**
   - Passing your raw Sui wallet address (`0xaff0…4b4d`) as `accountId` to the production relayer (`relayer.memory.walrus.xyz`) fails authentication. You must first invoke `createAccount` and `addDelegateKey` against the Mainnet MemWal package (`0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5`) and pass the newly minted **`MemWalAccount` object ID (`0xf7bb…e223`)**.
3. **Sui Mainnet Fullnode gRPC vs. JSON-RPC:**
   - `@mysten-incubation/memwal/account` uses `@mysten/sui` v2's `SuiGrpcClient` under the hood against `https://fullnode.mainnet.sui.io:443`, while Tatum's gateway (`https://sui-mainnet.gateway.tatum.io`) exposes standard JSON-RPC (`sui_getLatestCheckpointSequenceNumber`, `sui_getTransactionBlock`) authenticated via `x-api-key`.
4. **Zero-Custody Delegate Keys for 1-Click Judge Testing:**
   - Because our Ed25519 delegate key (`0x9a49…7ff8`) is registered on-chain exclusively to sign memory operations for `MemWalAccount` `0xf7bb…e223` and holds `0 SUI`, judges visiting the live app can execute real Mainnet vector recalls and writes in 1 click without connecting a wallet or exposing custody keys.

---

## 5. Bot-to-Bot Risk Gating via HTTP 402 (`x402`) on Sui

Human traders use the web desk, but autonomous trading agents need a programmatic gate. RogueTrader exposes an **HTTP 402 (`x402`)** pay-per-check flow settled in SUI:

1. An external trading bot requests a pre-trade check (`POST /api/x402/check`).
2. RogueTrader returns `HTTP/1.1 402 Payment Required` with a `0.05 SUI` invoice challenge.
3. The bot settles `0.05 SUI` on Sui Mainnet and retries with `X-PAYMENT: sui:<txDigest>`.
4. RogueTrader verifies the transaction block on Sui Mainnet via **Tatum RPC (`sui_getTransactionBlock`)** and returns the calibrated leverage cap.

---

## 6. Verified Sui Mainnet & Walrus Mainnet Proof (`mainnet-proof.json`)

Every transaction, the 12 seeded benchmark regimes, and 3 live out-of-sample forecast blobs are live on **Sui Mainnet** and **Walrus Mainnet** (`relayer.memory.walrus.xyz`, namespace `roguetrader`):

### Sui Mainnet On-Chain Transactions
| Component | Mainnet Identifier / Digest (Clickable Suiscan Links) |
| :--- | :--- |
| **Sui Mainnet Owner Wallet** | [`0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d`](https://suiscan.xyz/mainnet/account/0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d) |
| **MemWal Package ID (Mainnet)** | [`0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5`](https://suiscan.xyz/mainnet/object/0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5) |
| **`MemWalAccount` Object ID** | [`0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223`](https://suiscan.xyz/mainnet/object/0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223) |
| **`create_account` Mainnet Tx** | [`BgV89J5qHbSLusCrcYXatxaDeJCpUBygWdBoDbFusJFX`](https://suiscan.xyz/mainnet/tx/BgV89J5qHbSLusCrcYXatxaDeJCpUBygWdBoDbFusJFX) |
| **`add_delegate_key` Mainnet Tx** | [`9b9bWSAgJoBjRj98vu2psfJfB9WsiMQz3HRKnFNy7s7S`](https://suiscan.xyz/mainnet/tx/9b9bWSAgJoBjRj98vu2psfJfB9WsiMQz3HRKnFNy7s7S) |
| **`0.05 SUI x402` Settlement Tx** | [`5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N`](https://suiscan.xyz/mainnet/tx/5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N) |

### Part A: 12 Seeded Benchmark Microstructure Blobs (Knowledge Base)
| Blob Index | Scenario & Microstructure Regime | Walrus Blob ID |
| :--- | :--- | :--- |
| **#1 (`mem-001`)** | Oct 14 NAVI Borrow Squeeze (>75% Crowded Longs) | `thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0` |
| **#2 (`mem-002`)** | Oct 16 Cetus Organic Institutional Breakout | `1ZOLBULVD-pOR80s3qADLhBbPHmA6yVQ1rs7Y4QoiJM` |
| **#3 (`mem-003`)** | Oct 19 Scallop Overnight Borrow Spike Squeeze | `qlvh2ujy6cs7mTgjoWPK_k8OCcKdWE-2BNKWcMtKr5E` |
| **#4 (`mem-004`)** | Oct 21 Sui Epoch 512 Boundary Oracle Latency | `BamlyvKWqCgUcjK_kQ2YiM94grCFrkl5u1f3fRYA2z8` |
| **#5 (`mem-005`)** | Oct 24 Viral Social Sentiment Bull-Trap | `gi3MnkJ1wY-f7nPs1ODkjnx7D0CJBdKixFqH1LoNxW0` |
| **#6 (`mem-006`)** | Oct 26 Whale Absorption Wall on DeepBook v3 | `u29gxoSNeyIB6DOBR-GL1rieV6O3lXFfwdfomb2ytHY` |
| **#7 (`mem-007`)** | Oct 28 Orderbook Bid Vacuum Flash Dip | `kxziGvQVIZ25vsfvvMxZo9GSzdeQAhGJgL6Z-CAXBcs` |
| **#8 (`mem-008`)** | Oct 30 Flash-Loan Lending APY Distortion Spike | `oceCZClMB-mLNKFGNhyAyqHPm7i-GiTaWeXdcddveAE` |
| **#9 (`mem-009`)** | Nov 02 Cetus Trend Continuation Post-Consolidation | `VyTfLjzJqL7MBYOufVlPBvD2WFs54HxoztDQHCxXdzk` |
| **#10 (`mem-010`)** | Nov 04 Meme Token Leverage Cascade Liquidation | `F6pMrdzRAen9NQZzsADr7Lj8bUAr8WXzzy_9OwFwKHs` |
| **#11 (`mem-011`)** | Nov 06 Sui Checkpoint Congestion Pyth Delay | `-geRj7clDG5AxtiNpmz35jpoRrUg0LcavGuLAYsnjoM` |
| **#12 (`mem-012`)** | Nov 08 DeepBook Wholesale Institutional Bid Wall | `uCWoMfbtNImcsKdyhkHh5Yzql2z3ehK_v6HteE3KJIQ` |

### Part B: 3 Live Out-of-Sample Forecast Blobs (Committed Nov 9, 2026 Before Resolution)
| Forecast ID | Setup & Epistemic Calibration Adjustment | Walrus Blob ID |
| :--- | :--- | :--- |
| **Live #1 (`forecast-001`)** | **SUI/USD @ $0.846 Breakout Long:** Raw LLM proposed 84% conf, 3.0x lev. Recalled `thAHmeWQ` & `kxziGvQ`. -22% epistemic penalty applied. Calibrated: **62% conf, 2.0x lev**. | `PWaVduVd5UBZBSlLso__hftk2-nff-lmHWSBqaqXtuk` |
| **Live #2 (`forecast-002`)** | **SUI/USD @ $0.846 Dip-Buy at $0.825 Support:** Raw LLM proposed 60% conf, 2.0x lev. Recalled `u29gxoSN` & `uCWoMfbt`. +8% depth boost. Calibrated: **68% conf, 2.5x lev**. | `8AXIPosW12-MR-5U4jk2DCFYJbV19rXm9ovp9-W03Uw` |
| **Live #3 (`forecast-003`)** | **SUI/USD @ $0.846 5m Momentum Scalp:** Raw LLM proposed 88% conf, 4.0x lev. Recalled `oceCZClM` & `F6pMrdzR`. -33% wick risk penalty. Calibrated: **55% conf, 1.5x lev**. | `8YTdc-avOz6EGVReq_5B3DsFD8F6qUScIUkgGIcaGic` |

---

*Built by Olumide Lala (`@pray_4motivatio` / `@Olalolo22`) for the Tatum × Walrus Memory "Total Recall" Hackathon.*

