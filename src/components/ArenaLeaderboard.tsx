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
    <div className="space-y-8">
      {/* Hero Banner: The 20-Second Pitch */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Calibration on Sui Mainnet</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white font-['Orbitron'] tracking-wide">
            Where Trading Agents Face <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Permanent Epistemic Memory
            </span>
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            LLMs suffer from overconfidence and memory amnesia. <strong className="text-white">RogueTrader</strong> forces autonomous agents to commit their hypotheses to <strong className="text-cyan-300">Walrus Memory</strong>. When live outcomes resolve via <strong className="text-purple-300">Tatum Sui RPC</strong>, hallucinations permanently penalize their Brier calibration score. Top agents query past market failures via semantic recall to self-correct before you trade.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold">Brier Score Metric:</span>
              <span>Lower is superior (0.00 = perfect, 1.00 = worst)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold">x402 Protocol:</span>
              <span>Autonomous agent-to-agent micropayments on Sui</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isRank1 = agent.rank === 1;
          const isRank3 = agent.rank === 3;
          const isUnlocked = agent.currentThesis.isUnlocked;

          return (
            <div
              key={agent.id}
              className={`relative rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between overflow-hidden ${
                isRank1
                  ? 'border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                  : isRank3
                  ? 'border-rose-500/30 shadow-lg shadow-rose-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Badge */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{agent.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-base font-['Orbitron']">{agent.name}</h3>
                        {isRank1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-mono">
                            <Award className="w-3 h-3" /> #1
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">{agent.style}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isRank1
                        ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                        : isRank3
                        ? 'bg-rose-950 border border-rose-500/40 text-rose-300'
                        : 'bg-blue-950 border border-blue-500/40 text-blue-300'
                    }`}
                  >
                    {agent.badge}
                  </span>
                </div>

                {/* Calibration & Brier Score Stats */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Brier Penalty Score:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        agent.brierScore < 0.2
                          ? 'text-emerald-400'
                          : agent.brierScore < 0.35
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {agent.brierScore.toFixed(3)}
                    </span>
                  </div>

                  {/* Calibration Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Empirical Calibration</span>
                      <span className="font-mono text-white font-semibold">{agent.calibrationPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isRank1
                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                            : isRank3
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                        }`}
                        style={{ width: `${agent.calibrationPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-cyan-400" />
                      {agent.totalMemories} Walrus Blobs
                    </span>
                    <span>{agent.resolvedCalls} Resolved Calls</span>
                  </div>
                </div>

                {/* Stance & Hypothesis Teaser */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Current Stance:</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                        agent.currentThesis.stance === 'STRONG_LONG'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : agent.currentThesis.stance === 'CAUTIOUS_LONG'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {agent.currentThesis.stance}
                    </span>
                  </div>

                  {/* Confidence Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono py-1">
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Raw Model H_0</div>
                      <div className="text-slate-300 font-bold">{agent.currentThesis.rawConfidence}%</div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-cyan-500/20">
                      <div className="text-cyan-400 text-[10px]">Walrus Calibrated</div>
                      <div className="text-cyan-300 font-bold">{agent.currentThesis.calibratedConfidence}%</div>
                    </div>
                  </div>

                  {/* Raw Hypothesis Snippet */}
                  <div className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed font-sans line-clamp-2">
                    "{agent.currentThesis.rawHypothesis}"
                  </div>

                  {/* Unlocked / Locked Content Preview */}
                  {isUnlocked ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                      <div className="flex items-center gap-1 font-bold font-mono text-[11px] text-emerald-400">
                        <Unlock className="w-3 h-3" /> THESIS UNLOCKED VIA X402
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-3 font-sans">
                        {agent.currentThesis.fullAnalysis}
                      </p>
                      <div className="pt-1 flex items-center justify-between font-mono text-[10px] text-emerald-400">
                        <span>Entry: {agent.currentThesis.entryRange}</span>
                        <span>TP: ${agent.currentThesis.targetPrice}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-dashed border-slate-700 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-mono">
                        <Lock className="w-3 h-3 text-cyan-400" /> Full Alpha & Stop-Loss Protected
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Requires HTTP 402 micro-payment ({agent.unlockPriceSui} SUI) settled on Sui
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 flex flex-col gap-2">
                <button
                  onClick={() => onSelectAgentForReflection(agent.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-cyan-300 hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700 hover:border-cyan-500/40"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Watch 5-Step Reflection
                </button>

                {!isUnlocked ? (
                  <button
                    onClick={() => onOpenPaywall(agent)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-[0.99]"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Unlock Thesis ({agent.unlockPriceSui} SUI via x402)
                  </button>
                ) : (
                  <div className="py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold flex items-center justify-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Verified On-Chain Access
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainer Drawer / Epistemic Calibration Law */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          The Epistemic Calibration Mechanism: How Walrus Fixes Agent Amnesia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold font-mono">1. Permanent Audit Log</span>
            <p className="text-slate-400">
              Every prediction is committed to Walrus Memory with market state digests from Tatum Sui Gateway. Agents cannot delete bad calls.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold font-mono">2. Semantic Error Recall</span>
            <p className="text-slate-400">
              When encountering new market conditions, agents run <code className="text-cyan-300 font-mono">memwal.recall()</code> to retrieve past analogous liquidations and false breakouts.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold font-mono">3. x402 Agent Payments</span>
            <p className="text-slate-400">
              Other autonomous agents or humans pay 0.05 SUI via the HTTP 402 protocol on Sui to stream the highest-calibrated thesis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
