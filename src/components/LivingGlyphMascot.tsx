import React, { useState } from 'react';
import type { TatumMarketState } from '../types';

interface LivingGlyphMascotProps {
  marketState: TatumMarketState | null;
  interceptActive?: boolean;
  theme?: 'dark' | 'light';
}

const WALLY_SENTINEL = {
  name: 'Wally',
  title: 'Walrus Memory Sentinel',
  subtitle: '0.05 SUI x402 Risk Gate · Sui Mainnet',
  darkSrc: '/mascot/walrus-sentinel-2.png',
  lightSrc: '/mascot/walrus-sentinel-light-1.png',
  alt: 'Wally · Walrus Memory Sentinel — Active cyber visor and chest memory reactor core',
};

export const LivingGlyphMascot: React.FC<LivingGlyphMascotProps> = ({
  marketState,
  interceptActive = false,
  theme = 'dark',
}) => {
  const [isPinging, setIsPinging] = useState(false);

  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#100,185,039';

  const isLight = theme === 'light';
  const currentSrc = isLight ? WALLY_SENTINEL.lightSrc : WALLY_SENTINEL.darkSrc;

  const triggerPing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPinging(true);
    setTimeout(() => setIsPinging(false), 850);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] flex-col items-center justify-center select-none pt-2 sm:pt-4">
      {/* 
        NO Bounding Box: Wally sits directly on the page background
        with full solid geometry, physical ground contact shadows,
        and an authentic Wabi Liquid Glass Memory Reactor Node on his chest.
      */}
      <div className="relative flex w-full items-center justify-center">
        {/* Soft Ambient Ground Plane Contact Shadow */}
        <div
          className="pointer-events-none absolute bottom-4 sm:bottom-6 h-8 w-44 sm:w-64 rounded-full bg-black/15 blur-xl dark:bg-black/70 transition-all duration-300"
          aria-hidden="true"
        />

        {/* Visor / Memory Scan Ambient Glow */}
        <div
          className={`pointer-events-none absolute top-12 sm:top-16 size-48 sm:size-56 rounded-full blur-2xl transition-opacity duration-700 ${
            interceptActive || isPinging
              ? 'bg-pos/30 opacity-100'
              : 'opacity-0 dark:bg-white/5 dark:opacity-40'
          }`}
          aria-hidden="true"
        />

        {/* The Native Mascot Render (True Transparent PNG) */}
        <div className="relative z-10 w-full max-w-[250px] sm:max-w-[340px]">
          <img
            key={`wally-${theme}`}
            src={currentSrc}
            alt={WALLY_SENTINEL.alt}
            onClick={() => triggerPing()}
            className="h-auto w-full object-contain cursor-pointer transition-all duration-300 drop-shadow-[0_18px_24px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
            loading="eager"
          />

          {/* 
            ─── WABI LIQUID GLASS MEMORY REACTOR NODE ───
            Optical Liquid Glass Dome mounted directly onto Wally's chest harness buckle.
            Coordinates: 58.2% from top, 53.8% from left.
          */}
          <div
            onClick={(e) => triggerPing(e)}
            className="absolute top-[58.2%] left-[53.8%] -translate-x-1/2 -translate-y-1/2 w-[13.5%] aspect-square rounded-xl sm:rounded-2xl cursor-pointer group/node"
            title="Wally Walrus Memory Reactor · Click to trigger optical pulse"
          >
            {/* Outer Specular Edge & Iridescent Spectral Rim */}
            <div
              className={`absolute inset-0 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                isPinging || interceptActive
                  ? 'border-pos shadow-[0_0_16px_rgba(76,195,138,0.7),inset_1.5px_1.5px_1px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_1px_rgba(192,132,252,0.8)]'
                  : 'border-white/40 dark:border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_1px_1px_1px_rgba(255,255,255,0.75),inset_-1px_-1px_1px_rgba(192,132,252,0.45)] group-hover/node:border-white/70'
              } backdrop-blur-md bg-gradient-to-br from-white/35 via-white/10 to-black/30 dark:from-white/20 dark:via-white/5 dark:to-black/45 overflow-hidden`}
            >
              {/* Traveling Specular Caustic Light Glint */}
              <div className="pointer-events-none absolute inset-0 -top-full -left-full size-[300%] bg-gradient-to-br from-transparent via-white/50 to-transparent animate-caustic-sweep" />

              {/* Liquid Glass Internal Refraction Sheen */}
              <div className="absolute inset-[12%] rounded-lg bg-gradient-to-t from-transparent via-pos/15 to-white/30 pointer-events-none" />

              {/* Central Luminous Memory Core Indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-1 sm:w-1.5 h-3 sm:h-4.5 rounded-full bg-pos transition-all duration-300 ${
                    isPinging || interceptActive
                      ? 'shadow-[0_0_14px_#4cc38a,0_0_24px_#4cc38a] scale-110'
                      : 'shadow-[0_0_8px_#4cc38a] animate-core-breathe'
                  }`}
                />
              </div>
            </div>

            {/* Expanding Glass Shockwave Ring on Tap / Ping */}
            {isPinging && (
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-pos/80 animate-glass-shockwave pointer-events-none" />
            )}
          </div>
        </div>

        {/* 
          Pinned 1px Hairline Leader-Lines:
          Visible across all viewports (mobile & desktop).
          Ripples with an active highlight flash during Diagnostic Ping.
        */}

        {/* Leader-Line 1 (Top Left): Visor -> Tatum Checkpoint */}
        <div className="pointer-events-none absolute top-[16%] left-0 sm:-left-6 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="flex flex-col items-end">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isPinging ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              <span>ckpt</span> {ckpt}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">Tatum Sui RPC</span>
          </div>
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute right-0 top-[-2px] size-1 sm:size-1.5 rounded-full transition-colors ${
                isPinging ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
        </div>

        {/* Leader-Line 2 (Bottom Left): Recall Core -> Walrus Recall Latency */}
        <div className="pointer-events-none absolute bottom-[26%] left-0 sm:-left-4 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="flex flex-col items-end">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isPinging ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              <span>recall</span> &lt;1s
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">Walrus Vector</span>
          </div>
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute right-0 top-[-2px] size-1 sm:size-1.5 rounded-full transition-colors ${
                isPinging ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
        </div>

        {/* Leader-Line 3 (Top Right): Visor / Tusk -> Memory Blob Hash */}
        <div className="pointer-events-none absolute top-[18%] right-0 sm:-right-6 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute left-0 top-[-2px] size-1.5 rounded-full transition-colors ${
                isPinging ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
          <div className="flex flex-col items-start">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isPinging ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              <span>blob</span> 0x8f9a…2c
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">Walrus Epoch</span>
          </div>
        </div>

        {/* Leader-Line 4 (Bottom Right): Base / Core -> Brier Calibration Delta */}
        <div className="pointer-events-none absolute bottom-[24%] right-0 sm:-right-4 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute left-0 top-[-2px] size-1.5 rounded-full transition-colors ${
                isPinging ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
          <div className="flex flex-col items-start">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isPinging ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              <span>brier</span> 0.128
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-pos">seeded bench</span>
          </div>
        </div>
      </div>

      {/* Single Definitive Identity Badge & Protocol Mandate */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <div
          onClick={() => triggerPing()}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono backdrop-blur-sm transition-all duration-200 cursor-pointer ${
            isPinging
              ? 'border-pos bg-pos/15 text-pos shadow-[0_0_12px_rgba(76,195,138,0.25)]'
              : 'border-line bg-raised/80 text-fg'
          }`}
        >
          <span
            className={`size-2 rounded-full transition-colors ${
              isPinging ? 'bg-pos animate-ping' : interceptActive ? 'bg-pos animate-pulse' : 'bg-pos'
            }`}
          />
          <span className="font-medium">
            {isPinging ? 'Telemetry Ping Active' : WALLY_SENTINEL.name}
          </span>
          <span className="text-fg-3">·</span>
          <span className={isPinging ? 'text-pos' : 'text-fg-2'}>
            {isPinging ? 'Walrus Calibrated' : WALLY_SENTINEL.title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-fg-3 tracking-tight">
          {WALLY_SENTINEL.subtitle}
        </span>
      </div>
    </div>
  );
};
