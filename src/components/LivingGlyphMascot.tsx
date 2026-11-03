import React, { useState, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingCount, setPingCount] = useState(0);

  const ckpt = marketState?.latestCheckpoint
    ? `#${marketState.latestCheckpoint.toLocaleString()}`
    : '#100,185,039';

  const isLight = theme === 'light';
  const currentSrc = isLight ? WALLY_SENTINEL.lightSrc : WALLY_SENTINEL.darkSrc;

  // 3D Perspective Tilt on Mouse Movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  // 3D Perspective Tilt on Mobile Touch
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  // Tactile Diagnostic Ping on Tap / Click
  const handlePing = useCallback(() => {
    setIsPinging(true);
    setPingCount((c) => c + 1);
    const timer = setTimeout(() => {
      setIsPinging(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Calculate 3D rotations based on tilt
  const rotY = tilt.x * 12; // deg
  const rotX = -tilt.y * 10; // deg
  const shadowTranslateX = -tilt.x * 14; // inverse shadow translation
  const shadowTranslateY = tilt.y * 6;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handlePing}
      className="relative mx-auto flex w-full max-w-[420px] flex-col items-center justify-center select-none pt-2 sm:pt-4 cursor-pointer perspective-[1000px] group"
    >
      {/* Physical 3D Assembly Stage */}
      <div className="relative flex w-full items-center justify-center">
        {/* Soft Dynamic Contact Ground Plane Shadow (Reacts inversely to 3D tilt) */}
        <div
          style={{
            transform: `translateX(${shadowTranslateX}px) translateY(${shadowTranslateY}px) scale(${
              isHovered ? 0.95 : 1
            })`,
            transition: isHovered
              ? 'transform 120ms ease-out'
              : 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="pointer-events-none absolute bottom-4 sm:bottom-6 h-8 w-44 sm:w-64 rounded-full bg-black/15 blur-xl dark:bg-black/70"
          aria-hidden="true"
        />

        {/* Dynamic Visor / Intercept Ambient Glow */}
        <div
          className={`pointer-events-none absolute top-12 sm:top-16 size-48 sm:size-56 rounded-full blur-2xl transition-opacity duration-700 ${
            interceptActive || isPinging
              ? 'bg-pos/30 opacity-100'
              : 'opacity-0 dark:bg-white/5 dark:opacity-40'
          }`}
          aria-hidden="true"
        />

        {/* 3D Tilted Mascot Layer with Hardware Acceleration */}
        <div
          style={{
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) ${
              isPinging ? 'scale(0.96)' : isHovered ? 'scale(1.02)' : 'scale(1)'
            }`,
            transition: isPinging
              ? 'transform 100ms cubic-bezier(0.16, 1, 0.3, 1)'
              : isHovered
              ? 'transform 100ms ease-out'
              : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="relative z-10 w-full max-w-[250px] sm:max-w-[340px] will-change-transform"
        >
          {/* Base 3D Studio Render (True Transparent PNG) */}
          <img
            key={`wally-${theme}`}
            src={currentSrc}
            alt={WALLY_SENTINEL.alt}
            className={`h-auto w-full object-contain pointer-events-none transition-all duration-300 ${
              isLight
                ? 'drop-shadow-[0_18px_24px_rgba(0,0,0,0.12)]'
                : 'drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]'
            }`}
            loading="eager"
          />

          {/* 
            Interactive Overlay 1: Cyber Visor Laser Scanning Beam
            Positioned over Wally's visor glass with horizontal radar sweep
          */}
          <div
            className="pointer-events-none absolute top-[21%] left-[45%] w-[27%] h-[7%] overflow-hidden rounded-full mix-blend-screen opacity-75 dark:opacity-90"
            style={{ transform: 'rotate(-4deg)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-visor-scan w-[60%] blur-[1px]" />
          </div>

          {/* 
            Interactive Overlay 2: Chest Memory Reactor Node Core
            Ambient breathing pulse + Expanding shockwave on tap/click
          */}
          <div
            className="pointer-events-none absolute top-[57%] left-[53.5%] size-6 sm:size-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
          >
            {/* Ambient Breathing Reactor Glow */}
            <div className="absolute inset-0 rounded-full bg-pos/40 blur-md animate-reactor-breathe" />
            <div className="size-2 rounded-full bg-pos/80 shadow-[0_0_8px_#4cc38a]" />

            {/* Expanding Shockwave Ping Ring on Click / Tap */}
            {isPinging && (
              <div
                key={pingCount}
                className="absolute inset-0 rounded-full border-2 border-pos/80 animate-ping-ring pointer-events-none"
              />
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

      {/* Option 3: Interactive Identity Badge & Tactile Status Readout */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono backdrop-blur-sm transition-all duration-200 ${
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
        <p className="text-[9px] font-mono text-fg-3/60 tracking-wider pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          [ hover or tap Wally to calibrate telemetry ]
        </p>
      </div>
    </div>
  );
};
