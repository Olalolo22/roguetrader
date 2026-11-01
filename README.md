# RogueTrader

> **Every rogue trader had the same problem. Nobody remembered the last blowup.**  
> Pre-trade risk gate on Sui that recalls past losing setups from Walrus Memory before sizing a position.  
> Built for the **Tatum × Walrus Memory Hackathon ("Total Recall")**  
> **Track 1:** Markets ($1,000) • **Special Bounties:** Best Walrus Memory ($500) · Best Use of Agent Payments on Sui ($500)

---

## The 20-Second Pitch

Rogue traders don't lose money from a lack of charts. They lose money because nothing stops them from repeating the exact same losing trade they took two weeks ago.

**RogueTrader** is a pre-trade memory gate:
1. **You propose a trade:** e.g. `Long SUI 2.14, 3x on Cetus breakout`.
2. **Live Sui Context via Tatum:** Pulls the current Sui checkpoint sequence and pool volume from the Tatum Sui gateway (`sui-mainnet.gateway.tatum.io`).
3. **Semantic Recall via Walrus:** Queries `@mysten-incubation/memwal` for analogous past setups that ended in liquidation or severe drawdowns.
4. **The Intercept:** 
   - **Without memory:** The agent sizes the trade blind at full leverage and high confidence.
   - **With Walrus memory:** The agent recalls the past failure blob, cuts leverage in half, pulls back confidence, and pushes out the liquidation threshold.
5. **x402 Micropayments:** Trading bots can query the same intercept endpoint over HTTP, paying **0.05 SUI** per check via the native HTTP 402 protocol.

---

## How It Works

```text
Proposed Trade: "Long SUI 2.14, 3x"
                  │
                  ▼
         [ Tatum Sui Gateway ] ──► Reads live Sui checkpoint & pool depth
                  │
                  ▼
         [ Walrus Memory Vault ] ──► memwal.recall("Long SUI 2.14, 3x")
                  │
                  ├── Recalled: "Oct 14: Longed SUI on Cetus spike while NAVI borrow was 82% — stopped out for -14.2%"
                  │
                  ▼
         [ Intercept Card ]
         ├── Confidence: 84% ──► 62% (-22 pts)
         ├── Leverage:   3.0x ──► 2.0x (-1.0x)
         └── Liquidation distance: 33.3% ──► 50.0% (Safer)
```

---

## Calibration Metric: The Brier Score

Predictions are audited against actual resolution states verified through Tatum:

```text
Brier Score = (1 / N) * SUM_{t=1}^N (f_t - o_t)^2
```

Where:
- `f_t` is the forecast confidence (e.g. 0.84 for 84%).
- `o_t` is the binary outcome verified on-chain via Tatum (1 if profitable target hit, 0 if stopped out or liquidated).
- `N` is the total number of evaluated calls.
- **Scale:** `0.00` is perfect calibration; `1.00` is complete hallucination / wrong confidence. Lower is better.

---

## HTTP 402 (`x402`) Machine-to-Machine API

External bots check trades against RogueTrader before execution via native HTTP 402:

```bash
# 1. Bot queries the intercept endpoint
curl -i https://api.roguetrader.xyz/api/x402/check \
  -H "Content-Type: application/json" \
  -d '{"trade":"Long SUI 2.14, 3x"}'

# 2. Server answers with 402 Payment Required
HTTP/1.1 402 Payment Required
WWW-Authenticate: x402-sui realm="roguetrader-risk-gate", amount="0.05", currency="SUI", recipient="0x7a8f941029ba8ec001b92040188efacb772109aa", paymentId="x402_99bc_1761350400"

# 3. Bot pays 0.05 SUI and resubmits with the transaction digest
curl https://api.roguetrader.xyz/api/x402/check \
  -H "X-PAYMENT: sui:0x992fa100eb81711200dfa8829011b9881023bc4a889100188efacba772109aa" \
  -H "Content-Type: application/json" \
  -d '{"trade":"Long SUI 2.14, 3x"}'
```

The server verifies the transaction digest via the Tatum Sui gateway before returning the intercept mandate.

---

## Interface & Craft

Built following the `unslop` design guidelines:
- **Quiet Graphite Surface:** `#0f0f10` background, `#141415` workspace, `#19191b` cards, `#232325` active rows.
- **Zero AI-slop tells:** No neon glow borders, no purple/cyan gradients, no sci-fi fonts, no emojis as icons.
- **Single Focal Moment:** The Intercept Card showing side-by-side trade parameters adjusting in place.
- **Signature Detail:** Monospace keycap tags for Walrus blob hashes (`blob 8f9a…2c`) and Tatum Sui checkpoints (`ckpt 89,412,950`).
- **Mobile Responsive:** Clean single-column layout on 360–390px screens with touch targets >= 40px and stacked parameter deltas.

---

## Technology Stack

- **Storage & Vector Memory:** Walrus Memory (`@mysten-incubation/memwal` v0.1.20) + `@mysten/sui`
- **Blockchain Gateway:** Tatum Sui Mainnet Gateway (`sui-mainnet.gateway.tatum.io`)
- **Micropayments:** HTTP 402 on Sui with cryptographic transaction digest verification
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS v4, Lucide Icons

---

## Running Locally

```bash
# Clone and enter directory
cd roguetrader

# Install dependencies
pnpm install

# Build for production
pnpm run build

# Start local dev server
pnpm run dev
```

Visit `http://localhost:5173/` to run the pre-trade risk gate.
