import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Play, Pause } from 'lucide-react';
import type { TatumMarketState } from '../types';

interface LiquidGlassCapsuleProps {
  marketState: TatumMarketState | null;
  onBeatChange?: (beat: 1 | 2 | 3) => void;
}

export const LiquidGlassCapsule: React.FC<LiquidGlassCapsuleProps> = ({
  marketState,
  onBeatChange,
}) => {
  const [currentBeat, setCurrentBeat] = useState<1 | 2 | 3>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#100,185,039';

  // Automated 3-Beat Stageshow Loop (12 seconds total cycle)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentBeat((prev) => {
        const next = prev === 1 ? 2 : prev === 2 ? 3 : 1;
        onBeatChange?.(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, onBeatChange]);

  const selectBeat = useCallback(
    (beat: 1 | 2 | 3) => {
      setCurrentBeat(beat);
      onBeatChange?.(beat);
      setIsPlaying(false); // Pause auto-play when user manually investigates a beat
    },
    [onBeatChange]
  );

  // Mouse / Touch Specular Tracking over Glass Surface
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full max-w-[420px] rounded-2xl border border-line-2/40 bg-card/60 p-4 backdrop-blur-xl shadow-2xl transition-all duration-300"
    >
      {/* ─── THE LIQUID GLASS DISPLACEMENT DOME ─── */}
      <div className="relative overflow-hidden rounded-xl border border-white/20 dark:border-white/10 bg-gradient-to-b from-white/15 to-white/5 dark:from-white/10 dark:to-white/[0.02] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_24px_-8px_rgba(0,0,0,0.3)]">
        {/* Chromatic Aberration Rim (Cyan & Magenta offset edges) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            boxShadow:
              'inset 1px 1px 0 rgba(76, 195, 138, 0.4), inset -1px -1px 0 rgba(229, 72, 77, 0.25)',
          }}
          aria-hidden="true"
        />

        {/* Specular Caustic Light Glint (Follows Cursor / Touch) */}
        <div
          className="pointer-events-none absolute size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-transparent blur-md transition-all duration-150 ease-out"
          style={{ left: `${lensPos.x}%`, top: `${lensPos.y}%` }}
          aria-hidden="true"
        />

        {/* Top Status Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-line pb-2.5 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors ${
                currentBeat === 1
                  ? 'bg-amber-400 animate-pulse'
                  : currentBeat === 2
                  ? 'bg-cyan-400 animate-spin'
                  : 'bg-pos shadow-[0_0_8px_#4cc38a]'
              }`}
            />
            <span className="font-medium text-fg">
              {currentBeat === 1 && '01 · Incoming Order Check'}
              {currentBeat === 2 && '02 · Refracting Walrus Memory'}
              {currentBeat === 3 && '03 · Trade Calibrated & Sealed'}
            </span>
          </div>

          <span className="text-[10px] text-fg-3">{ckpt}</span>
        </div>

        {/* ─── LIVE REFRACTIVE DATA SLIP (PHYSICALLY DISTORTED UNDER GLASS) ─── */}
        <div
          className={`relative z-10 mt-3.5 space-y-3 transition-all duration-500 ${
            currentBeat === 2
              ? '[filter:url(#liquid-refract-active)] scale-[1.01]'
              : '[filter:url(#liquid-refract-light)]'
          }`}
        >
          {/* Order Identity Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-fg">SUI / USD Perp</span>
              <p className="text-[10px] font-mono text-fg-3">DeepBook v3 Liquidity Pool</p>
            </div>

            <div className="text-right">
              {currentBeat === 1 && (
                <div className="inline-flex items-center gap-1 rounded bg-neg/15 px-2 py-0.5 text-xs font-mono font-medium text-neg">
                  <AlertTriangle className="size-3" />
                  <span>25.0x Toxic Leverage</span>
                </div>
              )}

              {currentBeat === 2 && (
                <div className="inline-flex items-center gap-1 rounded bg-cyan-500/15 px-2 py-0.5 text-xs font-mono font-medium text-cyan-400 animate-pulse">
                  <Cpu className="size-3 animate-spin" />
                  <span>Vector Scanning</span>
                </div>
              )}

              {currentBeat === 3 && (
                <div className="inline-flex items-center gap-1 rounded bg-pos/15 px-2 py-0.5 text-xs font-mono font-medium text-pos">
                  <ShieldCheck className="size-3" />
                  <span>3.2x Safe Limit</span>
                </div>
              )}
            </div>
          </div>

          {/* Refractive Numbers Box */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-raised/80 p-2.5 text-center font-mono">
            <div className="border-r border-line/60 pr-1">
              <span className="text-[9px] text-fg-3">Proposed Size</span>
              <p className="text-xs font-medium text-fg">$104,200</p>
            </div>

            <div className="border-r border-line/60 px-1">
              <span className="text-[9px] text-fg-3">Brier Delta</span>
              <p
                className={`text-xs font-medium ${
                  currentBeat === 3 ? 'text-pos' : 'text-amber-400'
                }`}
              >
                {currentBeat === 1 ? '0.842' : currentBeat === 2 ? '0.340…' : '0.128'}
              </p>
            </div>

            <div className="pl-1">
              <span className="text-[9px] text-fg-3">
                {currentBeat === 3 ? 'Max Safe Liq' : 'Est. Liq Price'}
              </span>
              <p
                className={`text-xs font-medium ${
                  currentBeat === 3 ? 'text-pos' : 'text-neg'
                }`}
              >
                {currentBeat === 3 ? '$1.34' : '$1.98'}
              </p>
            </div>
          </div>

          {/* Walrus Memory Seal & Vector Proof Banner */}
          <div className="rounded-md border border-line bg-raised/50 px-2.5 py-1.5 text-[10px] font-mono text-fg-2">
            {currentBeat === 1 && (
              <span className="text-fg-3">
                Querying Walrus vector memory for historical Cetus liquidation clusters…
              </span>
            )}

            {currentBeat === 2 && (
              <span className="text-cyan-400">
                Matched 96.4% against 2024-11 Flash Crash (Blob ID: 0x8f9a…2c)
              </span>
            )}

            {currentBeat === 3 && (
              <div className="flex items-center justify-between text-pos">
                <span>0.05 SUI x402 Micropayment Verified</span>
                <span className="text-fg-3">Blob Sealed · Epoch #41</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── STAGESHOW CONTROLS & MANUAL BEAT SELECTOR ─── */}
      <div className="mt-3 flex items-center justify-between pt-1">
        {/* 3 Step Buttons */}
        <div className="flex items-center gap-1">
          {([1, 2, 3] as const).map((beat) => (
            <button
              key={beat}
              type="button"
              onClick={() => selectBeat(beat)}
              className={`rounded-md border px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                currentBeat === beat
                  ? 'border-line-2 bg-raised text-fg font-medium shadow-xs'
                  : 'border-transparent text-fg-3 hover:border-line hover:text-fg-2'
              }`}
            >
              {beat === 1 && '01 · Proposed'}
              {beat === 2 && '02 · Scan'}
              {beat === 3 && '03 · Cleared'}
            </button>
          ))}
        </div>

        {/* Auto-Play Toggle */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Auto-Walkthrough' : 'Play Auto-Walkthrough'}
          className="flex items-center gap-1 rounded-md border border-line bg-raised px-2 py-0.5 text-[10px] font-mono text-fg-2 hover:text-fg hover:border-line-2 transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="size-2.5" />
              <span>Auto</span>
            </>
          ) : (
            <>
              <Play className="size-2.5 text-pos" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
