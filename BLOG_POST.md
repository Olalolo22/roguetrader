# How I Built a Pre-Trade Risk Guard on Sui That Remembers Past Liquidation Traps

**Every rogue trader—human or AI—has the exact same fatal flaw: nobody remembers the last blowup.**

Most crypto traders and autonomous trading bots don't blow up their accounts because they lack price charts. They blow up because nothing stops them from taking the **exact same losing setup** they took two weeks ago.

Ask a stateless LLM trading agent whether to go `3x Long SUI` during a Cetus volume spike, and it will hallucinate `88% confidence` and tell you to ape in—completely oblivious to the fact that the last three times NAVI borrow utilization was above `75%` with a thin DeepBook bid book, late longs got wiped out by an `-8.2%` long-squeeze wick within 40 minutes.

So for the **Tatum × Walrus Memory Hackathon ("Total Recall")**, I built **RogueTrader**: a 1-click pre-trade risk guard on **Sui Mainnet** powered by **Walrus Memory (`@mysten-incubation/memwal`)**, **Tatum RPC**, and **HTTP 402 (`x402`)** agent micropayments.

- **Live App:** [roguetrader.vercel.app](https://roguetrader.vercel.app)
- **GitHub Repository:** [github.com/Olalolo22/roguetrader](https://github.com/Olalolo22/roguetrader)
- **Sui Mainnet `MemWalAccount`:** `0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223`

---

## 1. The 20-Second Payoff: What RogueTrader Actually Does

RogueTrader sits right in front of your execution desk (and exposes an HTTP 402 endpoint for autonomous trading bots).

When you type an intended trade like `Long SUI 0.85, 3x` and click **Check Trade**:

1. **Reads the Live Sui Market State (via Tatum + Sui DEX Feed):** Pulls the current Sui Mainnet checkpoint (`sui_getLatestCheckpointSequenceNumber` via `sui-mainnet.gateway.tatum.io`), live SUI DEX price (`~$0.85`), Cetus pool liquidity, and borrow utilization.
2. **Recalls Matching Blowups from Walrus Mainnet (`<1s`):** Queries our `roguetrader` namespace on `relayer.memory.walrus.xyz` across **12 verified Sui DEX liquidation and breakout regimes** stored on Walrus Mainnet.
3. **Cuts Leverage Before You Get Liquidated:** Instead of letting you enter at `3.0x` leverage (where a `33.3%` move wipes you out), RogueTrader matches the `78.4% NAVI borrow squeeze` regime, penalizes overconfidence from `84%` down to `62%`, and **cuts your size from `3.0x` to `2.0x`**—widening your wipeout buffer to `50.0%` and **protecting `$1,420` from a repeat stop-out**.
4. **Captures New Trade Outcomes Back to Walrus:** Below the check card, our **Tatum Wallet Monitor (`0xaff0…4b4d`)** lets you save post-trade outcome snapshots directly back to Walrus Mainnet so the guard gets smarter after every trade.

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

When a proposed order matches a high-wick microstructure fingerprint recalled from Walrus, RogueTrader scales down leverage so your **Wipeout Buffer (`100% / Leverage`)** remains safely wider than that regime's historical wick.

---

## 3. Proving Memory Actually Helps: Brier Calibration (`0.468` -> `0.128`)

How do you prove that recalling Walrus memory actually improves decision quality rather than just blindly lowering leverage on every trade?

In quantitative finance, probabilistic forecasts are audited using the **Brier Score**—the mean squared error between an agent's stated win probability and the actual binary on-chain outcome:

```text
Brier = (1 / N) * SUM_{t=1..N} (f_t - o_t)^2
```

Where:
- `f_t` is the agent's forecast confidence (e.g. `0.88` for 88% confidence).
- `o_t` is the actual binary resolution verified on Sui via Tatum (`1` if the setup followed through, `0` if it wicked out or liquidated).
- `N` is the number of evaluated market setups.

Across our Sui DEX benchmark regimes:
- **Stateless LLM (Without Memory):** Hallucinates `80%–94%` confidence on crowded breakouts and social spikes, resulting in a terrible **`0.468` Brier calibration error**.
- **RogueTrader (With Walrus Memory):** Penalizes confidence on crowded traps (`mem-001`, `mem-005`, `mem-010`) while *boosting* conviction on clean institutional absorption (`mem-002`, `mem-009`, `mem-012`), cutting Brier error down to **`0.128`**—a **74% reduction in overconfidence**.

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

## 6. Verified Sui Mainnet & Walrus Mainnet Proof (12 Live Blobs)

Every transaction and memory blob below is live on **Sui Mainnet** and **Walrus Mainnet** (`relayer.memory.walrus.xyz`, namespace `roguetrader`):

| Component | Mainnet Identifier / Digest (Clickable Suiscan Links) |
| :--- | :--- |
| **Sui Mainnet Owner Wallet** | [`0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d`](https://suiscan.xyz/mainnet/account/0xaff0ccba609e3d18b5f5cf6290f158736c6c788ed4074951d636b223a4824b4d) |
| **MemWal Package ID (Mainnet)** | [`0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5`](https://suiscan.xyz/mainnet/object/0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5) |
| **`MemWalAccount` Object ID** | [`0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223`](https://suiscan.xyz/mainnet/object/0xf7bbb0464e0088b39df94354701fdeef69ccfd7e15b59964b1ac73c30c44e223) |
| **`create_account` Mainnet Tx** | [`BgV89J5qHbSLusCrcYXatxaDeJCpUBygWdBoDbFusJFX`](https://suiscan.xyz/mainnet/tx/BgV89J5qHbSLusCrcYXatxaDeJCpUBygWdBoDbFusJFX) |
| **`add_delegate_key` Mainnet Tx** | [`9b9bWSAgJoBjRj98vu2psfJfB9WsiMQz3HRKnFNy7s7S`](https://suiscan.xyz/mainnet/tx/9b9bWSAgJoBjRj98vu2psfJfB9WsiMQz3HRKnFNy7s7S) |
| **`0.05 SUI x402` Settlement Tx** | [`5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N`](https://suiscan.xyz/mainnet/tx/5VGXV3D6nT8N3vw67LyJTXRQNkiLY8bLaJoAs1iqEJ2N) |
| **Walrus Blob #1 (`mem-001` NAVI Squeeze)** | `thAHmeWQNFkTOjN-sdmU7SVKuXI2jWpO3wzTXgjr6R0` |
| **Walrus Blob #2 (`mem-002` Cetus Breakout)** | `1ZOLBULVD-pOR80s3qADLhBbPHmA6yVQ1rs7Y4QoiJM` |
| **Walrus Blob #3 (`mem-003` Scallop Wick)** | `qlvh2ujy6cs7mTgjoWPK_k8OCcKdWE-2BNKWcMtKr5E` |
| **Walrus Blob #4 (`mem-004` Pyth Latency)** | `BamlyvKWqCgUcjK_kQ2YiM94grCFrkl5u1f3fRYA2z8` |
| **Walrus Blob #5 (`mem-005` Social Trap)** | `gi3MnkJ1wY-f7nPs1ODkjnx7D0CJBdKixFqH1LoNxW0` |
| **Walrus Blob #6 (`mem-006` Whale Absorption)** | `u29gxoSNeyIB6DOBR-GL1rieV6O3lXFfwdfomb2ytHY` |
| **Walrus Blob #7 (`mem-007` Orderbook Vacuum Wick)** | `kxziGvQVIZ25vsfvvMxZo9GSzdeQAhGJgL6Z-CAXBcs` |
| **Walrus Blob #8 (`mem-008` Flash-Loan Lending Spike)** | `oceCZClMB-mLNKFGNhyAyqHPm7i-GiTaWeXdcddveAE` |
| **Walrus Blob #9 (`mem-009` Cetus Breakout Continuation)** | `VyTfLjzJqL7MBYOufVlPBvD2WFs54HxoztDQHCxXdzk` |
| **Walrus Blob #10 (`mem-010` Meme Token Leverage Cascade)** | `F6pMrdzRAen9NQZzsADr7Lj8bUAr8WXzzy_9OwFwKHs` |
| **Walrus Blob #11 (`mem-011` Oracle Push Delay)** | `-geRj7clDG5AxtiNpmz35jpoRrUg0LcavGuLAYsnjoM` |
| **Walrus Blob #12 (`mem-012` DeepBook Wholesale Wall)** | `uCWoMfbtNImcsKdyhkHh5Yzql2z3ehK_v6HteE3KJIQ` |

---

*Built by Olumide Lala (`@pray_4motivatio` / `@Olalolo22`) for the Tatum × Walrus Memory "Total Recall" Hackathon.*

