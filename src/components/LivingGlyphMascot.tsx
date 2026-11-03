import React from 'react';
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
  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#100,185,039';

  const isLight = theme === 'light';
  const currentSrc = isLight ? WALLY_SENTINEL.lightSrc : WALLY_SENTINEL.darkSrc;

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] flex-col items-center justify-center select-none pt-2 sm:pt-4">
      {/* 
        NO Bounding Box or Picture Frame:
        Wally sits directly on the page background with physical contact ground shadows.
        Both dark and light assets are true transparent PNGs.
      */}
      <div className="relative flex w-full items-center justify-center">
        {/* Soft Ambient Ground Plane Contact Shadow */}
        <div
          className="pointer-events-none absolute bottom-4 sm:bottom-6 h-8 w-44 sm:w-64 rounded-full bg-black/15 blur-xl dark:bg-black/70 transition-all duration-300"
          aria-hidden="true"
        />

        {/* Visor / Memory Scan Ambient Glow (when Intercept is active) */}
        <div
          className={`pointer-events-none absolute top-12 sm:top-16 size-48 sm:size-56 rounded-full blur-2xl transition-opacity duration-700 ${
            interceptActive
              ? 'bg-pos/25 opacity-100'
              : 'opacity-0 dark:bg-white/5 dark:opacity-40'
          }`}
          aria-hidden="true"
        />

        {/* The Native Mascot Render (True Transparent PNG) */}
        <div className="relative z-10 w-full max-w-[280px] sm:max-w-[340px]">
          <img
            key={`wally-${theme}`}
            src={currentSrc}
            alt={WALLY_SENTINEL.alt}
            className={`h-auto w-full object-contain transition-all duration-300 ${
              isLight
                ? 'drop-shadow-[0_18px_24px_rgba(0,0,0,0.12)]'
                : 'drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]'
            }`}
            loading="eager"
          />
        </div>

        {/* 
          Pinned 1px Hairline Leader-Lines:
          Displayed on screens >= 640px (tablets & desktops) where there is generous horizontal clearance.
          Hidden on narrow mobile screens (< 640px) to prevent floating dots and edge clipping.
        */}

        {/* Leader-Line 1 (Top Left): Visor -> Tatum Checkpoint */}
        <div className="pointer-events-none absolute top-[16%] -left-2 sm:-left-6 z-20 hidden sm:flex items-center gap-1.5">
          <div className="flex flex-col items-end">
            <span className="keycap text-[10px] sm:text-xs">
              <span>ckpt</span> {ckpt}
            </span>
            <span className="text-[9px] font-mono text-fg-3">Tatum Sui RPC</span>
          </div>
          <div className="relative h-[1px] w-5 sm:w-8 bg-line-2">
            <div className="absolute right-0 top-[-2px] size-1.5 rounded-full bg-fg" />
          </div>
        </div>

        {/* Leader-Line 2 (Bottom Left): Recall Core -> Walrus Recall Latency */}
        <div className="pointer-events-none absolute bottom-[26%] -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-1.5">
          <div className="flex flex-col items-end">
            <span className="keycap text-[10px] sm:text-xs">
              <span>recall</span> &lt;1s
            </span>
            <span className="text-[9px] font-mono text-fg-3">Walrus Vector</span>
          </div>
          <div className="relative h-[1px] w-5 sm:w-8 bg-line-2">
            <div className="absolute right-0 top-[-2px] size-1.5 rounded-full bg-fg" />
          </div>
        </div>

        {/* Leader-Line 3 (Top Right): Visor / Tusk -> Memory Blob Hash */}
        <div className="pointer-events-none absolute top-[18%] -right-2 sm:-right-6 z-20 hidden sm:flex items-center gap-1.5">
          <div className="relative h-[1px] w-5 sm:w-8 bg-line-2">
            <div className="absolute left-0 top-[-2px] size-1.5 rounded-full bg-fg" />
          </div>
          <div className="flex flex-col items-start">
            <span className="keycap text-[10px] sm:text-xs">
              <span>blob</span> 0x8f9a…2c
            </span>
            <span className="text-[9px] font-mono text-fg-3">Walrus Epoch</span>
          </div>
        </div>

        {/* Leader-Line 4 (Bottom Right): Base / Core -> Brier Calibration Delta */}
        <div className="pointer-events-none absolute bottom-[24%] -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-1.5">
          <div className="relative h-[1px] w-5 sm:w-8 bg-line-2">
            <div className="absolute left-0 top-[-2px] size-1.5 rounded-full bg-fg" />
          </div>
          <div className="flex flex-col items-start">
            <span className="keycap text-[10px] sm:text-xs">
              <span>brier</span> 0.128
            </span>
            <span className="text-[9px] font-mono text-pos">seeded bench</span>
          </div>
        </div>
      </div>

      {/* Option C: Single Definitive Identity Badge & Protocol Mandate */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised/80 px-3 py-1 text-xs font-mono backdrop-blur-sm">
          <span
            className={`size-2 rounded-full transition-colors ${
              interceptActive ? 'bg-pos animate-pulse' : 'bg-pos'
            }`}
          />
          <span className="text-fg font-medium">{WALLY_SENTINEL.name}</span>
          <span className="text-fg-3">·</span>
          <span className="text-fg-2">{WALLY_SENTINEL.title}</span>
        </div>
        <span className="text-[10px] font-mono text-fg-3 tracking-tight">
          {WALLY_SENTINEL.subtitle}
        </span>
      </div>
    </div>
  );
};
