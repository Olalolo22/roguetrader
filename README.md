# RogueTrader (Epistemic Arena)

> **Autonomous AI Trading Agents with Immutable Vector Memory on Walrus & x402 Micropayments on Sui**
> Built for the **Tatum × Walrus Memory Hackathon ("Total Recall")**  
> **Track 1:** Markets & Sports Prediction ($1,000)  
> **Special Bounties:** Best Walrus Memory Integration ($500) • Best Use of Agent Payments on Sui ($500)

---

## ⚡ The 20-Second Pitch

> **LLMs suffer from overconfidence, hallucination, and memory amnesia. RogueTrader permanently cures it.**

Autonomous AI trading agents make market predictions and commit their analytical hypotheses to **Walrus Memory Mainnet**. When live market outcomes resolve via **Tatum Sui Gateway**, bad calls permanently degrade the agent's Brier calibration score. Calibrated agents query Walrus Memory for past analogous market liquidations via semantic recall to self-correct their confidence *before* taking positions. Other agents or human traders pay a **0.05 SUI micropayment** via the **HTTP 402 (`x402`) protocol** on Sui to unlock the winning alpha.

---

## 📐 Plain-Text Calibration Metric: The Brier Score

Unlike typical crypto bots that delete bad tweets or fabricate track records, RogueTrader enforces transparent, mathematically sound verification:

```text
Brier Score = (1 / N) * SUM_{t=1}^N (f_t - o_t)^2
```

Where:
- `f_t` is the agent's committed probability forecast (e.g., 0.84 for 84% confidence).
- `o_t` is the actual binary resolution state queried via Tatum Sui RPC (1 if target hit, 0 if invalidated or liquidated).
- `N` is the total number of committed calls.
- **Scale:** `0.00` is perfect Bayesian calibration; `1.00` is complete hallucination / wrong confidence.

---

## 🧠 The 5-Step Reflective Thought Engine

When an agent analyzes the market, judges can watch the live 5-step reflection loop in real time:

1. **Live Observation:** Ingests live Sui blockchain checkpoint, volume, and pool depth via **Tatum Sui Gateway** (`sui-mainnet.gateway.tatum.io`).
2. **Uncalibrated Hypothesis $H_0$:** The raw LLM generates an aggressive trade stance with inflated confidence (e.g., AlphaSui at 84% confidence).
3. **Semantic Walrus Recall:** The agent calls `memwal.recall()` against **Walrus Memory Mainnet** (`relayer.memory.walrus.xyz`) to retrieve analogous historical failure cases (e.g., Oct 14 NAVI borrow rate spike).
4. **Epistemic Modulation:** The agent applies a Bayesian penalty, dropping confidence from **84% to 62%** and tightening its stop-loss to prevent liquidation.
5. **Walrus Mainnet Commit:** The audited thesis, reasoning vector, and Brier pledge are permanently committed to Walrus Memory as an immutable blob.

---

## 💳 HTTP 402 (`x402`) Agent Payments on Sui

RogueTrader implements native machine-to-machine micropayments using standard HTTP 402 status codes:

1. **Client / Agent Request:** `GET /v1/agent/alphasui/thesis`
2. **Server Challenge (HTTP 402):**
   ```http
   HTTP/1.1 402 Payment Required
   WWW-Authenticate: x402-sui realm="roguetrader-calibrated-alpha", amount="0.05", currency="SUI", recipient="0x7a8f941029ba8ec001b92040188efacb772109aa", paymentId="x402_99bc_1761350400"
   ```
3. **Sui Settlement:** The payer broadcasts a 0.05 SUI transfer to the agent's settlement address.
4. **Tatum Verification:** The server verifies the transaction digest via Tatum Sui RPC.
5. **Decoded Alpha Release:** The full position mandate, exact entry range, take-profit target, and stop-loss are returned.

### Programmatic Query (Agent-to-Agent)

```bash
curl -X GET "https://api.roguetrader.xyz/v1/agent/alphasui/thesis" \
  -H "X-PAYMENT: sui:0x992fa100eb81711200dfa8829011b9881023bc4a889100188efacba772109aa" \
  -H "Accept: application/json"
```

---

## 🗄️ Walrus Memory Verification Checklist

- **Mainnet Relayer:** `https://relayer.memory.walrus.xyz`
- **SDK Integration:** `@mysten-incubation/memwal` (v0.1.20) + `@mysten/sui`
- **Pre-Seeded Memories:** 12+ verified historical calibration records on Mainnet across 4 distinct categories:
  - `FAILURE_CASE`: Cascade liquidations, borrow spikes, false breakout traps.
  - `REGIME_SHIFT`: Pyth oracle latency during epoch transitions, macro correlation shifts.
  - `CATALYST`: Cetus volume breakouts, DeepBook spread tightening.
  - `ORACLE_OUTCOME`: Verified resolution logs with Brier calibration deltas.
- **Interactive Memory Explorer:** Built-in semantic search bar and memory injection form allowing judges to test writing and querying in natural language.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS v4 (`@tailwindcss/vite`), Canvas Confetti, Lucide Icons.
- **Decentralized Storage & Memory:** Walrus Memory (`@mysten-incubation/memwal`).
- **Blockchain RPC & Indexing:** Tatum Sui Mainnet Gateway (`sui-mainnet.gateway.tatum.io`).
- **Micropayments:** x402 on Sui with cryptographic transaction digest verification.

---

## 🚀 Running Locally

```bash
# Clone and enter directory
cd roguetrader

# Install dependencies
pnpm install

# Build for production (zero TypeScript errors)
pnpm run build

# Start local dev server
pnpm run dev
```

Visit `http://localhost:5173/` to explore the Epistemic Arena.
