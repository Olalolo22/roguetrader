import React, { useState } from 'react';
import type { TatumMarketState } from '../types';

interface LivingGlyphMascotProps {
  marketState: TatumMarketState | null;
  interceptActive?: boolean;
}

interface SentinelVariant {
  id: string;
  name: string;
  role: string;
  src: string;
  alt: string;
}

const SENTINEL_VARIANTS: SentinelVariant[] = [
  {
    id: 'guardian',
    name: 'Sentinel 02',
    role: 'Active Guardian',
    src: '/mascot/walrus-sentinel-2.png',
    alt: 'Wally Sentinel Guardian — Matte graphite walrus with cyber visor and chest memory node',
  },
  {
    id: 'recon',
    name: 'Sentinel 01',
    role: 'Perimeter Recon',
    src: '/mascot/walrus-sentinel-1.png',
    alt: 'Wally Sentinel Recon — Sleek graphite walrus with brushed titanium cyber visor',
  },
  {
    id: 'archivist',
    name: 'Sentinel 03',
    role: 'Memory Archivist',
    src: '/mascot/walrus-sentinel-3.png',
    alt: 'Wally Sentinel Archivist — Holding glowing frosted memory storage cube',
  },
];

export const LivingGlyphMascot: React.FC<LivingGlyphMascotProps> = ({
  marketState,
  interceptActive = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const currentSentinel = SENTINEL_VARIANTS[selectedIdx];

  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#89,412,950';

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] flex-col items-center justify-center select-none pt-2 sm:pt-4">
      {/* 
        NO Bounding Box or Picture Frame:
        Wally sits directly on the page background with physical contact ground shadows.
      */}
      <div className="relative flex w-full items-center justify-center">
        {/* Soft Ambient Ground Plane Contact Shadow */}
        <div
          className="pointer-events-none absolute bottom-4 sm:bottom-6 h-8 w-48 sm:w-64 rounded-full bg-black/20 blur-xl dark:bg-black/70 transition-all duration-300"
          aria-hidden="true"
        />

        {/* Visor / Memory Scan Ambient Glow (when Intercept is active) */}
        <div
          className={`pointer-events-none absolute top-12 sm:top-16 size-48 sm:size-56 rounded-full blur-2xl transition-opacity duration-700 ${
            interceptActive
              ? 'bg-pos/25 opacity-100'
              : 'bg-fg/5 opacity-40 dark:bg-white/5'
          }`}
          aria-hidden="true"
        />

        {/* The Transparent Cutout 3D Mascot */}
        <div className="relative z-10 w-full max-w-[320px] sm:max-w-[350px]">
          <img
            key={currentSentinel.id}
            src={currentSentinel.src}
            alt={currentSentinel.alt}
            className="h-auto w-full object-contain drop-shadow-[0_20px_24px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)] transition-all duration-300"
            loading="eager"
          />
        </div>

        {/* Pinned 1px Hairline Leader-Line 1 (Top Left): Visor -> Tatum Checkpoint */}
        <div className="pointer-events-none absolute top-[16%] left-0 sm:-left-4 z-20 flex items-center gap-1.5">
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

        {/* Pinned 1px Hairline Leader-Line 2 (Bottom Left): Recall Core -> Walrus Recall Latency */}
        <div className="pointer-events-none absolute bottom-[26%] left-0 sm:-left-3 z-20 flex items-center gap-1.5">
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

        {/* Pinned 1px Hairline Leader-Line 3 (Top Right): Visor / Tusk -> Memory Blob Hash */}
        <div className="pointer-events-none absolute top-[18%] right-0 sm:-right-4 z-20 flex items-center gap-1.5">
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

        {/* Pinned 1px Hairline Leader-Line 4 (Bottom Right): Base / Core -> Brier Calibration Delta */}
        <div className="pointer-events-none absolute bottom-[24%] right-0 sm:-right-3 z-20 flex items-center gap-1.5">
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

      {/* Active Sentinel State & Identity Caption */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised/80 px-3 py-1 text-xs font-mono backdrop-blur-sm">
          <span
            className={`size-2 rounded-full transition-colors ${
              interceptActive ? 'bg-pos animate-pulse' : 'bg-pos'
            }`}
          />
          <span className="text-fg font-medium">Wally</span>
          <span className="text-fg-3">·</span>
          <span className="text-fg-2">{currentSentinel.role}</span>
        </div>

        {/* Sentinel Switcher: 3 Studio Render Cutout Options */}
        <div className="flex items-center gap-1">
          {SENTINEL_VARIANTS.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`rounded-md border px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer ${
                idx === selectedIdx
                  ? 'border-line-2 bg-raised text-fg font-medium shadow-xs'
                  : 'border-transparent text-fg-3 hover:border-line hover:text-fg-2'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
