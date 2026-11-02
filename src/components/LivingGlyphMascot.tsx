import React from 'react';
import type { TatumMarketState } from '../types';

interface LivingGlyphMascotProps {
  marketState: TatumMarketState | null;
  interceptActive?: boolean;
}

export const LivingGlyphMascot: React.FC<LivingGlyphMascotProps> = ({
  marketState,
  interceptActive = false,
}) => {
  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#89,412,950';

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center p-2 sm:p-4 select-none">
      {/* High-Craft Vector Walrus / Seal Sentinel Mascot */}
      <div className="relative w-full max-w-[340px] flex justify-center items-center py-4">
        <svg
          viewBox="0 0 280 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-md"
        >
          {/* Subtle Ambient Ground Glow */}
          <ellipse cx="140" cy="242" rx="90" ry="12" fill="rgba(255, 255, 255, 0.04)" />

          {/* Lower Body & Tail Curve */}
          <path
            d="M75 220C65 210 50 200 45 185C40 170 48 155 58 148C65 142 75 145 82 152L105 175C118 188 135 198 155 200C185 203 210 185 218 158C222 145 235 142 242 152C248 160 245 172 238 185C225 212 195 232 155 232C122 232 94 227 75 220Z"
            fill="#181a1f"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />

          {/* Main Torso / Chest */}
          <path
            d="M85 180C75 150 78 115 95 90C110 68 135 55 160 62C185 68 202 90 208 118C214 148 210 180 195 205C178 220 152 225 130 220C108 215 92 200 85 180Z"
            fill="#1e222a"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />

          {/* Left Flipper / Arm */}
          <path
            d="M82 155C65 160 50 172 48 188C46 200 55 208 68 206C82 204 98 190 102 178L82 155Z"
            fill="#15171c"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
          />

          {/* Right Flipper / Arm */}
          <path
            d="M205 160C222 165 235 178 238 194C240 206 230 214 218 212C204 210 190 196 186 182L205 160Z"
            fill="#15171c"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
          />

          {/* Head & Neck */}
          <ellipse
            cx="142"
            cy="82"
            rx="46"
            ry="42"
            fill="#262b35"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />

          {/* Walrus Whiskers Pads / Muzzle */}
          <ellipse cx="126" cy="100" rx="20" ry="15" fill="#303744" />
          <ellipse cx="158" cy="100" rx="20" ry="15" fill="#303744" />

          {/* Cute Whisker Dots */}
          <circle cx="118" cy="98" r="1.5" fill="#85858b" />
          <circle cx="124" cy="96" r="1.5" fill="#85858b" />
          <circle cx="122" cy="103" r="1.5" fill="#85858b" />
          <circle cx="166" cy="98" r="1.5" fill="#85858b" />
          <circle cx="160" cy="96" r="1.5" fill="#85858b" />
          <circle cx="162" cy="103" r="1.5" fill="#85858b" />

          {/* Nose */}
          <path
            d="M136 88C136 85 148 85 148 88C148 93 143 96 142 96C141 96 136 93 136 88Z"
            fill="#111317"
          />

          {/* Signature Ivory Tusks */}
          {/* Left Tusk */}
          <path
            d="M120 106C119 116 117 132 114 148C113 152 118 152 120 148C126 136 130 120 131 107L120 106Z"
            fill="#ffffff"
            stroke="#d1d5db"
            strokeWidth="1"
          />
          {/* Right Tusk */}
          <path
            d="M164 106C165 116 167 132 170 148C171 152 166 152 164 148C158 136 154 120 153 107L164 106Z"
            fill="#ffffff"
            stroke="#d1d5db"
            strokeWidth="1"
          />

          {/* Headset Band & Left Antenna */}
          <path
            d="M100 78C100 55 120 44 142 44C164 44 184 55 184 78"
            stroke="#4b5563"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Left Ear Comm Unit */}
          <rect x="94" y="70" width="7" height="16" rx="3.5" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
          <line x1="97" y1="70" x2="97" y2="56" stroke="#9ca3af" strokeWidth="1.5" />
          <circle cx="97" cy="54" r="2.5" fill={interceptActive ? '#4cc38a' : '#ff6b2b'} />

          {/* Right Ear Comm Unit */}
          <rect x="183" y="70" width="7" height="16" rx="3.5" fill="#374151" stroke="#9ca3af" strokeWidth="1" />

          {/* Cyber Visor across eyes */}
          <g>
            <rect
              x="112"
              y="66"
              width="60"
              height="16"
              rx="6"
              fill={interceptActive ? 'rgba(76, 195, 138, 0.18)' : 'rgba(237, 237, 237, 0.12)'}
              stroke={interceptActive ? '#4cc38a' : '#ededed'}
              strokeWidth="1.5"
            />
            {/* Visor Scanline / HUD Glint */}
            <line
              x1="116"
              y1="74"
              x2="168"
              y2="74"
              stroke={interceptActive ? '#4cc38a' : '#ffffff'}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.8"
            />
          </g>

          {/* Chest Tactical Harness & Reactor Core */}
          <path d="M120 145L132 170" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <path d="M164 145L152 170" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          
          {/* Walrus Memory Core Reactor */}
          <circle
            cx="142"
            cy="172"
            r="12"
            fill="#11141a"
            stroke={interceptActive ? '#4cc38a' : 'rgba(255,255,255,0.2)'}
            strokeWidth="1.5"
          />
          <circle
            cx="142"
            cy="172"
            r="6"
            fill={interceptActive ? '#4cc38a' : '#6b7280'}
            className={interceptActive ? 'animate-pulse' : ''}
          />
        </svg>
      </div>

      {/* Pinned Leader-Line 1: Visor -> Tatum Sui Checkpoint */}
      <div className="pointer-events-none absolute top-[24%] left-[2%] flex items-center gap-1.5 sm:left-[4%]">
        <div className="flex flex-col items-end">
          <span className="keycap text-[10px] sm:text-xs">
            <span>ckpt</span> {ckpt}
          </span>
          <span className="text-[9px] font-mono text-fg-3">Tatum Sui RPC</span>
        </div>
        <div className="h-[1px] w-6 sm:w-10 bg-line-2 relative">
          <div className="absolute right-0 top-[-2px] size-1.5 rounded-full bg-fg" />
        </div>
      </div>

      {/* Pinned Leader-Line 2: Left Tusk -> Walrus Recall Latency */}
      <div className="pointer-events-none absolute bottom-[38%] left-[2%] flex items-center gap-1.5 sm:left-[6%]">
        <div className="flex flex-col items-end">
          <span className="keycap text-[10px] sm:text-xs">
            <span>recall</span> 914 ms
          </span>
          <span className="text-[9px] font-mono text-fg-3">Walrus Vector</span>
        </div>
        <div className="h-[1px] w-6 sm:w-12 bg-line-2 relative">
          <div className="absolute right-0 top-[-2px] size-1.5 rounded-full bg-fg" />
        </div>
      </div>

      {/* Pinned Leader-Line 3: Right Tusk -> Stored Blob State */}
      <div className="pointer-events-none absolute bottom-[38%] right-[2%] flex items-center gap-1.5 sm:right-[6%]">
        <div className="h-[1px] w-6 sm:w-12 bg-line-2 relative">
          <div className="absolute left-0 top-[-2px] size-1.5 rounded-full bg-fg" />
        </div>
        <div className="flex flex-col items-start">
          <span className="keycap text-[10px] sm:text-xs">
            <span>blob</span> 0x8f9a…2c
          </span>
          <span className="text-[9px] font-mono text-fg-3">Seeded Backtest</span>
        </div>
      </div>

      {/* Pinned Leader-Line 4: Chest Memory Core -> Brier Score */}
      <div className="pointer-events-none absolute bottom-[14%] right-[6%] flex items-center gap-1.5 sm:right-[10%]">
        <div className="h-[1px] w-8 sm:w-14 bg-line-2 relative">
          <div className="absolute left-0 top-[-2px] size-1.5 rounded-full bg-fg" />
        </div>
        <div className="flex flex-col items-start">
          <span className="keycap text-[10px] sm:text-xs">
            <span>brier</span> 0.128
          </span>
          <span className="text-[9px] font-mono text-pos">-72% error</span>
        </div>
      </div>
    </div>
  );
};
