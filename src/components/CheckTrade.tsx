import React from 'react';
import type { TatumMarketState } from '../types';
import { RuledBentoGrid } from './RuledBentoGrid';

interface CheckTradeProps {
  marketState: TatumMarketState | null;
  theme?: 'dark' | 'light';
}

export const CheckTrade: React.FC<CheckTradeProps> = ({ marketState }) => {
  const naviUtil = marketState?.navi.borrowUtilizationPct;
  const naviApr = marketState?.navi.borrowAprPct;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-6 sm:pt-8">
      {/* Compact Above-the-Fold Header */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-medium tracking-tight text-fg sm:text-3xl">
            Pre-Trade Risk Guard
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="keycap">
              <span className="live-dot" aria-hidden />
              <span>SUI</span>
              {marketState ? `$${marketState.suiPrice.toFixed(3)}` : 'loading…'}
            </span>
            <span className="keycap">
              <span>NAVI borrow</span>
              {naviUtil != null ? (
                <span className={marketState?.navi.isOverheated ? 'text-neg font-medium' : 'text-fg'}>
                  {naviUtil.toFixed(1)}%{naviApr != null ? ` · ${naviApr.toFixed(1)}% APR` : ''}
                </span>
              ) : (
                <span className="text-fg-3">
                  {marketState ? 'live feed unavailable' : 'loading…'}
                </span>
              )}
            </span>
          </div>
        </div>
        <p className="text-sm text-fg-2 sm:text-base">
          Enter a trade to check it against past blowups on Walrus Memory, get an adjusted leverage cap, and log real outcomes so future checks adapt.
        </p>
      </section>

      {/* Single-Flow Interactive Guard */}
      <section aria-label="Pre-Trade Risk Check Flow">
        <RuledBentoGrid marketState={marketState} />
      </section>
    </div>
  );
};
