import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
  Database,
  RefreshCw
} from 'lucide-react';
import type { TatumMarketState } from '../types';
import { LivingGlyphMascot } from './LivingGlyphMascot';

interface LandingPageProps {
  marketState: TatumMarketState | null;
  theme: 'dark' | 'light';
  onLaunchDesk: () => void;
  onInspectMemory: () => void;
  onViewReceipts: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  marketState,
  theme,
  onLaunchDesk,
  onInspectMemory,
  onViewReceipts,
}) => {
  // Simulated Interactive Pipeline Beat (1 to 4)
  const [pipelineStep, setPipelineStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Auto-cycle through the 4 pipeline beats unless user manually clicks
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setPipelineStep((prev) => (prev % 4) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const PIPELINE_BEATS = [
    {
      step: 1,
      tag: '01 · YOU PROPOSE A TRADE',
      title: 'You want to go 15x Long on SUI',
      desc: 'Before your order hits Cetus or DeepBook, RogueTrader reads the live market state vector (pool depth, borrow load, orderbook skew) via Tatum.',
      badge: 'Reading Entry State',
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      terminal: [
        '> Proposed trade: Long SUI/USDC at 15x ($104,200)',
        '  1. Pool Depth:   $14.2M on Cetus (4.2% impact)',
        '  2. Borrow Load:  78.4% on NAVI (crowded longs)',
        '  3. Orderbook:    0.62x bid/ask (thin support)',
        '  4. Wipeout Drop: 6.6% (15x leverage)'
      ]
    },
    {
      step: 2,
      tag: '02 · WE CHECK PAST BLOWUPS',
      title: 'Wally matches the market fingerprint on Walrus',
      desc: 'In under a second, RogueTrader compares that market state against past trade snapshots stored on Walrus—finding an identical Oct 14 borrow squeeze.',
      badge: '96% State Match on Walrus',
      badgeColor: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      terminal: [
        '> Matching entry state vector against Walrus…',
        '  Matched blob: Oct 14 NAVI borrow squeeze (96.4% match)',
        '  Past regime move: Wicked -8.2% in 40m before recovering',
        '  Checked in: 0.9s on live Sui Mainnet',
        '  Status: DANGER — 6.6% BUFFER WILL GET LIQUIDATED'
      ]
    },
    {
      step: 3,
      tag: '03 · YOUR SIZE IS PROTECTED',
      title: 'Leverage is scaled from 15x down to 2x',
      desc: 'Because that microstructure regime historically wicked -8.2%, RogueTrader automatically scales your leverage down so your wipeout buffer is wider than the wick.',
      badge: 'Saved from Wipeout',
      badgeColor: 'text-pos bg-pos/10 border-pos/20',
      terminal: [
        '> Scaling leverage to survive -8.2% regime wick…',
        '  Blind confidence (no memory): 88% at 15x (6.6% buffer)',
        '  Protected size (Walrus):      46% at 2x  (50.0% buffer)',
        '  Tatum Wallet Monitor: Auto-saves outcome snapshot to Walrus',
        '  Result: Saved $92,400 from getting liquidated on the wick'
      ]
    },
    {
      step: 4,
      tag: '04 · BOTS USE IT AUTOMATICALLY',
      title: 'Any trading bot can call this for 0.05 SUI',
      desc: 'Running an automated trading bot? Point it at RogueTrader before it signs a trade. It pays 0.05 SUI per check over HTTP (x402) and gets the safe size back.',
      badge: 'Bot Guard Ready',
      badgeColor: 'text-pos bg-pos/10 border-pos/20',
      terminal: [
        '> Bot API check complete (HTTP 402)',
        '  Cost per check: 0.05 SUI',
        '  Verified on Sui block: #' + (marketState?.latestCheckpoint.toLocaleString() ?? '100,186,772'),
        '  Result: Safe 2x order returned to your bot'
      ]
    }
  ];

  const currentBeat = PIPELINE_BEATS[pipelineStep - 1];

  return (
    <div className="space-y-20 sm:space-y-28 pt-6 sm:pt-12 pb-16">
      {/* ─── 1. HERO SECTION: CABIN EXPERIENCE FIRST ─── */}
      <section className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: The 20-Second Human Payoff */}
          <div className="lg:col-span-7 space-y-6">
            {/* Simple Live Status Pill */}
            <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-xs max-w-full">
              <span className="live-dot" />
              <span className="font-medium text-fg">Live on Sui</span>
              <span className="text-fg-3">·</span>
              <span className="text-fg-2">6 past blowups remembered</span>
              <span className="hidden sm:inline text-fg-3">·</span>
              <span className="hidden sm:inline num text-pos">
                block #{marketState?.latestCheckpoint.toLocaleString() ?? '100,186,772'}
              </span>
            </div>

            {/* High-Impact Headline */}
            <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-6xl sm:leading-[1.08]">
              Every rogue trader had the same problem.{' '}
              <span className="text-fg-2">Nobody remembered the last blowup.</span>
            </h1>

            {/* Subtitle / Zero-Jargon Payoff */}
            <p className="max-w-xl text-base text-fg-2 sm:text-lg leading-relaxed">
              Before you or your trading bot places an order on Sui, RogueTrader checks your setup against past liquidations and market traps—automatically cutting your leverage when a trade looks like a repeat blowup.
            </p>

            {/* High-Conversion CTA Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onLaunchDesk}
                className="group flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-sm font-medium text-page transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <span>Check a Trade Now</span>
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={onInspectMemory}
                className="flex h-11 items-center gap-2 rounded-xl border border-line bg-raised/80 px-4 text-sm font-medium text-fg-2 hover:text-fg hover:border-line-2 transition-all duration-150 cursor-pointer"
              >
                <Database className="size-4" />
                <span>See Past Blowups</span>
              </button>

              <button
                type="button"
                onClick={onViewReceipts}
                className="flex h-11 items-center gap-2 rounded-xl border border-line bg-raised/80 px-4 text-sm font-medium text-fg-2 hover:text-fg hover:border-line-2 transition-all duration-150 cursor-pointer"
              >
                <Zap className="size-4 text-pos" />
                <span>Bot API (0.05 SUI)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean Wally Sentinel */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[380px]">
              <LivingGlyphMascot
                marketState={marketState}
                interceptActive={pipelineStep === 3}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. THE 20-SECOND STORY (ONE-CLICK FLOW) ─── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-pos">
              How It Works in 20 Seconds
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl mt-1">
              One check stops a repeat blowup before you place the order
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoPlaying((p) => !p)}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1 text-xs text-fg-2 hover:text-fg transition-colors cursor-pointer"
            >
              <RefreshCw className={`size-3 ${isAutoPlaying ? 'animate-spin' : ''}`} />
              <span>{isAutoPlaying ? 'Auto-playing' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* 4 Step Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {PIPELINE_BEATS.map((beat) => (
            <button
              key={beat.step}
              type="button"
              onClick={() => {
                setPipelineStep(beat.step);
                setIsAutoPlaying(false);
              }}
              className={`text-left rounded-xl p-3 sm:p-4 border transition-all duration-200 cursor-pointer ${
                pipelineStep === beat.step
                  ? 'border-pos bg-raised shadow-sm'
                  : 'border-line bg-card/50 hover:bg-card hover:border-line-2'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] sm:text-[11px] text-fg-3 truncate">{beat.tag}</span>
                {pipelineStep === beat.step && (
                  <span className="size-2 shrink-0 rounded-full bg-pos animate-pulse" />
                )}
              </div>
              <div className="font-medium text-sm text-fg mt-1.5 truncate">{beat.title}</div>
            </button>
          ))}
        </div>

        {/* Interactive Walkthrough Surface */}
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-raised/50">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <span className="size-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <span className="size-3 rounded-full bg-pos/20 border border-pos/40" />
              <span className="ml-2 font-mono text-xs text-fg-3">pre-trade-check</span>
            </div>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs ${currentBeat.badgeColor}`}>
              {currentBeat.badge}
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1">
                <div className="font-mono text-xs text-pos uppercase">{currentBeat.tag}</div>
                <h3 className="text-xl font-medium text-fg">{currentBeat.title}</h3>
                <p className="text-sm text-fg-2 leading-relaxed">{currentBeat.desc}</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onLaunchDesk}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-pos hover:underline cursor-pointer"
                >
                  <span>Try this live in the Trade Checker</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-line bg-page p-4 font-mono text-xs space-y-2">
              {currentBeat.terminal.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.startsWith('>')
                      ? 'text-fg font-semibold'
                      : line.includes('Status:') || line.includes('Result:') || line.includes('Action:')
                      ? 'text-pos font-semibold'
                      : 'text-fg-3'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. UNDER THE HOOD (FOR JUDGES & ENGINEERS) ─── */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-pos">
            Under the Hood
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl mt-1">
            Powered by Walrus Memory, Tatum, and Sui
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Walrus */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <Database className="size-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">Permanent Memory on Walrus</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Every past liquidation trap and failed setup is stored on Walrus (`@mysten-incubation/memwal`), so your trading history stays with you across apps and bots.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              Recalls matching setups in &lt;1s
            </div>
          </div>

          {/* Tile 2: Tatum */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <Cpu className="size-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">Live Sui Feed via Tatum</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Pulls live Sui mainnet block height and price state through Tatum RPC before sizing any order.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              sui-mainnet.gateway.tatum.io
            </div>
          </div>

          {/* Tile 3: x402 */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <Zap className="size-4 text-pos" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">Pay-Per-Check Bot API (x402)</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Other trading bots can call RogueTrader over standard HTTP 402, paying 0.05 SUI per trade check with zero API keys or subscriptions.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              0.05 SUI per bot check
            </div>
          </div>

          {/* Tile 4: Brier Score */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <ShieldCheck className="size-4 text-pos" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">74% Less Overconfident</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Audited with the Brier accuracy score across historical SUI setups—cutting reckless overconfidence from 0.468 down to 0.128.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              Brier error: 0.468 → 0.128 (backtest)
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. BOTTOM CONVERSION CTA ─── */}
      <section className="rounded-3xl border border-line bg-raised/60 p-8 sm:p-12 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl">
            Stop repeating yesterday's liquidation
          </h2>
          <p className="text-sm text-fg-2 leading-relaxed">
            Type any trade into the checker and see in one click whether a setup like yours blew up before.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onLaunchDesk}
            className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-fg px-6 text-sm font-medium text-page transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-md"
          >
            <span>Check a Trade Now</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
