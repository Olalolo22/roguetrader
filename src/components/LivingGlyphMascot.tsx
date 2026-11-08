import React, { useState, useCallback } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#100,185,039';

  const isLight = theme === 'light';
  const currentSrc = isLight ? WALLY_SENTINEL.lightSrc : WALLY_SENTINEL.darkSrc;

  // Hover triggers leader-line illumination
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Touch triggers on mobile
  const handleTouchStart = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsHovered(false);
  }, []);

  const isActive = isHovered || interceptActive;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative mx-auto flex w-full max-w-[420px] flex-col items-center justify-center select-none pt-2 sm:pt-4 cursor-pointer group"
    >
      {/* 
        NO Bounding Box or Fake Button:
        Wally sits directly on the page background with full solid geometry.
        The liquid glass specular gleam and blink happen directly across
        his actual rendered chest armor plate with zero floating boxes.
      */}
      <div className="relative flex w-full items-center justify-center">
        {/* Soft Ambient Ground Plane Contact Shadow */}
        <div
          className={`pointer-events-none absolute bottom-4 sm:bottom-6 h-8 w-44 sm:w-64 rounded-full bg-black/15 blur-xl dark:bg-black/70 transition-all duration-300 ${
            isActive ? 'scale-105 opacity-90' : 'scale-100 opacity-60'
          }`}
          aria-hidden="true"
        />

        {/* Visor / Memory Scan Ambient Glow (Active on Mouse Hover) */}
        <div
          className={`pointer-events-none absolute top-12 sm:top-16 size-48 sm:size-56 rounded-full blur-2xl transition-opacity duration-500 ${
            isActive
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
            className={`h-auto w-full object-contain pointer-events-none transition-all duration-300 drop-shadow-[0_18px_24px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)] ${
              isActive ? 'scale-[1.02]' : 'scale-100'
            }`}
            loading="eager"
          />


        </div>

        {/* 
          Pinned 1px Hairline Leader-Lines:
          Visible across all viewports (mobile & desktop).
          Ripples with an active green highlight on mouse hover.
        */}

        {/* Leader-Line 1 (Top Left): Visor -> Tatum Checkpoint */}
        <div className="pointer-events-none absolute top-[16%] left-0 sm:-left-6 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="flex flex-col items-end">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isActive ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              <span className="live-dot" aria-hidden /> Live on Sui
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">block {ckpt}</span>
          </div>
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute right-0 top-[-2px] size-1 sm:size-1.5 rounded-full transition-colors ${
                isActive ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
        </div>

        {/* Leader-Line 2 (Bottom Left): Recall Core -> Walrus Recall Latency */}
        <div className="pointer-events-none absolute bottom-[26%] left-0 sm:-left-4 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="flex flex-col items-end">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isActive ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              Checks in &lt;1s
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">before you trade</span>
          </div>
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute right-0 top-[-2px] size-1 sm:size-1.5 rounded-full transition-colors ${
                isActive ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
        </div>

        {/* Leader-Line 3 (Top Right): Visor / Tusk -> Memory Blob Hash */}
        <div className="pointer-events-none absolute top-[18%] right-0 sm:-right-6 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute left-0 top-[-2px] size-1.5 rounded-full transition-colors ${
                isActive ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
          <div className="flex flex-col items-start">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isActive ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              6 past blowups
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">remembered</span>
          </div>
        </div>

        {/* Leader-Line 4 (Bottom Right): Base / Core -> Brier Calibration Delta */}
        <div className="pointer-events-none absolute bottom-[24%] right-0 sm:-right-4 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div
              className={`absolute left-0 top-[-2px] size-1.5 rounded-full transition-colors ${
                isActive ? 'bg-pos shadow-[0_0_6px_#4cc38a]' : 'bg-fg'
              }`}
            />
          </div>
          <div className="flex flex-col items-start">
            <span
              className={`keycap text-[9px] sm:text-xs transition-colors duration-200 ${
                isActive ? 'border-pos text-pos shadow-[0_0_8px_rgba(76,195,138,0.3)]' : ''
              }`}
            >
              74% less overconfident
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-pos">vs. no memory · backtest</span>
          </div>
        </div>
      </div>

      {/* Single Definitive Identity Badge & Protocol Mandate (Active on Mouse Hover) */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono backdrop-blur-sm transition-all duration-200 ${
            isActive
              ? 'border-pos bg-pos/15 text-pos shadow-[0_0_12px_rgba(76,195,138,0.25)]'
              : 'border-line bg-raised/80 text-fg'
          }`}
        >
          <span
            className={`size-2 rounded-full transition-colors ${
              isActive ? 'bg-pos animate-ping' : 'bg-pos'
            }`}
          />
          <span className="font-medium">
            {isActive ? 'Watching' : WALLY_SENTINEL.name}
          </span>
          <span className="text-fg-3">·</span>
          <span className={isActive ? 'text-pos' : 'text-fg-2'}>
            {isActive ? 'Memory on' : WALLY_SENTINEL.title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-fg-3 tracking-tight">
          {WALLY_SENTINEL.subtitle}
        </span>
      </div>
    </div>
  );
};
