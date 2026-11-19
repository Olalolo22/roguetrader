# AGENTS.md — Universal Hackathon Playbook & Case Studies

> **How to use this file:**
> - **Part 1** is **100% stack-agnostic and domain-agnostic**. Copy it into any future hackathon (Web2, mobile, SaaS, AI, devtool, fintech, hardware, Web3—anything).
> - **Part 2** is **niche advice** for AI agents, persistent/verifiable memory, agent payments, and Sui/Tatum stacks.
> - **Part 3** is the **Total Recall Hackathon Case Study** (`What It Was About → What Was Done → What Won → Feedback Gotten`) preserving exact evidence of what placed and what failed.

---

## Part 1: Universal Hackathon Playbook (Any Hackathon, Any Stack)

These rules apply regardless of theme, tech stack, or sponsor. Treat them as pre-submission blockers, not post-demo polish.

### 1. Universal Laws

1. **Pick One Sharp Failure Mode or Real Friction — Never Build an Incremental Clone.**
   - Judges see dozens of generic "X with sponsor tech bolted on" apps. Winning entries compress around **one unmistakable real-world tension** (e.g., *advice that only gets paid if it works*, *a shop credit book in local slang*, *stopping bad inputs before money moves*).
   - **Litmus test:** If you remove the hackathon's core theme/sponsor primitive from your app and the product still works almost identically, your positioning is too generic. The core primitive must be **load-bearing**, not decorative.

2. **Optimize for the Round-1 Cut First (30-Second Comprehension Rule).**
   - High-volume hackathons run a **first-round screening** over: **Repo + Docs + Live URL + Demo + Write-up**. Only shortlisted projects get deep end-to-end testing.
   - A tired judge opening your live URL must understand in **under 30 seconds**:
     1. What problem this solves.
     2. Exactly what to click or type first.
     3. What changed and *why*.
     4. Where to verify that it is real.

3. **Enforce a Single-Flow Hero UI (`Input → Core Action → Decision/Result + Why`).**
   - Never make a dense multi-panel dashboard or a read-only viewer your default landing view.
   - Above the fold should have **one obvious interactive loop**: enter/select input → trigger the core system → see the concrete output alongside a 1–2 sentence plain-English explanation.
   - Move raw logs, inspectors, telemetry, and configuration behind tabs, drawers, or secondary sections.
   - **Eliminate reviewer friction:** Add a **zero-setup / no-login / one-click demo mode** and, when helpful, an explicit **"Reviewing this for `<Hackathon>`?"** guided walkthrough right on the home screen.

4. **Make the Product Interactive and Close the Feedback Loop Visibly.**
   - Never ship a read-only showcase where only your backend scripts create data.
   - A visitor must be able to **participate** (submit an action/record → resolve/update it → watch the next output demonstrably change).
   - The change must be **meaningful**, not cosmetic (if the system only tweaks a tiny number like `10% → 5%`, judges treat the core mechanic as shallow).

5. **Ship Real Data Density & Real Live Inputs — Not Thin Fixtures.**
   - 10–15 synthetic examples feel like a toy prototype; **dozens of real/settled records**, realistic multi-week histories, or live external feeds look like a working product.
   - Wire **at least one live external data source** during the hackathon instead of putting it on a `NEXT_STEPS.md` roadmap.
   - **Strictly separate synthetic/demo fixtures from real production data.** Never blend mock scores or fake proxy metrics into live numbers.

6. **Verify Every Sponsor/External Integration Live — Zero Silent Fallbacks.**
   - Test every sponsor endpoint directly against production config (`curl` + integration tests) before submitting.
   - **Never let a `try/catch` silently fall back** from a broken sponsor endpoint (e.g., a deprecated `404` route) to a default/public/mock path without surfacing the failure. Silent fallbacks mask broken integrations and cost you full sponsor integration points.
   - Delete dead/deprecated API calls completely—even if a newer endpoint exists elsewhere in the repo, leftover broken calls get flagged in code review.

7. **Make Proof & Verifiability a First-Class UI Feature.**
   - If your app makes a claim about accuracy, provenance, safety, or receipts, don't bury the proof in CLI scripts or raw JSON.
   - Include a step-by-step **"Verify this"** UI flow so any non-author can independently confirm the claim in two clicks.
   - Where possible, back claims with **measured numbers** (e.g., *X real records processed*, *Y bad actions blocked*, *accuracy improved from A% to B%*).

8. **Ship Real Engineering Hygiene (Tests, Modularity, Ownership).**
   - **Automated tests are mandatory** on core business logic, scoring/rules, edge cases, and external API clients. Zero tests is an instant technical-quality deduction.
   - **Keep modules small and focused**—don't cram transport, persistence, parsing, and business logic into one oversized god-file.
   - **Scope data and permissions properly**—avoid dumping every user into one shared server account or leaving authorization/enforcement half-wired.

9. **Pair the App With a Crisp Write-Up.**
   - Winning projects repeatedly paired clean live apps with short, concrete write-ups/READMEs explaining architecture, trade-offs, what is live vs. simulated, and verifiable proof links.

---

### 2. Universal Anti-Patterns (Traps to Never Repeat)

| Trap Name | What Goes Wrong | How to Prevent It |
| :--- | :--- | :--- |
| **The Silent Fallback Trap** | A sponsor API returns `404`/fails, a `catch` quietly falls back to a public/mock source, and you earn 0 sponsor integration points. | Assert sponsor responses in tests; run live `curl`/smoke checks 24h before deadline; delete all deprecated calls. |
| **The Confusing Dashboard Trap** | Strong backend buried under a busy UI where judges don't know what to enter or how to interpret results. | Strip the hero down to 1 input → 1 action → 1 clear result + plain-English *why*. Test on an outsider for 30 seconds. |
| **The Passive Viewer Trap** | Real data and honest math exist, but visitors can only view pre-scripted results instead of running the loop themselves. | Always let visitors submit/trigger the core action and walk through a *"Verify this"* step in the UI. |
| **The Polished Clone Trap** | High technical polish, but the app feels like a familiar Web2 clone with shallow differentiation from the hackathon theme. | Ensure the core theme materially changes decisions/outcomes—not just minor tweaks—and give users true ownership/control. |
| **The Thin / Blended Data Trap** | Only ~10–15 seeded records, live feeds left on the roadmap, or synthetic fixtures mixed into real metrics. | Seed real settled history or live feeds early; clearly tag and isolate demo fixtures from live records. |
| **The Zero-Tests / God-File Trap** | No automated test suite, or all core logic crammed into one giant file with weak auth/enforcement. | Split services cleanly (`transport`, `policy`, `storage`) and write unit + mocked integration tests before UI polish. |

---

### 3. Universal 24-Hour Pre-Submission Ship Checklist

- [ ] **30-Second Stranger Test:** Can someone unfamiliar open the deployed URL and immediately know what to enter, what happened, and why?
- [ ] **Zero-Friction Reviewer Path:** Can a judge try the full core loop in under 60 seconds without setup friction (guest/demo mode or guided steps)?
- [ ] **Sponsor Live Audit:** Every sponsor API/SDK call hit directly with production config returns `200 OK` (zero `404`s, zero silent fallbacks, zero leftover deprecated routes).
- [ ] **Core Loop Interactive & Visible:** A user can create/trigger state, resolve/update it, and visibly see future output change.
- [ ] **Live Data & Clean Separation:** At least one real external input is wired live (not just roadmap), and synthetic demo data is strictly separated from live metrics.
- [ ] **UI Verification Path:** A judge can inspect and verify proof/receipts/results directly in the UI without reading code.
- [ ] **Automated Tests Pass:** Core rules, edge cases, and sponsor client paths pass cleanly via CLI (`test`, `lint`, `build`).
- [ ] **Clean Architecture & Scoping:** Focused modules (no god-files), clean user scoping/auth, and a concise README/write-up linking to live proof.

---

## Part 2: Niche Playbook (AI Agents × On-Chain Memory × Agent Payments)

Use these domain-specific rules whenever building AI agent, Web3 memory, micropayment, or Sui/Tatum projects.

1. **Demote the LLM to Parser or Narrator — "No Model Decides About Money."**
   - Deterministic code, typed rules, statistical scoring (e.g., Brier calibration, Kelly sizing), human confirmation gates, or Move/smart-contract allowances must own financial actions and refusals.
   - Across almost every winning agent/finance build, judges explicitly rewarded deterministic guardrails over free-form LLM judgment.
2. **Memory Must Gate Actions, Refuse Bad Paths, or Separate Rules From Facts.**
   - Don't use memory as an append-only chat log. Strong patterns:
     - **Refusal gate:** Recall past accuracy/approvals and refuse bad counterparties or payments automatically (`Calibro`, `Ellai`).
     - **Quarantine / security gate:** Sign memory envelopes and validate through deterministic code rules + transaction dry-runs so poisoned memory cannot hijack execution (`Antibody`).
     - **Typed rules vs. episodic facts:** Separate persistent cross-session user rules from one-off event facts, and benchmark the lift (`Quits`).
3. **Couple Agent Payments (`x402` / `MPP`) With Outcome Quality or Refusal.**
   - Require replay protection and on-chain balance-change verification via the sponsor gateway before releasing paid payloads.
   - Go beyond basic pay-per-request: either **refuse** poor-performing sellers from memory (`Calibro`) or **escrow** fees until post-event scoring proves the advice helped (`Lift`).
4. **Use Sui + Tatum's Modern Transport Split Explicitly.**
   - **GraphQL for screens/queries + gRPC for pipes/streams + dry-run simulation before settling.** Legacy Sui JSON-RPC is retired (`404`). Keep API keys server-side where possible and use Tatum price feeds for historical/fiat token valuation.
5. **Give Users Ownership of Their Memory.**
   - Prefer wallet-keyed / per-user memory accounts or explicit delegated keys over storing all users under a single shared server account.

---

## Part 3: Total Recall Case Study (`What It Was About → Done → Won → Feedback`)

### A. What the Hackathon Was About
- **Event:** Tatum × Walrus Memory Hackathon ("Total Recall", Nov 2026).
- **Theme:** AI agents and apps combining **Walrus Memory** (persistent verifiable memory on Sui/Walrus Mainnet) + **Tatum Sui Infrastructure** (GraphQL, gRPC, dry-runs, price data, Tatum AI Builder) + **Agent Payments** (`x402` / `MPP`).
- **Tracks & Prizes:**
  - **Track 01 — Prediction Apps** (57 projects · $1,000: $500 / $300 / $200): Log picks before events, compare bookies vs. on-chain prices, keep a verifiable scoreboard of who was actually right.
  - **Track 02 — Smart Agents for Real Life** (80 projects · $1,000: $500 / $300 / $200): Agents with portable cross-session memory that watch workflows, pay, and know when to refuse.
  - **Track 03 — Consumer Finance Apps** (61 projects · $1,000: $500 / $300 / $200): Everyday money products where the chain stays in the background and memory makes balances, habits, or rules stick.
  - **3 Bonus Awards ($500 each):** Best Walrus Memory, Best Tatum AI Builder, Best Use of Agent Payments (`x402` or `MPP` settled on Sui).
- **How Judging Worked (`Ted29UP`):** Round 1 reviewed repo, docs, live site, demo, and blog/posts across all submissions; only shortlisted projects received full hands-on end-to-end testing of every live feature.

---

### B. What Was Done (RogueTrader)
- **Core Concept:** Built **RogueTrader**, a Pre-Trade Risk System (PTRS) for leveraged trades that recalls past liquidation blowups / market regimes from **Walrus Memory (Mainnet)** to reduce confidence and cap leverage before execution.
- **Technical Highlights at Submission:**
  - Real Walrus Mainnet writes waiting for confirmation, recall feeding directly into risk decisions, retry/timeout handling, and writes moved off the critical trade path to keep latency low.
  - Bot API gated by **HTTP 402 (`x402`)** with on-chain payment checks and replay protection.
- **Post-Deadline Fixes Shipped on `main`:**
  - `43cce1d`: Deterministic 3-state similarity gate (`STRONG_MATCH`, `WEAK_MATCH`, `UNFAMILIAR_REGIME`), cross-asset isolation, configurable baseline leverage caps, and removal of fake Brier proxy math.
  - `0b2bbc1`: Migrated Sui checkpoint and tx verification off retired Tatum JSON-RPC (`404`) to **Tatum Sui GraphQL** (`sui-mainnet.gateway.tatum.io/graphql`), retaining `SuiGrpcClient`, plus automated test suites (`tests/riskPolicy.test.ts`, `tests/tatumSui.test.ts`).
- **Remaining Open Work for RogueTrader v2:**
  - Simplify UI to a single unmistakable flow (`Enter trade → Matched past blowups → Adjusted leverage + short explanation`).
  - Wire live market feeds including real **NAVI borrow rate** (moving off roadmap/presets).
  - Close the real trade outcome settlement loop so memory grows from actual resolved trades and visibly shifts future advice.

---

### C. What Won (Projects That Placed & What They Built)

#### 1. Detailed Breakdown of Every Placing Project

**Track 01 — Prediction Apps (57 projects)**
- **1st ($500) — Lift** *(Miracle)*:
  - *What they built:* A live arena where AI agents make calls on live Polymarket markets and buy one piece of advice per market over MPP/USDC. The fee sits in **escrow** and the advisor keeps it *only* if their advice actually improved the agent's score after resolution. Every call is sealed on Walrus before close so agents learn which advisors are worth paying.
  - *UX & hook:* Clean hero (*"Advice that has to earn its fee."*) with live arena visualization, *"Play a round"*, *"See what memory changes"*, and a 2-minute film.
- **2nd ($300) — Hindsight** *(nerom)*:
  - *What they built:* A prediction scoreboard where 5 AI agents, Polymarket, DraftKings, and real players stake calls on Sui before events (football, politics, crypto, culture). After resolution, every call is scored and written to Walrus Memory; when the trusted line and the bookmaker diverge sharply, it flags the split.
  - *UX & hook:* Memorable cream UI with custom agent mascots, live stats on hero, *"Browse markets"*, and *"New here? Read the guide"*.
- **3rd ($200) — Vernier** *(Maverick)*:
  - *What they built:* Grades traditional sportsbooks against Polymarket on football. Odds are stamped on Sui before kickoff, scored after full time, and recalled from Walrus when similar fixtures arise.
  - *Proof & UX:* Shipped with **72 real matches already graded** (*"no bets, just the evidence"*) and a crisp league-filtered match card UI with *"Make your call"*.

**Track 02 — Smart Agents for Real Life (80 projects)**
- **1st ($500) — Antibody** *(lino)*:
  - *What they built:* An "immune system" sitting between a bill-paying agent (`Steward`) and its Walrus Memory account so poisoned memory cannot redirect payments. Every memory is a **signed envelope**; outgoing payments must pass **6 deterministic rules in code**, including an **exact dry run through Tatum**.
  - *UX & hook:* Ultra-focused dark landing (*"An immune system for agent memory."* — *"Signed memories. Payments by code. Quarantine that survives."*) with *"Watch the story"* + *"Open console"*.
- **2nd ($300) — Ferry** *(Adwait Keshari)*:
  - *What they built:* Moves a user's AI memory into a user-owned Walrus Mainnet store keyed to their Sui wallet and carries it across ChatGPT, Claude, and Gemini. Includes "Rescue" to import existing AI facts, a Chrome extension offering them as you type, MPP slice payments for agents, and every chain read routed through **Tatum Sui gRPC**.
  - *UX & hook:* Hero (*"Your AI memory, finally yours."*) pairs directly with a live verifiable Receipt card (*"Add Ferry to Chrome"* + *"See the proofs"*).
- **3rd ($200) — Ellai** *(Ram)*:
  - *What they built:* Lets an AI agent pay web sellers in USDC on Sui inside user-defined limits. Each user yes/no approval is stored in their own Walrus Memory account; later it recalls closest past answers and auto-pays only when enough approvals match—checking Sui allowance via Tatum before settling.
  - *Design rule highlighted by judges:* *"A refusal always wins. No model decides about money."*

**Track 03 — Consumer Finance Apps (61 projects)**
- **1st ($500) — Trustbook** *(Stellamaris)*:
  - *What they built:* An AI credit book for small shops, built first for Nigerian market traders. Shop owners log sales and customer credit by typing or speaking in **Pidgin or English**. The LLM only structures the draft entry; **nothing is saved until the owner confirms**. Credit history lives in Walrus Memory, balances come from an append-only ledger, and daily seals anchor on Sui via Tatum.
  - *UX & hook:* Warm everyday money UI (*"The credit book that learns who pays"*) with Naira summary card and *"Open the demo shop"*.
- **2nd ($300) — WalletTwin** *(Toan Nhu)*:
  - *What they built:* Turns a Sui wallet into an interactive "second brain". Reads on-chain trading history through Tatum, computes PnL and trading habits, and writes the profile to Walrus Mainnet. Users sign a gasless message to ask about their own habits or publish their twin publicly for others to study. Paired with a dedicated write-up.
- **3rd ($200) + Best Tatum AI Builder ($500) — Unwritten** *(Ed)*:
  - *What they built:* A shared household budget that surfaces the unwritten spending agreement a house already follows. Runs on **6 weeks of household decisions** (Wilson family preloaded), writes versioned append-only rules to Walrus Mainnet with **no model in the learning path**, and matches every transfer to a stored approval via Tatum's Sui gateway. Core app built in Tatum AI Builder.
  - *UX & hook:* Three clear entry cards right on the home screen—including an explicit **"Reviewing this for Total Recall?"** 7-step judge walkthrough with architecture map.

**Bonus Awards ($500 each)**
- **Best Walrus Memory ($500) — Quits** *(Yehor Ivashchenko)*:
  - *What they built:* Group expense splitter that learns unwritten personal rules. Log a bill in natural language (`"412 zł dinner, Clara paid, 140 of it was wine"`) and correct a split once (`"Ana doesn't drink"`). Personal rules persist as **typed rules** on Walrus Memory across future groups, while one-night facts stay scoped to one night. Debts self-settle via a single Sui allowance checked by a Move contract.
  - *Proof & UX:* Benchmarked first-week split accuracy improving **50% → 70%**, shipped a **no-wallet, no-sign-in 4-flatmate demo** on real Sui mainnet USDC debts, plus a write-up.
- **Best Use of Agent Payments ($500) — Calibro** *(mrnetwork)*:
  - *What they built:* A sports forecaster that recalls each signal source's Brier score from Walrus Memory, buys signals over **HTTP 402** on Sui mainnet verified by **Tatum's Sui GraphQL gateway**, **refuses bad sources outright from memory**, de-biases/weights trusted sources, and sizes bets with quarter-Kelly (*"No language model picks the number"*). A scheduled post-settlement job scores every bought signal and writes updated calibration back to Walrus.
  - *Proof:* Live mainnet record of **41 settled games, 144 paid signals, and 29 payments refused from memory**, plus a write-up.

#### 2. Quick Pattern Matrix (What Judges Rewarded)

| Track / Award | Project | Core Mechanism Judges Rewarded |
| :--- | :--- | :--- |
| **Track 01 · 1st ($500)** | **Lift** | Escrow fee releases *only* if Walrus-sealed advice improved the agent's Polymarket score post-close. |
| **Track 01 · 2nd ($300)** | **Hindsight** | Agents, Polymarket, DraftKings & players stake pre-event calls on Sui; flags line vs. bookie splits. |
| **Track 01 · 3rd ($200)** | **Vernier** | Grades bookies vs. Polymarket pre-kickoff on Sui + Walrus recall across **72 real graded football matches**. |
| **Track 02 · 1st ($500)** | **Antibody** | Immune gate against poisoned agent memory; signed envelopes, 6 code rules, **Tatum dry-run**. |
| **Track 02 · 2nd ($300)** | **Ferry** | User-owned Walrus Mainnet store keyed to Sui wallet; imports AI context via Chrome extension; MPP slices; **Tatum Sui gRPC**. |
| **Track 02 · 3rd ($200)** | **Ellai** | Autonomous web-seller payments inside limits; recalls yes/no approvals; **"A refusal always wins. No model decides about money."** |
| **Track 03 · 1st ($500)** | **Trustbook** | Pidgin/English AI credit book for Nigerian market traders; owner confirms before save; append-only ledger + Tatum Sui day seals. |
| **Track 03 · 2nd ($300)** | **WalletTwin** | Reads Sui wallet trade history via Tatum, computes PnL/habits, saves shareable profile to Walrus Mainnet. |
| **Track 03 · 3rd ($200) + Tatum AI Builder ($500)** | **Unwritten** | Household budget with **"no model in the learning path"**; 6 weeks live data; Tatum transfer matching; **7-step judge walkthrough**. |
| **Best Walrus Memory ($500)** | **Quits** | Typed persistent rules vs. one-night facts; benchmarked **50% → 70%** lift; **walletless 4-flatmate demo** + Move allowance. |
| **Best Agent Payments ($500)** | **Calibro** | Recalls Brier scores to gate HTTP 402 via **Tatum GraphQL**; **144 paid, 29 refused** across **41 settled games**; quarter-Kelly sizing + scheduled scorer. |

---

### D. Feedback Gotten (`Ted29UP`)

#### 1. RogueTrader (Olumide)
- **What worked:** Original use of memory (pre-trade risk check reducing confidence/leverage on matching blowups); proper Walrus Mainnet wiring (confirmation waits, retries, off-path writes); x402 bot payment verification + replay protection; helpful Walrus dev feedback.
- **What hurt score:**
  - Retired Tatum JSON-RPC (`404`) silently fell back to public Sui node → lost Tatum integration points. *(Fixed post-deadline in `0b2bbc1`.)*
  - Zero automated tests at deadline. *(Fixed post-deadline in `43cce1d` + `0b2bbc1`.)*
  - Thin memory (~15 mostly seeded scenarios) and live market inputs (e.g., NAVI borrow rate) left on roadmap.
  - Interface was confusing to judges (unclear what to enter or how to read output).
- **Judge's explicit note on post-deadline fixes:** *"I can see you’ve since moved to Tatum’s GraphQL gateway and added tests. That’s exactly the right move for next time!"*

#### 2. Other Strong Submissions (`Ajo`, `Receipts`, `AVEN`)
- **`Ajo`:** Praised for 138 real Mainnet blobs, confirmation waits, retries, tests, and safety code. Docked for still calling retired JSON-RPC (`404`) despite having GraphQL elsewhere, an oversized memory god-module, unclear separation of synthetic vs. real history, and soft escrow/authorization enforcement.
- **`Receipts`:** Praised for real 2026 midterms dataset, live Tatum gRPC receipt checks, and honest Brier math. Docked because the live UI was mostly a read-only viewer (visitors couldn't add a call or see the loop happen), lacked a step-by-step *"Verify this receipt"* UI flow, had too few scored calls to show learning, and had zero automated tests.
- **`AVEN`:** Shortlisted with best-in-track technical polish (offline mode, RLS, server-held Tatum gRPC, pause/edit/delete memory UI). Docked for feeling close to existing Web2 budgeting apps (`YNAB`/`Monarch`), shallow memory impact (`10% → 5%`), incomplete token valuation (not converting crypto txs using Tatum historical price data), and storing all users under one shared server account instead of user-owned keys/delegation.
