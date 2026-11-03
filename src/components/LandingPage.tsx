import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
  Terminal,
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
      tag: '01 · INTENT',
      title: 'Agent Proposes 15x SUI Perp',
      desc: 'An autonomous trading bot generates an aggressive long order on DeepBook v3 based solely on current momentum.',
      badge: 'Unchecked Intent',
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      terminal: [
        '> POST /v1/agent/intent',
        '  Asset: SUI/USDC Perp',
        '  Size: $104,200 (15x Leverage)',
        '  Stop Loss: $1.98 (-5.4%)',
        '  State: UNVERIFIED (Sent to RogueTrader Gate)'
      ]
    },
    {
      step: 2,
      tag: '02 · RECALL',
      title: 'Walrus Recalls Flash Crash Blobs',
      desc: 'RogueTrader queries permanent Walrus memory across 42 epochs, retrieving matching liquidity crash vectors.',
      badge: 'Blob Matched 96.4%',
      badgeColor: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      terminal: [
        '> GET walrus://memory.walrus.xyz/blobs/0x8f9a..2c',
        '  Matched Epoch: #42 (2024-11 Flash Crash)',
        '  Liquidation Cascade Signature: 96.4% Similarity',
        '  Recall Latency: 12.4ms via Tatum Sui RPC',
        '  Status: ANOMALY SIGNATURE DETECTED'
      ]
    },
    {
      step: 3,
      tag: '03 · INTERCEPT',
      title: 'Brier Metric Triggers Downsize',
      desc: 'Epistemic probability scoring penalizes unhedged confidence. Risk gate caps leverage from 15x down to 2x spot.',
      badge: 'Risk Intercept Active',
      badgeColor: 'text-pos bg-pos/10 border-pos/20',
      terminal: [
        '> EXEC epistemic_brier_evaluation()',
        '  Stateless Brier Score: 0.774 (Severe Overconfidence)',
        '  Walrus Calibrated Score: 0.176 (Optimal Calibration)',
        '  Intervention: DOWNSIZE_POSITION (15x -> 2x)',
        '  Capital Saved: $92,400 from Immediate Wick'
      ]
    },
    {
      step: 4,
      tag: '04 · SETTLE',
      title: 'x402 Micropayment Mints Receipt',
      desc: 'Agent autonomously pays 0.002 SUI HTTP 402 micro-fee. An immutable execution receipt settles on Sui mainnet.',
      badge: 'Settled on Sui',
      badgeColor: 'text-pos bg-pos/10 border-pos/20',
      terminal: [
        '> POST /v1/x402/settle',
        '  Payment: 0.002 SUI (HTTP 402 Payment Required)',
        '  Payer: 0x4f82..12bc (Agent Programmable Key)',
        '  Receipt Digest: 0x93e1..88fa (Verified on Tatum Gateway)',
        '  Result: PROTECTED ORDER DISPATCHED TO DEEPBOOK'
      ]
    }
  ];

  const currentBeat = PIPELINE_BEATS[pipelineStep - 1];

  return (
    <div className="space-y-20 sm:space-y-32 pt-6 sm:pt-12 pb-16">
      {/* ─── 1. HERO SECTION: THE LIQUID GLASS SENTINEL STAGE ─── */}
      <section className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: The 20-Second Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Liquid Glass Pill: Live Protocol Status */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-xs">
              <span className="live-dot" />
              <span className="font-medium text-fg">Sui Mainnet</span>
              <span className="text-fg-3">·</span>
              <span className="num text-fg-2">Walrus Epoch 42</span>
              <span className="text-fg-3">·</span>
              <span className="num text-pos">
                ckpt #{marketState?.latestCheckpoint.toLocaleString() ?? '100,186,772'}
              </span>
            </div>

            {/* High-Impact Headline */}
            <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-6xl sm:leading-[1.08]">
              Autonomous agents need memory.{' '}
              <span className="text-fg-2">Not just prompts.</span>
            </h1>

            {/* Subtitle / Product Compression */}
            <p className="max-w-xl text-base text-fg-2 sm:text-lg leading-relaxed">
              Before an AI agent executes on Sui, RogueTrader checks its trade against permanent Walrus memory. We recall past liquidation traps, score risk with Brier-calibrated vectors, and enforce mathematical risk boundaries via x402 micropayments.
            </p>

            {/* High-Conversion CTA Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onLaunchDesk}
                className="group flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-sm font-medium text-page transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <span>Launch Trading Desk</span>
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={onInspectMemory}
                className="flex h-11 items-center gap-2 rounded-xl border border-line bg-raised/80 px-4 text-sm font-medium text-fg-2 hover:text-fg hover:border-line-2 transition-all duration-150 cursor-pointer"
              >
                <Database className="size-4" />
                <span>Inspect Walrus Blobs</span>
              </button>

              <button
                type="button"
                onClick={onViewReceipts}
                className="flex h-11 items-center gap-2 rounded-xl border border-line bg-raised/80 px-4 text-sm font-medium text-fg-2 hover:text-fg hover:border-line-2 transition-all duration-150 cursor-pointer"
              >
                <Zap className="size-4 text-pos" />
                <span className="num">x402</span>
                <span>Receipts</span>
              </button>
            </div>

            {/* Quick Developer CLI Chip */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-page/80 px-3 py-1.5 font-mono text-xs text-fg-3">
                <Terminal className="size-3.5 text-fg-2" />
                <span className="text-fg-2">$</span>
                <span className="text-fg select-all">curl -s https://memory.walrus.xyz/rogue | sui client call</span>
              </div>
            </div>
          </div>

          {/* Right Column: Wally the Sentinel with Wabi Liquid Glass Satellites */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* The Clean Sentinel Mascot */}
            <div className="relative w-full max-w-[380px]">
              <LivingGlyphMascot
                marketState={marketState}
                interceptActive={pipelineStep === 3}
                theme={theme}
              />

              {/* 
                ─── WABI LIQUID GLASS SATELLITE CARD 01 (Top-Right) ───
                Framed with true optical backdrop blur, delicate specular border, and tabular metadata
              */}
              <div className="pointer-events-none absolute -top-4 -right-2 sm:-right-8 z-30 w-52 sm:w-60 rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] p-3 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_1px_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_1px_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300">
                <div className="flex items-center justify-between border-b border-line/60 pb-1.5 text-[10px]">
                  <span className="font-medium text-pos flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-pos animate-pulse" />
                    WALRUS RECALL
                  </span>
                  <span className="num text-fg-3">12.4ms</span>
                </div>
                <div className="pt-2 space-y-1 text-xs">
                  <div className="font-medium text-fg truncate">2024-11 Liquidation Trap</div>
                  <div className="flex items-center justify-between text-[11px] text-fg-2">
                    <span>Similarity</span>
                    <span className="num font-semibold text-pos">96.4% match</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-fg-3">
                    <span>Blob ID</span>
                    <span className="num text-fg-2">0x8f9a..2c</span>
                  </div>
                </div>
              </div>

              {/* 
                ─── WABI LIQUID GLASS SATELLITE CARD 02 (Bottom-Left) ───
                x402 Micropayment Guard Chip
              */}
              <div className="pointer-events-none absolute -bottom-6 -left-2 sm:-left-6 z-30 w-48 sm:w-56 rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] p-3 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_1px_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_1px_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300">
                <div className="flex items-center justify-between border-b border-line/60 pb-1.5 text-[10px]">
                  <span className="font-medium text-fg-2 flex items-center gap-1">
                    <Zap className="size-3 text-pos" />
                    x402 MICROPAY
                  </span>
                  <span className="num text-pos">SETTLED</span>
                </div>
                <div className="pt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-fg-3">Protocol Fee</span>
                    <span className="num font-medium text-fg">0.002 SUI</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-fg-3">Network</span>
                    <span className="text-fg-2">Sui Mainnet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. STAGESHOW 20-SECOND INTERACTIVE PIPELINE DEMO ─── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-pos">
              The 20-Second Mechanism
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl mt-1">
              How RogueTrader intercepts reckless agent trades
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoPlaying((p) => !p)}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1 text-xs text-fg-2 hover:text-fg transition-colors"
            >
              <RefreshCw className={`size-3 ${isAutoPlaying ? 'animate-spin' : ''}`} />
              <span>{isAutoPlaying ? 'Auto-playing' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* 4 Pipeline Step Selectors */}
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
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-fg-3">{beat.tag}</span>
                {pipelineStep === beat.step && (
                  <span className="size-2 rounded-full bg-pos animate-pulse" />
                )}
              </div>
              <div className="font-medium text-sm text-fg mt-1.5 truncate">{beat.title}</div>
            </button>
          ))}
        </div>

        {/* Stageshow Believable Terminal Simulation Surface */}
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-raised/50">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <span className="size-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <span className="size-3 rounded-full bg-pos/20 border border-pos/40" />
              <span className="ml-2 font-mono text-xs text-fg-3">roguetrader-guardian.trace</span>
            </div>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs ${currentBeat.badgeColor}`}>
              {currentBeat.badge}
            </span>
          </div>

          {/* Interactive Stage Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Description & Narrative */}
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
                  <span>Test this scenario in the Live Desk</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>

            {/* Stageshow Real Telemetry Terminal Box */}
            <div className="lg:col-span-7 rounded-xl border border-line bg-page p-4 font-mono text-xs space-y-2">
              {currentBeat.terminal.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.startsWith('>')
                      ? 'text-fg font-semibold'
                      : line.includes('Status:') || line.includes('Result:') || line.includes('Intervention:')
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

      {/* ─── 3. PROTOCOL INVARIANTS & MECHANISM SPEC ─── */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-pos">
            Epistemic Architecture
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl mt-1">
            Engineered for high-assurance agent autonomy
          </h2>
        </div>

        {/* 4-Column Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Walrus Total Recall */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <Database className="size-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">Walrus Decentralized Blobs</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Historical market shocks, liquidation cascades, and flash crashes preserved immutably across epochs on Walrus.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              Zero centralized databases
            </div>
          </div>

          {/* Tile 2: Tatum Sui Streaming */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <Cpu className="size-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">Tatum Sui RPC Gateway</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Enterprise real-time Sui checkpoint streaming with automatic node failover. Never miss an epoch transition.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              Sub-15ms checkpoint latency
            </div>
          </div>

          {/* Tile 3: x402 Micropayments */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <Zap className="size-4 text-pos" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">x402 Agent Billing</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Native HTTP 402 protocol for machine-to-machine settlement. Agents pay 0.002 SUI per memory lookup without credit cards.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              Zero-custody settlement receipts
            </div>
          </div>

          {/* Tile 4: Brier Scoring Invariant */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3 transition-colors hover:border-line-2">
            <div className="size-9 rounded-xl border border-line bg-raised flex items-center justify-center text-fg">
              <ShieldCheck className="size-4 text-pos" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-fg text-base">Brier Epistemic Scoring</h3>
              <p className="text-xs text-fg-2 leading-relaxed">
                Mathematical calibration penalty that prevents agent hallucination and penalizes overconfidence before capital is at risk.
              </p>
            </div>
            <div className="pt-2 font-mono text-[11px] text-fg-3 border-t border-line/60">
              Brier = (1 / N) * SUM((f_t - o_t)^2)
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. BOTTOM CONVERSION CTA ─── */}
      <section className="rounded-3xl border border-line bg-raised/60 p-8 sm:p-12 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl">
            Give your Sui agents permanent memory today
          </h2>
          <p className="text-sm text-fg-2 leading-relaxed">
            Test trade checks in the interactive desk, query Walrus memory blobs, or inspect verified x402 settlement receipts on Sui mainnet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onLaunchDesk}
            className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-fg px-6 text-sm font-medium text-page transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-md"
          >
            <span>Enter Execution Desk</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
