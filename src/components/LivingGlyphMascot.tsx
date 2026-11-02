import React, { useEffect, useRef, useState } from 'react';
import type { TatumMarketState } from '../types';

interface LivingGlyphMascotProps {
  marketState: TatumMarketState | null;
  interceptActive?: boolean;
}

export const LivingGlyphMascot: React.FC<LivingGlyphMascotProps> = ({
  marketState,
  interceptActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps] = useState(8);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal resolution for consistent 8px glyph cells
    const width = 400;
    const height = 360;
    const cell = 8;
    canvas.width = width;
    canvas.height = height;

    const columns = Math.floor(width / cell);
    const rows = Math.floor(height / cell);

    // 1. Draw procedural high-contrast mascot onto an offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = columns;
    offscreen.height = rows;
    const octx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!octx) return;

    // Draw stylized Cyber-Walrus in normalized 0..columns, 0..rows space
    const drawMascotTemplate = (interception: boolean) => {
      octx.clearRect(0, 0, columns, rows);

      // Background is pitch black (0 lightness)
      octx.fillStyle = '#000000';
      octx.fillRect(0, 0, columns, rows);

      // Center coords
      const cx = columns / 2;
      const cy = rows / 2 - 2;

      // Outer Torso / Broad Shoulders
      octx.fillStyle = '#22252a';
      octx.beginPath();
      octx.ellipse(cx, cy + 16, 20, 16, 0, 0, Math.PI * 2);
      octx.fill();

      // Tactical harness straps
      octx.fillStyle = '#444a54';
      octx.fillRect(cx - 14, cy + 6, 4, 18);
      octx.fillRect(cx + 10, cy + 6, 4, 18);

      // Walrus Head / Dome
      octx.fillStyle = '#6b7280';
      octx.beginPath();
      octx.ellipse(cx, cy - 4, 14, 13, 0, 0, Math.PI * 2);
      octx.fill();

      // Cyber Visor across eyes
      octx.fillStyle = interception ? '#4cc38a' : '#ededed';
      octx.beginPath();
      octx.roundRect(cx - 10, cy - 8, 20, 4, 2);
      octx.fill();

      // Headset band & antenna
      octx.fillStyle = '#9ca3af';
      octx.fillRect(cx - 13, cy - 10, 2, 8);
      octx.fillRect(cx - 13, cy - 14, 2, 4);
      octx.fillRect(cx + 11, cy - 10, 2, 8);

      // Muzzle / Snout (Walrus Whiskers Pads)
      octx.fillStyle = '#d1d5db';
      octx.beginPath();
      octx.ellipse(cx - 5, cy + 2, 6, 5, 0, 0, Math.PI * 2);
      octx.ellipse(cx + 5, cy + 2, 6, 5, 0, 0, Math.PI * 2);
      octx.fill();

      // Nose
      octx.fillStyle = '#111317';
      octx.beginPath();
      octx.ellipse(cx, cy, 3, 2, 0, 0, Math.PI * 2);
      octx.fill();

      // Tusks (Iconic Walrus Signature)
      octx.fillStyle = '#ffffff';
      // Left Tusk
      octx.beginPath();
      octx.moveTo(cx - 6, cy + 4);
      octx.lineTo(cx - 8, cy + 18);
      octx.lineTo(cx - 4, cy + 5);
      octx.closePath();
      octx.fill();

      // Right Tusk
      octx.beginPath();
      octx.moveTo(cx + 4, cy + 5);
      octx.lineTo(cx + 8, cy + 18);
      octx.lineTo(cx + 6, cy + 4);
      octx.closePath();
      octx.fill();

      // Memory Core Reactor in Chest
      octx.fillStyle = interception ? '#4cc38a' : '#85858b';
      octx.beginPath();
      octx.arc(cx, cy + 14, 4, 0, Math.PI * 2);
      octx.fill();
    };

    drawMascotTemplate(interceptActive);

    const imgData = octx.getImageData(0, 0, columns, rows).data;
    const chars = '. :17408$%#{}=';
    const cells: { x: number; y: number; light: number; color: string; seed: number }[] = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const i = (y * columns + x) * 4;
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        cells.push({
          x,
          y,
          light,
          color: `rgb(${r},${g},${b})`,
          seed: Math.random(),
        });
      }
    }

    // Prepare glyph atlas for performance (unslop token rule)
    const atlas = document.createElement('canvas');
    atlas.width = cell * chars.length;
    atlas.height = cell;
    const pen = atlas.getContext('2d');
    if (pen) {
      pen.font = `500 ${cell}px "JetBrains Mono", monospace`;
      pen.textAlign = 'center';
      pen.textBaseline = 'middle';
      pen.fillStyle = '#ffffff';
      [...chars].forEach((char, index) => {
        pen.fillText(char, index * cell + cell / 2, cell / 2);
      });
    }

    const tinted = document.createElement('canvas');
    tinted.width = cell;
    tinted.height = cell;
    const tint = tinted.getContext('2d');

    let animationFrameId: number;
    let lastTime = 0;
    let step = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const drawFrame = (curStep: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const c of cells) {
        if (c.light < 0.08) continue;

        // Subtle 8fps shimmer on high-light cells
        const jitter = Math.sin(c.seed * 999 + curStep) > 0.88 ? 1 : 0;
        const charIdx = Math.min(chars.length - 1, Math.floor(c.light * chars.length) + jitter);

        if (tint) {
          tint.globalCompositeOperation = 'copy';
          tint.drawImage(atlas, charIdx * cell, 0, cell, cell, 0, 0, cell, cell);
          tint.globalCompositeOperation = 'source-in';
          tint.fillStyle = c.color;
          tint.fillRect(0, 0, cell, cell);
          ctx.drawImage(tinted, c.x * cell, c.y * cell);
        }
      }
    };

    const renderLoop = (now: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);
      if (!isVisible || now - lastTime < 1000 / fps) return;
      lastTime = now;
      drawFrame(step++);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [fps, interceptActive]);

  const ckpt = marketState?.latestCheckpoint ? `#${marketState.latestCheckpoint.toLocaleString()}` : '#89,412,950';

  return (
    <div className="relative mx-auto flex w-full max-w-[440px] items-center justify-center p-2 sm:p-4 select-none">
      {/* Living Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full max-w-[380px] h-auto object-contain rounded-xl"
        style={{ aspectRatio: '400 / 360' }}
        title="Wally · The Walrus Memory Sentinel"
      />

      {/* Pinned Leader-Line 1: Visor -> Tatum Sui Checkpoint */}
      <div className="pointer-events-none absolute top-[22%] left-[2%] flex items-center gap-1.5 sm:left-[4%]">
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
      <div className="pointer-events-none absolute bottom-[34%] left-[2%] flex items-center gap-1.5 sm:left-[6%]">
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
      <div className="pointer-events-none absolute bottom-[34%] right-[2%] flex items-center gap-1.5 sm:right-[6%]">
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
      <div className="pointer-events-none absolute bottom-[10%] right-[6%] flex items-center gap-1.5 sm:right-[10%]">
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
