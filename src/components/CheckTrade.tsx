import React, { useState } from 'react';
import type { TatumMarketState } from '../types';
import { LivingGlyphMascot } from './LivingGlyphMascot';
import { RuledBentoGrid } from './RuledBentoGrid';

interface CheckTradeProps {
  marketState: TatumMarketState | null;
}

export const CheckTrade: React.FC<CheckTradeProps> = ({ marketState }) => {
  const [interceptActive, setInterceptActive] = useState(false);

  return (
    <div className="space-y-10 sm:space-y-14 pt-4 sm:pt-8">
      {/* Hero: Asymmetrical Split — Story & Headline on Left, Living Glyph Mascot on Right */}
      <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1 text-xs font-mono text-fg-2">
            <span className="size-2 rounded-full bg-pos animate-pulse" />
            <span>Walrus Memory Vault · Pre-Trade Risk Gate</span>
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-5xl sm:leading-[1.12]">
            Every rogue trader had the same problem.{' '}
            <span className="text-fg-2">Nobody remembered the last blowup.</span>
          </h1>

          <p className="max-w-xl text-base text-fg-2 sm:text-lg leading-relaxed">
            Rogue traders don't lose capital because they lack charts. They lose because nothing stops them from repeating yesterday's liquidation trap. RogueTrader checks your order against Walrus memory before sizing.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-fg-3">
            <span className="flex items-center gap-1.5">
              <span className="text-fg font-medium">914 ms</span> Pre-Trade Recall
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-pos font-medium">-72.6%</span> Brier Error Delta
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-fg font-medium">0.05 SUI</span> x402 Rate
            </span>
          </div>
        </div>

        {/* Right Column: The Living Glyph Mascot with Pinned Callouts */}
        <div className="lg:col-span-5 flex justify-center">
          <LivingGlyphMascot
            marketState={marketState}
            interceptActive={interceptActive}
          />
        </div>
      </section>

      {/* Main Execution Surface: The Precision Ruled Bento Grid */}
      <section aria-label="Execution Cockpit and Risk Gate">
        <RuledBentoGrid
          marketState={marketState}
          onInterceptChange={(active) => setInterceptActive(active)}
        />
      </section>
    </div>
  );
};
