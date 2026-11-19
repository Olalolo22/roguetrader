# AGENTS.md — Builder & Agent Playbook

> Distilled from the **Tatum × Walrus Memory ("Total Recall") Hackathon (Nov 2026)** and direct judge feedback across multiple submissions. Designed so any coding agent or teammate working on **RogueTrader**—or any future hackathon project—enforces these rules before shipping.

---

## Part 1: Reusable Hackathon Playbook (Any Hackathon, Any Stack)

These rules govern **product scoping, UX, engineering verification, and submission readiness**. Treat them as pre-submission blockers, not post-hackathon polish.

### 1. Universal Laws (Every Hackathon)
1. **Optimize for the Round-1 Gate, Not Just Feature Count.**
   - High-volume hackathons run a **first-round cut** over: **Repo + Docs + Live Site + Demo + Blog/Write-up**. Only shortlisted apps get full end-to-end manual testing.
   - If a judge cannot understand what to click and verify in **under 30 seconds**, deep backend work will not save the score.
2. **Enforce a Single-Flow Hero UI (`Input → Proof/Match → Decision + Why`).**
   - Never ship a dense multi-panel dashboard or read-only viewer as the default landing experience.
   - The above-the-fold view must present **one unmistakable interactive path**: user enters input → system executes/queries the core primitive → UI shows the result alongside a plain-English explanation of *why*.
   - Push secondary telemetry, debug logs, and raw inspectors into tabs, accordions, or secondary views.
   - Add an explicit **"Reviewing this for `<Hackathon>`?"** guided flow or **no-wallet / one-click demo mode** so judges never stall on wallet setup or seed phrases.
3. **Never Ship Thin Seeded Data When Real/Live Data Exists.**
   - ~10–15 synthetic/seeded scenarios looks like a prototype; **40–70+ real settled records**, multi-week simulated/imported histories with explicit grounding, or live mainnet reads look like a real system.
   - Always wire **at least one real external market/protocol input** instead of leaving live feeds on the roadmap.
   - Strictly separate **synthetic/demo fixtures** from **real settled outcomes**—never blend fake proxy scores into live metrics.
4. **Close the Feedback Loop Visibly.**
   - The app must let a visitor trigger the loop (write state → resolve/update outcome → watch future output demonstrably change).
   - If the "learning" is trivial (e.g., nudging `10% → 5%`) or static, judges immediately mark memory/AI as cosmetic.
5. **Automated Tests Are Mandatory for Technical Quality.**
   - Every core scoring, policy, parser, and sponsor-API client path needs automated tests running cleanly in CI/CLI before submission. Zero tests is an automatic technical deduction.
6. **Verify Sponsor Integrations Live on Exact Endpoints — Zero Silent Fallbacks.**
   - Never rely on deprecated endpoints (e.g. legacy JSON-RPC returning `404`) or let a catch block **silently fall back** to a public node without checking status. If the sponsor gateway silently fails, your submission earns **zero integration points** for that sponsor.
   - Remove unused legacy protocol calls completely so a judge reviewing code or running network captures never hits dead endpoints.
7. **Give Users Ownership & Verifiability.**
   - Avoid holding every user's state under one shared server account when user-scoped keys/wallets/delegated accounts are expected.
   - Expose a **"Verify this receipt / proof"** step-by-step path in the UI so judges can verify on-chain/storage integrity without reading code.
8. **Keep Core Modules Small & Focused.**
   - Do not dump all memory, parsing, and business logic into one oversized god-file/module; separate transport, policy/scoring, and storage cleanly.

---

### 2. Niche Laws (AI Agents × On-Chain Memory × Agent Payments)
1. **Demote the LLM to Parser or Narrator — "No Model Decides About Money."**
   - Deterministic code, typed rules, statistical scoring (e.g., Brier calibration, Kelly sizing), or smart contracts/Move allowances must own financial decisions and refusals.
   - Across almost every winning agent/finance build, judges explicitly rewarded deterministic guardrails over free-form LLM judgment.
2. **Memory Must Gate Actions or Refuse Bad Paths (Not Just Append Logs).**
   - Strong memory implementations do one of three things:
     - **Refuse** bad counterparties/payments from memory (`Calibro`: refused 29 bad HTTP 402 signals from past Brier records; `Ellai`: refusal always wins).
     - **Quarantine/Verify** untrusted or poisoned memories before execution (`Antibody`: signed memory envelopes + deterministic code rules + dry-run).
     - **Distinguish Typed Rules vs. Episodic Facts** (`Quits`: persistent cross-session user rules vs. one-off session facts, backed by a measured accuracy benchmark).
3. **Use the Sponsor's Preferred Modern Transport Stack Explicitly.**
   - On Sui + Tatum: **GraphQL for screens/queries + gRPC for pipes/streams + dry-run simulation before settling** (JSON-RPC is retired/404). Make this split explicit in architecture notes and runtime telemetry.
4. **Pair Agent Payments (`x402` / `MPP`) With Verification & Proof.**
   - Require cryptographic replay protection, on-chain balance-change verification via sponsor gateway before releasing payload, and—where possible—pre-payment quality filtering or escrow tied to outcome quality.

---

### 3. Pre-Submission Ship Checklist (Run 24h Before Deadline)
- [ ] **Sponsor Endpoint Audit:** Hit every sponsor endpoint directly with `curl`/tests using production config. Confirm `200 OK` (no `404` + silent fallback).
- [ ] **Single-Flow 30s Judge Test:** Have someone unfamiliar open the deployed URL and complete the main flow without instructions. Can they answer *what to enter*, *what happened*, and *where the proof lives*?
- [ ] **Verification Flow in UI:** Can a judge inspect/verify a receipt, tx digest, and blob ID directly from the screen?
- [ ] **Real Loop Verified:** User/agent can write a new record, settle/resolve an outcome, and observe the next decision shift.
- [ ] **No Fake/Mock Blending:** Synthetic scenarios are clearly labeled or isolated from live calibration/metrics.
- [ ] **Automated Tests Pass:** Unit + integration tests cover scoring, policy refusal paths, and payment/chain verification.
- [ ] **User Scoping & Ownership:** Memory/records are scoped to user keys or explicitly explain delegation.
- [ ] **Clean Build & Focused Modules:** No monolithic memory/service files; write-up + README link directly to proof artifacts and architecture.

---

## Part 2: Total Recall Case Study (`What Was About → Done → Won → Feedback`)

### A. What the Hackathon Was About
- **Event:** Tatum × Walrus Memory Hackathon ("Total Recall", Nov 2026).
- **Theme:** AI agents & apps using **Walrus Memory** (persistent verifiable memory on Sui/Walrus Mainnet) + **Tatum Sui Infrastructure** (GraphQL / gRPC / dry-runs / price data) + **Agent Payments** (`x402` / `MPP`).
- **Structure:** 3 Main Tracks ($1,000 each: $500 / $300 / $200) + 3 $500 Bonus Awards:
  - Track 01 — Prediction Apps (57 projects)
  - Track 02 — Smart Agents for Real Life (80 projects)
  - Track 03 — Consumer Finance Apps (61 projects)
  - Bonuses — Best Walrus Memory, Best Tatum AI Builder, Best Use of Agent Payments.
- **How Judging Worked (`Ted29UP`):** First-round screening reviewed repo, docs, live site, demo, and posts/write-ups; only first-round selections received full end-to-end hands-on feature testing.

---

### B. What Was Done (RogueTrader)
- Built **RogueTrader**, a Pre-Trade Risk System (PTRS) for leveraged trades:
  - Recalls past trade blowups / regime memories from **Walrus Memory (Mainnet)** to shrink confidence and cap leverage before a trade executes.
  - Gates bot/API access behind **HTTP 402 (`x402`)** micro-payments with on-chain payment checks and digest replay protection.
  - Moves Walrus writes off the critical trade path so latency stays low while waiting for Mainnet confirmations with retries/timeouts.
- **Post-deadline fixes already shipped on `main`:**
  - `43cce1d`: Added deterministic 3-state similarity thresholds (`STRONG_MATCH`, `WEAK_MATCH`, `UNFAMILIAR_REGIME`), cross-asset isolation, configurable baseline leverage caps, and stripped fake Brier proxies.
  - `0b2bbc1`: Migrated Sui checkpoint/tx verification off retired JSON-RPC (`404`) to **Tatum Sui GraphQL** (`sui-mainnet.gateway.tatum.io/graphql`), keeping `SuiGrpcClient`, and added automated tests (`tests/riskPolicy.test.ts`, `tests/tatumSui.test.ts`).

---

### C. What Won (And Why They Stood Out)

| Track / Award | Project | Core Mechanism Judges Rewarded |
| :--- | :--- | :--- |
| **Track 01 · 1st ($500)** | **Lift** | Advisor's fee waits in escrow and releases *only* if Walrus-sealed advice improved the agent's Polymarket score post-close. |
| **Track 01 · 2nd ($300)** | **Hindsight** | Agents, Polymarket, DraftKings & players stake calls on Sui pre-event; scores stored to Walrus; flags line vs. bookmaker split. |
| **Track 01 · 3rd ($200)** | **Vernier** | Grades bookies vs. Polymarket pre-kickoff on Sui + Walrus recall; backed by **72 real graded football matches** ("no bets, just evidence"). |
| **Track 02 · 1st ($500)** | **Antibody** | Immune gate between bill-paying agent (`Steward`) and Walrus Memory against poisoned memory; signed envelopes, 6 code rules, **Tatum dry-run**. |
| **Track 02 · 2nd ($300)** | **Ferry** | User-owned Walrus Mainnet store keyed to Sui wallet; imports ChatGPT/Claude/Gemini context via Chrome extension; MPP slice payments; **Tatum Sui gRPC**. |
| **Track 02 · 3rd ($200)** | **Ellai** | Pays web sellers on Sui inside user limits; recalls past yes/no approvals; **"A refusal always wins. No model decides about money."** |
| **Track 03 · 1st ($500)** | **Trustbook** | AI credit book for Nigerian market traders (Pidgin/English); model only structures entry until owner confirms; append-only ledger + Walrus + Sui day seals via Tatum. |
| **Track 03 · 2nd ($300)** | **WalletTwin** | Reads Sui wallet trading history via Tatum, computes PnL/habits, saves profile to Walrus Mainnet for Q&A or public sharing. |
| **Track 03 · 3rd ($200) + Tatum AI Builder ($500)** | **Unwritten** | Household budget learning existing rules with **"no model in the learning path"**; 6 weeks live data; Tatum Sui gateway matches transfers; **7-step judge walkthrough** on home screen. |
| **Best Walrus Memory ($500)** | **Quits** | Typed persistent rules (`"Ana doesn't drink"`) separated from one-night facts; benchmarked **50% → 70%** lift; **walletless 4-flatmate demo** on real USDC + Move allowance check. |
| **Best Agent Payments ($500)** | **Calibro** | Recalls source Brier scores from Walrus; buys signals over HTTP 402 verified by **Tatum Sui GraphQL**; refuses bad sources (**144 paid, 29 refused** across **41 settled games**); quarter-Kelly sizing (**"No language model picks the number"**); scheduled post-settlement scorer. |

---

### D. Judge Feedback & Anti-Patterns to Avoid (`Ted29UP`)

#### 1. RogueTrader Feedback (Olumide)
- **What worked:** Original use of memory (pre-trade risk check reducing confidence/leverage on matching blowups); proper Walrus Mainnet wiring (confirmation waits, retries, off-path writes); x402 bot payment verification + replay protection; helpful Walrus dev feedback.
- **What hurt score:**
  - Tatum JSON-RPC `404` silently fell back to public Sui node → lost Tatum integration points.
  - Zero automated tests at deadline.
  - Thin memory (~15 mostly seeded scenarios) and live inputs (e.g., NAVI borrow rate) left on roadmap.
  - Interface was confusing to judges (unclear what to input or how to read output).
- **Still open to finish for RogueTrader v2:**
  - Simplify UI to 1 crystal-clear flow (`Enter trade → Matched past blowups → Adjusted leverage + short explanation`).
  - Wire live market + NAVI borrow feeds.
  - Close real trade outcome settlement loop so memory grows and visibly shifts future advice.

#### 2. Traps Other Strong Submissions Fell Into (Do Not Repeat)
- **`Ajo` Trap (Rich backend, structural/integration leaks):**
  - *Did right:* 138 real Mainnet blobs, wait-for-completion, tests.
  - *Criticized for:* Deprecated JSON-RPC `404` still present even with GraphQL elsewhere; oversized/hard-to-maintain memory module; failing to strictly isolate synthetic vs. real history; weak escrow/authorization enforcement.
- **`Receipts` Trap (Honest math, passive UI):**
  - *Did right:* Real 2026 midterms dataset, live Tatum gRPC receipt checks, honest Brier scoring.
  - *Criticized for:* **Read-only UI** (visitors couldn't submit a call or watch the loop happen); proof existed in backend/scripts but UI lacked a step-by-step *"Verify this receipt"* flow; too few scored calls to make learning visible; zero automated tests.
- **`AVEN` Trap (High polish & shortlist, weak memory differentiation):**
  - *Did right:* Best-in-track technical polish (offline mode, RLS, server-held Tatum gRPC, pause/edit/delete memory UI).
  - *Criticized for:* Looked like an incremental Web2 clone (YNAB/Monarch); memory effect felt shallow (*"declined 10% cut → suggest 5%"*); incomplete on-chain tx valuation (didn't convert tokens using Tatum historical price data); stored all users under one shared server memory account instead of giving users their own key/delegation.
