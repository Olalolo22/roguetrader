import React, { useState, useEffect } from 'react';
import type { TatumMarketState } from '../types';

export type SentinelRole = 'recon' | 'guardian' | 'archivist';

interface LivingGlyphMascotProps {
  marketState: TatumMarketState | null;
  interceptActive?: boolean;
  theme?: 'dark' | 'light';
  activeRole?: SentinelRole;
  onRoleSelect?: (role: SentinelRole) => void;
}

interface RoleDefinition {
  id: SentinelRole;
  label: string;
  subsystem: string;
  tagline: string;
  darkSrc: string;
  lightSrc: string;
  alt: string;
  leaderLines: {
    topLeft: { tag: string; value: string; sub: string };
    bottomLeft: { tag: string; value: string; sub: string };
    topRight: { tag: string; value: string; sub: string };
    bottomRight: { tag: string; value: string; sub: string; highlight?: boolean };
  };
}

const ROLES: Record<SentinelRole, RoleDefinition> = {
  recon: {
    id: 'recon',
    label: '01 · Recon',
    subsystem: 'Sui Node Telemetry',
    tagline: 'Perimeter Mempool & Checkpoint Monitor',
    darkSrc: '/mascot/walrus-sentinel-1.png',
    lightSrc: '/mascot/walrus-sentinel-light-2.png',
    alt: 'Wally Recon Sentinel — Sleek graphite walrus monitoring Sui network checkpoints',
    leaderLines: {
      topLeft: { tag: 'ckpt', value: '#100,185,039', sub: 'Tatum Sui Gateway' },
      bottomLeft: { tag: 'pool', value: '$24.8M', sub: 'Cetus TVL Depth' },
      topRight: { tag: 'spread', value: '0.0008 SUI', sub: 'DeepBook v3 Spread' },
      bottomRight: { tag: 'latency', value: '38ms', sub: 'RPC ping time' },
    },
  },
  guardian: {
    id: 'guardian',
    label: '02 · Guardian',
    subsystem: 'Pre-Trade Risk Gate',
    tagline: 'Active Memory Intercept & Strike Sizer',
    darkSrc: '/mascot/walrus-sentinel-2.png',
    lightSrc: '/mascot/walrus-sentinel-light-1.png',
    alt: 'Wally Guardian Sentinel — Active cyber visor and chest memory reactor core',
    leaderLines: {
      topLeft: { tag: 'ckpt', value: '#100,185,039', sub: 'Resolution Check' },
      bottomLeft: { tag: 'recall', value: '<1s', sub: 'Walrus Vector' },
      topRight: { tag: 'blob', value: '0x8f9a…2c', sub: 'Walrus Epoch #41' },
      bottomRight: { tag: 'brier', value: '0.128', sub: 'seeded bench', highlight: true },
    },
  },
  archivist: {
    id: 'archivist',
    label: '03 · Archivist',
    subsystem: 'Walrus Memory Vault',
    tagline: 'Encrypted Blob Storage & Proofs',
    darkSrc: '/mascot/walrus-sentinel-3.png',
    lightSrc: '/mascot/walrus-sentinel-3.png',
    alt: 'Wally Archivist Sentinel — Holding glowing frosted memory storage cube',
    leaderLines: {
      topLeft: { tag: 'store', value: 'Walrus', sub: 'Decentralized Blobs' },
      bottomLeft: { tag: 'cost', value: '0.05 SUI', sub: 'x402 Micropayment' },
      topRight: { tag: 'seal', value: 'Epoch #41', sub: 'Relayer Certified' },
      bottomRight: { tag: 'status', value: 'Persistent', sub: 'Zero Amnesia', highlight: true },
    },
  },
};

export const LivingGlyphMascot: React.FC<LivingGlyphMascotProps> = ({
  marketState,
  interceptActive = false,
  theme = 'dark',
  activeRole: controlledRole,
  onRoleSelect,
}) => {
  // Option B: Automatically driven by app state (Intercept -> Guardian; Idle -> Recon)
  const [internalRole, setInternalRole] = useState<SentinelRole>('recon');

  useEffect(() => {
    if (controlledRole) {
      setInternalRole(controlledRole);
    } else if (interceptActive) {
      setInternalRole('guardian');
    }
  }, [controlledRole, interceptActive]);

  const role = ROLES[internalRole];
  const isLight = theme === 'light';
  const currentSrc = isLight ? role.lightSrc : role.darkSrc;

  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#100,185,039';

  const handleSelect = (r: SentinelRole) => {
    setInternalRole(r);
    onRoleSelect?.(r);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center justify-center select-none pt-2 sm:pt-4">
      {/* 
        OPTION B: State-Driven Operational Sentinel
        - No avatar wardrobe. Roles reflect real protocol states:
          01 · Recon (Sui Telemetry) | 02 · Guardian (Risk Gate) | 03 · Archivist (Walrus Vault)
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

        {/* The Native Mascot Render (True Transparent PNG with Pose Cross-Fade) */}
        <div className="relative z-10 w-full max-w-[280px] sm:max-w-[340px]">
          <img
            key={`${role.id}-${theme}`}
            src={currentSrc}
            alt={role.alt}
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
          Visible across all viewports (mobile & desktop).
          Adapts dynamically to the active role (Recon / Guardian / Archivist).
        */}

        {/* Leader-Line 1 (Top Left) */}
        <div className="pointer-events-none absolute top-[16%] left-0 sm:-left-6 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="flex flex-col items-end">
            <span className="keycap text-[9px] sm:text-xs">
              <span>{role.leaderLines.topLeft.tag}</span>{' '}
              {role.leaderLines.topLeft.tag === 'ckpt' ? ckpt : role.leaderLines.topLeft.value}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">{role.leaderLines.topLeft.sub}</span>
          </div>
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div className="absolute right-0 top-[-2px] size-1 sm:size-1.5 rounded-full bg-fg" />
          </div>
        </div>

        {/* Leader-Line 2 (Bottom Left) */}
        <div className="pointer-events-none absolute bottom-[26%] left-0 sm:-left-4 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="flex flex-col items-end">
            <span className="keycap text-[9px] sm:text-xs">
              <span>{role.leaderLines.bottomLeft.tag}</span> {role.leaderLines.bottomLeft.value}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">{role.leaderLines.bottomLeft.sub}</span>
          </div>
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div className="absolute right-0 top-[-2px] size-1 sm:size-1.5 rounded-full bg-fg" />
          </div>
        </div>

        {/* Leader-Line 3 (Top Right) */}
        <div className="pointer-events-none absolute top-[18%] right-0 sm:-right-6 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div className="absolute left-0 top-[-2px] size-1 sm:size-1.5 rounded-full bg-fg" />
          </div>
          <div className="flex flex-col items-start">
            <span className="keycap text-[9px] sm:text-xs">
              <span>{role.leaderLines.topRight.tag}</span> {role.leaderLines.topRight.value}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-fg-3">{role.leaderLines.topRight.sub}</span>
          </div>
        </div>

        {/* Leader-Line 4 (Bottom Right) */}
        <div className="pointer-events-none absolute bottom-[24%] right-0 sm:-right-4 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300">
          <div className="relative h-[1px] w-3 sm:w-8 bg-line-2">
            <div className="absolute left-0 top-[-2px] size-1 sm:size-1.5 rounded-full bg-fg" />
          </div>
          <div className="flex flex-col items-start">
            <span className="keycap text-[9px] sm:text-xs">
              <span>{role.leaderLines.bottomRight.tag}</span> {role.leaderLines.bottomRight.value}
            </span>
            <span
              className={`text-[8px] sm:text-[9px] font-mono ${
                role.leaderLines.bottomRight.highlight ? 'text-pos' : 'text-fg-3'
              }`}
            >
              {role.leaderLines.bottomRight.sub}
            </span>
          </div>
        </div>
      </div>

      {/* State-Driven Operational HUD Status Bar */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised/80 px-3 py-1 text-xs font-mono backdrop-blur-sm">
          <span
            className={`size-2 rounded-full transition-colors ${
              interceptActive ? 'bg-pos animate-pulse' : 'bg-pos'
            }`}
          />
          <span className="text-fg font-medium">Wally</span>
          <span className="text-fg-3">·</span>
          <span className="text-fg-2">{role.subsystem}</span>
        </div>

        {/* Architecture Role Inspector: Click to inspect the 3 autonomous pillars */}
        <div className="flex items-center gap-1">
          {(['recon', 'guardian', 'archivist'] as SentinelRole[]).map((r) => {
            const def = ROLES[r];
            const isSelected = r === internalRole;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleSelect(r)}
                className={`rounded-md border px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-line-2 bg-raised text-fg font-medium shadow-xs'
                    : 'border-transparent text-fg-3 hover:border-line hover:text-fg-2'
                }`}
              >
                {def.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
