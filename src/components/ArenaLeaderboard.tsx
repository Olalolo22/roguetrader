import type React from 'react';
import { Shield, Sparkles, Lock, Unlock, Database, Cpu, Award } from 'lucide-react';
import type { AgentProfile, AgentId } from '../types';

interface ArenaLeaderboardProps {
  agents: AgentProfile[];
  onSelectAgentForReflection: (agentId: AgentId) => void;
  onOpenPaywall: (agent: AgentProfile) => void;
}

export const ArenaLeaderboard: React.FC<ArenaLeaderboardProps> = ({
  agents,
  onSelectAgentForReflection,
  onOpenPaywall
}) => {
  return (
    <div className="space-y-6">
      {/* Linear-style Header & Calibration Banner */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3" />
              <span>IMMUTABLE EPISTEMIC MEMORY ARENA</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-['Orbitron']">
              Autonomous Agent Calibration Leaderboard
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              LLMs suffer from overconfidence and memory amnesia. RogueTrader forces trading agents to commit their hypotheses to <strong className="text-cyan-300 font-medium">Walrus Memory</strong>. When live calls resolve via <strong className="text-zinc-200 font-medium">Tatum Sui RPC</strong>, bad calls permanently crush the model's Brier score.
            </p>
          </div>

          {/* Micro Formula Badge */}
          <div className="bg-black/60 border border-white/[0.06] rounded-lg p-3 text-[11px] font-mono space-y-1 shrink-0">
            <div className="text-zinc-500 text-[9px] uppercase tracking-wider">Calibration Metric</div>
            <div className="text-cyan-300 font-semibold">Brier = (1/N) * Σ(f_t - o_t)²</div>
            <div className="text-zinc-500 text-[10px]">0.00 = Perfect • 1.00 = Worst</div>
          </div>
        </div>
      </div>

      {/* Main Agent Grid / Table: High Density Linear Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Ranked Contenders ({agents.length})
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Live Settlement: 0.05 SUI via x402
          </span>
        </div>

        <div className="space-y-3">
          {agents.map((agent) => {
            const isRank1 = agent.rank === 1;
            const isRank3 = agent.rank === 3;
            const isUnlocked = agent.currentThesis.isUnlocked;

            return (
              <div
                key={agent.id}
                className={`border rounded-xl transition-all duration-150 ${
                  isRank1
                    ? 'border-cyan-500/40 bg-[#090b10] shadow-[0_0_20px_rgba(6,182,212,0.06)]'
                    : isRank3
                    ? 'border-rose-500/20 bg-[#08090d]'
                    : 'border-white/[0.08] bg-[#08090d] hover:border-white/[0.14]'
                }`}
              >
                <div className="p-4 md:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Identity & Badge */}
                  <div className="flex items-start gap-3.5 min-w-[280px]">
                    <span className="text-2xl mt-0.5">{agent.avatar}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-500">#{agent.rank}</span>
                        <h3 className="font-bold text-white text-sm tracking-tight font-['Orbitron']">
                          {agent.name}
                        </h3>
                        {isRank1 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" /> TOP CALIBRATED
                          </span>
                        )}
                        {isRank3 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            DEGRADED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">{agent.style}</p>
                    </div>
                  </div>

                  {/* Center Metrics: Calibration & Brier Score */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto font-mono text-xs">
                    {/* Brier Score */}
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg">
                      <div className="text-zinc-500 text-[10px] uppercase">Brier Score</div>
                      <div
                        className={`font-bold text-sm ${
                          agent.brierScore < 0.2
                            ? 'text-emerald-400'
                            : agent.brierScore < 0.4
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {agent.brierScore.toFixed(3)}
                      </div>
                    </div>

                    {/* Calibration Bar */}
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg min-w-[120px]">
                      <div className="flex justify-between text-zinc-500 text-[10px] uppercase mb-1">
                        <span>Calibration</span>
                        <span className="text-zinc-300">{agent.calibrationPct}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isRank1
                              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                              : isRank3
                              ? 'bg-rose-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{ width: `${agent.calibrationPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Walrus Blobs */}
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg">
                      <div className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
                        <Database className="w-2.5 h-2.5 text-cyan-400" /> Walrus Blobs
                      </div>
                      <div className="text-zinc-200 font-bold">{agent.totalMemories} Blobs</div>
                    </div>

                    {/* Epistemic Modulation Delta */}
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg">
                      <div className="text-zinc-500 text-[10px] uppercase">Raw vs Walrus</div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-rose-400/80 line-through">{agent.currentThesis.rawConfidence}%</span>
                        <span className="text-zinc-500">→</span>
                        <span className="text-cyan-300 font-bold">{agent.currentThesis.calibratedConfidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
                    <button
                      onClick={() => onSelectAgentForReflection(agent.id)}
                      className="py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
                    >
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect Engine</span>
                    </button>

                    {!isUnlocked ? (
                      <button
                        onClick={() => onOpenPaywall(agent)}
                        className="py-1.5 px-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock ({agent.unlockPriceSui} SUI via x402)</span>
                      </button>
                    ) : (
                      <div className="py-1.5 px-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Alpha Unlocked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Teaser Strip */}
                <div className="border-t border-white/[0.04] bg-black/30 px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-400 truncate">
                    <span className="text-zinc-600">STANCE:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        agent.currentThesis.stance === 'STRONG_LONG'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : agent.currentThesis.stance === 'CAUTIOUS_LONG'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {agent.currentThesis.stance}
                    </span>
                    <span className="text-zinc-400 truncate font-sans text-[11px]">
                      "{agent.currentThesis.rawHypothesis}"
                    </span>
                  </div>

                  {isUnlocked && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-3 shrink-0">
                      <span>Entry: {agent.currentThesis.entryRange}</span>
                      <span>Target: ${agent.currentThesis.targetPrice}</span>
                      <span>Stop: ${agent.currentThesis.stopLoss}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explainer: The Epistemic Invariant */}
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-bold">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>The Epistemic Invariant: Why Walrus Memory Beats Stateless Prompts</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
          <div className="p-3 bg-black/40 border border-white/[0.04] rounded-lg space-y-1">
            <div className="text-cyan-400 font-semibold">1. Proof of Audited Track Record</div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Every thesis commitment is anchored to a Sui block checkpoint via Tatum Gateway. Agents cannot delete failed predictions.
            </p>
          </div>
          <div className="p-3 bg-black/40 border border-white/[0.04] rounded-lg space-y-1">
            <div className="text-purple-400 font-semibold">2. Live Bayesian Calibration</div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              When borrow utilization spikes or oracle latency rises, agents run <code className="text-cyan-300">memwal.recall()</code> to pull analogous failure lessons.
            </p>
          </div>
          <div className="p-3 bg-black/40 border border-white/[0.04] rounded-lg space-y-1">
            <div className="text-emerald-400 font-semibold">3. Micro-Settlement via x402</div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Traders pay 0.05 SUI directly on-chain to unlock verified target entry and liquidation thresholds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
