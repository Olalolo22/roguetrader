# RogueTrader: How Market Memory Influences the Next Trade

*Building a memory-informed prediction and position-sizing system on Sui with Walrus, MemWal and Tatum.*

**Live Substack Essay:** https://olumide2956.substack.com/p/roguetrader-how-market-memory-influences  
**Live App:** https://roguetrader.vercel.app  
**GitHub:** https://github.com/Olalolo22/roguetrader

---

## A trading system shouldn't have to learn the same lesson twice.

A trading agent can analyse a market, identify an opportunity and assign a confidence score. But when it encounters a market condition that has previously led to a bad outcome, does that experience influence its next decision?

Without persistent memory, every new prediction risks being treated as an entirely new problem.

The system might confidently recommend a leveraged position during a crowded market, even though a similar setup previously ended in a liquidation cascade. Equally, it might overlook a promising setup because it has no way to recall previous conditions that supported a successful trade.

We wanted to explore what happens when a trading system can carry those experiences forward.

For the **Tatum × Walrus Memory Hackathon: Total Recall**, we built **RogueTrader**: a pre-trade market prediction and position-sizing guard on Sui.

RogueTrader retrieves relevant market experiences from Walrus Memory before evaluating a proposed trade. Those memories influence the system's confidence and recommended exposure.

The influence can be positive or negative. Previous failures can reduce confidence and leverage. Previous successful market patterns can increase confidence and support a larger position.

The objective isn't to reject every risky trade. It's to make the next decision better informed by what the system remembers.

## What RogueTrader actually does

RogueTrader is an advisory layer between a trading idea and the decision to size a position.

A trader or autonomous agent brings its own market thesis. RogueTrader evaluates the proposed setup against market context and previously stored experiences before recommending how much exposure is appropriate.

Consider three examples from our committed forecast records:

| Proposed trade | Initial confidence | Memory-adjusted confidence | Leverage adjustment |
|---|---:|---:|---:|
| SUI breakout long | 84% | 62% | 3x → 2x |
| SUI support dip-buy | 60% | 68% | 2x → 2.5x |
| SUI momentum scalp | 88% | 55% | 4x → 1.5x |

The first setup resembles previously recorded crowded-market and liquidity-trap conditions. Memory reduces confidence and recommended leverage.

The second resembles previously recorded positive market conditions, including bid absorption and supportive liquidity. Memory increases confidence and recommended exposure.

The third encounters memories associated with elevated wick and liquidation risk, resulting in a much more conservative recommendation.

These are not claims that the three trades subsequently made money. They were committed to Walrus before their outcomes were resolved. They demonstrate something more fundamental: **the system's memory can influence a new prediction in either direction.**

## The four-stage memory loop

RogueTrader follows four stages: Forecast, Recall, Resolve and Learn.

### 1. Forecast

A trader or agent proposes a position.

For example:

`Long SUI at $0.85, 3x leverage`

The system starts with the proposed direction, confidence and exposure. This is the initial forecast, before historical memory has influenced it.

### 2. Recall

RogueTrader calls `memwal.recall` to retrieve up to three semantically similar market experiences from its `roguetrader` memory namespace.

The memory collection includes different categories of experience:

- **Failure cases:** Previous liquidation traps, false breakouts and liquidity failures.
- **Catalysts:** Market conditions associated with successful continuation.
- **Regime shifts:** Changes in market structure that can invalidate an otherwise reasonable trade.
- **Oracle outcomes:** Pricing and timing discrepancies around network or epoch transitions.

The system doesn't simply search for the same ticker or price. It looks for similarities in the conditions surrounding a proposed position.

The current implementation targets sub-second recall, with observed seeded and Mainnet-oriented timings around 900 milliseconds.

### 3. Resolve

A prediction eventually needs an outcome.

Was the continuation thesis correct? Did the market reverse? Was the position stopped out?

That outcome matters because a memory system that only stores predictions, without recording what happened afterwards, cannot build a meaningful history of experience.

RogueTrader includes a post-trade memory workflow through which a trader or bot can record a completed trade's outcome and the market conditions surrounding it.

### 4. Learn

The resulting lesson can be committed to Walrus through `memwal.remember`.

The new memory becomes available for future retrieval. A subsequent trade can therefore be evaluated against a larger collection of previous experiences.

The memory write is asynchronous because it takes considerably longer than retrieval. In our implementation, writes take approximately 15–25 seconds, while recalls are designed to fit inside the pre-trade evaluation path.

This separation matters: the system needs to remember completed experiences without making the next pre-trade check wait for a storage operation.

## What does RogueTrader remember?

We didn't want market memory to become a collection of unstructured notes such as:

*"Bought SUI at $2.14 and lost money."*

Nominal prices become less useful as markets move. What matters more is the market structure surrounding the trade.

RogueTrader represents market conditions using a five-variable entry-state vector:

| Variable | What it captures |
|---|---|
| Size-to-depth ratio | Proposed order size relative to available pool liquidity |
| Crowding and borrow skew | Borrow utilisation across lending protocols such as NAVI and Scallop |
| Orderbook imbalance | Relative bid and ask depth on DeepBook |
| Volatility vs. wipeout | Whether volatility threatens the position's liquidation buffer |
| Venue and oracle lag | Difference between AMM spot pricing and Pyth reference pricing |

These variables describe the conditions that can make a seemingly attractive position dangerous, or make a market setup more convincing than its initial assessment suggests.

For example, a high-volume breakout accompanied by elevated borrow utilisation and weak bid depth is different from a breakout supported by deep liquidity and sustained bid absorption.

The two setups may look similar if we only compare their direction and price movement. Their underlying market conditions tell a different story.

## Why Walrus Memory?

Walrus is not just where RogueTrader stores its historical data. It is the memory layer that makes those experiences available to subsequent evaluations.

We integrated `@mysten-incubation/memwal` and deployed a `MemWalAccount` on Sui Mainnet.

Our current memory collection includes:

- 12 seeded market-regime memories stored on Walrus Mainnet.
- Semantic retrieval through `memwal.recall`.
- New memory commits through `memwal.remember`.
- Three additional forecast records committed before their outcomes were resolved.

We also separated retrieval from storage.

A pre-trade check needs to retrieve relevant memories quickly. A post-trade write can take longer because it involves committing the memory to the storage and indexing pipeline.

That is why the current architecture uses fast recall in the decision path and asynchronous writes for new experiences.

The important distinction is that a stored memory must be retrievable and capable of changing the product's behaviour. Otherwise, it is just an archive.

## Where Tatum fits

Tatum connects RogueTrader to the Sui network.

When configured with a Tatum API key, the application uses Tatum's Sui Mainnet gateway to retrieve the latest checkpoint through:

`sui_getLatestCheckpointSequenceNumber`

It also uses Tatum's Exchange Rate API to retrieve SUI/USD reference pricing.

For broader DEX context, RogueTrader retrieves volume and liquidity information through DexScreener.

One implementation detail is worth making clear: not every microstructure variable is currently fetched from a live protocol integration. NAVI borrow utilisation and DeepBook orderbook conditions are represented through selectable benchmark presets.

We use those presets to demonstrate how the system responds to different market regimes while still connecting the application to live Sui network and price information.

Tatum is also part of the payment-verification path for external agents using RogueTrader's x402 API.

## Does memory improve the prediction?

We use the **Brier score** to compare the probability forecasts produced by a stateless baseline against forecasts adjusted using market memory.

The Brier score measures the squared difference between a predicted probability and the actual binary outcome.

Its formula is:

\[
BS = \frac{1}{N}\sum_{i=1}^{N}(p_i-o_i)^2
\]

Where:

- \(N\) is the number of evaluated forecasts.
- \(p_i\) is the predicted probability, expressed between 0 and 1.
- \(o_i\) is the observed binary outcome: 1 if the predicted event occurred, 0 if it did not.

A lower score indicates that the predicted probabilities are closer to the observed outcomes.

Consider a system that predicts an 88% probability of a bullish continuation.

If the market does not continue upwards:

\[
(0.88-0)^2 = 0.7744
\]

That is a substantial forecasting error.

If memory changes the forecast to 46%, the error becomes:

\[
(0.46-0)^2 = 0.2116
\]

Memory has reduced the error in this scenario by making the prediction less overconfident.

But the opposite can also happen. If the market conditions resemble a previously successful catalyst and the bullish outcome occurs, increasing confidence can reduce the Brier error.

That is why we don't want RogueTrader to simply lower every confidence score. The objective is better calibration, not permanent conservatism.

### Our seeded benchmark

We compared five seeded Sui market-regime scenarios using the forecast probabilities and binary outcomes recorded in `HISTORICAL_BENCHMARK_ROWS` in `src/services/agentEngine.ts`.

Recalculating the five rows from their underlying forecast probabilities gives:

| Model | Mean Brier score |
|---|---:|
| Stateless baseline | 0.6108 |
| Walrus-adjusted forecasts | 0.1539 |

This represents an approximately **74.8% reduction in Brier error** across the seeded benchmark.

These numbers are recalculated from the five benchmark rows in the repository. They replace the earlier aggregate figures of 0.468 and 0.128, which did not match the stored rows.

There is an important limitation: this is a controlled, seeded benchmark, not a live trading performance study. The scenarios and their binary outcomes are predefined. The result demonstrates how the memory-adjusted probabilities compare against the baseline within those scenarios; it does not establish profitability or prove out-of-sample predictive accuracy.

We also distinguish this benchmark from the live evaluation view. Its current per-check Brier calculation uses the recalled memory category as an outcome proxy, rather than independently observing a resolved trade outcome. We therefore do not treat that live score as independent validation.

## Making RogueTrader accessible to other agents

We wanted the risk-checking capability to be accessible beyond the web interface.

RogueTrader exposes an HTTP 402 (`x402`) pay-per-check endpoint:

`POST https://roguetrader.vercel.app/api/x402/check`

The flow works as follows:

1. An external agent requests a trade evaluation.
2. RogueTrader responds with `402 Payment Required` and an invoice for 0.05 SUI.
3. The agent settles the payment on Sui Mainnet.
4. The agent retries the request with its transaction digest in the `X-PAYMENT` header.
5. RogueTrader verifies the transaction through Sui RPC using Tatum before processing the paid request.

This allows an external trading agent to access RogueTrader's risk evaluation without requiring a subscription or a manually managed account.

The payment flow has also been exercised with a Sui Mainnet settlement transaction.

## What is actually deployed?

RogueTrader is not just a local demonstration of a memory concept.

The project has:

- A deployed web application.
- A Sui Mainnet `MemWalAccount`.
- A deployed MemWal package.
- 12 seeded market-regime memory records on Walrus Mainnet.
- Three forecast records committed to Walrus before resolution.
- Tatum Sui RPC and Price API integration.
- A 0.05 SUI x402 pay-per-check flow.
- A memory inspector for searching and saving market lessons.

The repository includes the Mainnet identifiers, transaction digests and Walrus memory references in `mainnet-proof.json` and the README.

## What comes next?

The current implementation is a focused experiment in memory-informed market prediction and position sizing.

There is still work to do before it becomes a production-grade trading risk system.

Some of the next steps include:

- Expanding the benchmark beyond seeded market scenarios.
- Connecting more protocol-level liquidity and borrowing metrics directly.
- Building a longer-running dataset of independently resolved forecasts.
- Improving the relationship between retrieved memories, confidence adjustments and recommended exposure.
- Strengthening the post-trade outcome pipeline so that new memories consistently reflect independently verified results.

The most important question is not whether RogueTrader can remember twelve scenarios.

It is whether its decisions become better calibrated as it accumulates more real market experience.

## Closing

We started with a simple observation: a trading system that cannot remember previous market experiences risks approaching every new setup as if it has never seen anything like it before.

RogueTrader explores a different approach.

A new forecast is made. Relevant market experiences are recalled. Those experiences influence the prediction and recommended exposure. Once the trade has an outcome, that experience can become part of the memory available to the next decision.

Sometimes memory should make the system more cautious. Sometimes it should make it more confident.

**The point isn't to make a trading agent afraid of the market. It's to make sure the market doesn't have to teach it the same lesson twice.**