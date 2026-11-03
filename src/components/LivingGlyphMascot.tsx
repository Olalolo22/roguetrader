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
    src: '/mascot/walrus-sentinel-2.jpg',
    alt: 'Wally Sentinel Guardian — 3D matte graphite walrus with cyber visor and chest memory node',
  },
  {
    id: 'recon',
    name: 'Sentinel 01',
    role: 'Perimeter Recon',
    src: '/mascot/walrus-sentinel-1.jpg',
    alt: 'Wally Sentinel Recon — Sleek graphite walrus with brushed titanium cyber visor',
  },
  {
    id: 'archivist',
    name: 'Sentinel 03',
    role: 'Memory Archivist',
    src: '/mascot/walrus-sentinel-3.jpg',
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
    <div className="relative mx-auto flex w-full max-w-[460px] flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Studio Render Frame with Hairline Border and Soft Radial Vignette */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-black shadow-2xl">
        {/* Subtle Ambient Radial Highlight behind the Sentinel */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            interceptActive
              ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(76,195,138,0.12)_0%,rgba(0,0,0,0.8)_70%)]'
              : 'bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.85)_70%)]'
          }`}
        />

        {/* The 3D Studio Sentinel Render */}
        <div className="relative aspect-square w-full">
          <img
            key={currentSentinel.id}
            src={currentSentinel.src}
            alt={currentSentinel.alt}
            className="h-full w-full object-cover transition-opacity duration-300"
            loading="eager"
          />

          {/* Vignette edge-fade so borders blend softly */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-line" />
        </div>

        {/* Pinned Leader-Line 1 (Top Left): Pointing toward Cyber Visor */}
        <div className="pointer-events-none absolute top-[20%] left-3 sm:left-4 z-10 flex items-center gap-1.5">
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

        {/* Pinned Leader-Line 2 (Bottom Left): Pointing toward Walrus Recall Core */}
        <div className="pointer-events-none absolute bottom-[26%] left-3 sm:left-4 z-10 flex items-center gap-1.5">
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

        {/* Pinned Leader-Line 3 (Top Right): Pointing toward Memory Blob State */}
        <div className="pointer-events-none absolute top-[24%] right-3 sm:right-4 z-10 flex items-center gap-1.5">
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

        {/* Pinned Leader-Line 4 (Bottom Right): Pointing toward Brier Calibration */}
        <div className="pointer-events-none absolute bottom-[22%] right-3 sm:right-4 z-10 flex items-center gap-1.5">
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

        {/* Live Intercept Status Bar at Base of Render */}
        <div className="flex items-center justify-between border-t border-line bg-page/90 px-3.5 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors ${
                interceptActive ? 'bg-pos animate-pulse' : 'bg-fg-3'
              }`}
            />
            <span className="font-mono text-xs text-fg">
              Wally · Walrus Memory Sentinel
            </span>
          </div>
          <span className="font-mono text-[11px] text-fg-3">
            {currentSentinel.role}
          </span>
        </div>
      </div>

      {/* Sentinel Switcher: 3 Studio Render Options */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {SENTINEL_VARIANTS.map((v, idx) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`rounded-md border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              idx === selectedIdx
                ? 'border-line-2 bg-raised text-fg'
                : 'border-transparent text-fg-3 hover:border-line hover:text-fg-2'
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
};
