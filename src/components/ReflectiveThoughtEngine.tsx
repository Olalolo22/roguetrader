import { useState } from 'react';
import type React from 'react';
import { Play, CheckCircle2, Database, Terminal, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { AgentProfile, AgentId, WalrusMemoryItem } from '../types';
import { agentEngine } from '../services/agentEngine';

interface ReflectiveThoughtEngineProps {
  agents: AgentProfile[];
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  onPaywallClick: (agent: AgentProfile) => void;
}

interface StepState {
  index: number;
  title: string;
  subtitle: string;
  status: 'pending' | 'running' | 'completed';
  detail?: any;
}

export const ReflectiveThoughtEngine: React.FC<ReflectiveThoughtEngineProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onPaywallClick
}) => {
  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [retrievedMemories, setRetrievedMemories] = useState<WalrusMemoryItem[]>([]);

  const initialSteps: StepState[] = [
    {
      index: 1,
      title: '1. Tatum Sui RPC Observation',
      subtitle: 'Query live Sui mainnet state, checkpoint, and Cetus pool liquidity',
      status: 'pending'
    },
    {
      index: 2,
      title: '2. Uncalibrated Hypothesis H_0',
      subtitle: 'Raw LLM model forms initial trade stance without error memory',
      status: 'pending'
    },
    {
      index: 3,
      title: '3. Walrus Semantic Recall',
      subtitle: 'memwal.recall() searches Mainnet for analogous past liquidation failure cases',
      status: 'pending'
    },
    {
      index: 4,
      title: '4. Epistemic Confidence Modulation',
      subtitle: 'Bayesian update penalizes hallucinated confidence based on error history',
      status: 'pending'
    },
    {
      index: 5,
      title: '5. Walrus Memory Mainnet Commit',
      subtitle: 'Write audited decision blob to Walrus Memory relayer for immutable tracking',
      status: 'pending'
    }
  ];

  const [steps, setSteps] = useState<StepState[]>(initialSteps);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleRunReflection = async () => {
    setIsRunning(true);
    setLogs([]);
    setRetrievedMemories([]);

    // Reset steps
    setSteps(initialSteps.map(s => ({ ...s, status: 'pending' })));

    addLog(`Initiating epistemic calibration loop for ${currentAgent.name}...`);

    try {
      await agentEngine.runReflectiveThought(currentAgent.id, (stepIndex, description, detail) => {
        addLog(`Step ${stepIndex}: ${description}`);

        setSteps(prev =>
          prev.map(s => {
            if (s.index < stepIndex) return { ...s, status: 'completed' };
            if (s.index === stepIndex) return { ...s, status: 'running', detail };
            return { ...s, status: 'pending' };
          })
        );

        if (stepIndex === 3 && currentAgent.currentThesis.retrievedMemories) {
          setRetrievedMemories(currentAgent.currentThesis.retrievedMemories);
        }
      });

      // Mark all completed
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
      addLog(`✓ Epistemic calibration cycle complete. Calibrated confidence settled at ${currentAgent.currentThesis.calibratedConfidence}%.`);
      addLog(`✓ Blob committed to Walrus Memory (Relayer Hash: ${currentAgent.currentThesis.walrusBlobHash}).`);
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-xl font-bold text-white font-['Orbitron']">
              Epistemic Reflection Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Witness how <span className="text-cyan-300">Walrus Memory</span> intercepts raw model overconfidence to prevent catastrophic liquidations.
          </p>
        </div>

        {/* Agent Switcher Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => {
                if (!isRunning) onSelectAgent(a.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                selectedAgentId === a.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{a.avatar}</span>
              <span>{a.name}</span>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunReflection}
          disabled={isRunning}
          className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
            isRunning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Calibrating in Real-Time...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Epistemic Reflection Loop</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Steps Timeline vs Interactive Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Steps Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-3">
            {steps.map(step => {
              const isCurrent = step.status === 'running';
              const isDone = step.status === 'completed';

              return (
                <div
                  key={step.index}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : isDone
                      ? 'bg-slate-950/90 border-slate-800/90'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold mt-0.5 ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-cyan-500 text-black animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.index}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                          {step.title}
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 animate-pulse">
                              RUNNING
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{step.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-xs font-mono">
                      {isDone && <span className="text-emerald-400">PASSED</span>}
                      {isCurrent && <span className="text-cyan-400">EXECUTING</span>}
                      {step.status === 'pending' && <span className="text-slate-600">WAITING</span>}
                    </div>
                  </div>

                  {/* Step Specific Details Rendering */}
                  {step.index === 2 && (isCurrent || isDone) && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="text-slate-400 font-mono text-[11px]">Uncalibrated Stance:</div>
                      <div className="text-amber-300 font-semibold italic">"{currentAgent.currentThesis.rawHypothesis}"</div>
                      <div className="text-slate-400 font-mono text-[10px] pt-1">
                        Initial Raw Confidence: <span className="text-white font-bold">{currentAgent.currentThesis.rawConfidence}%</span>
                      </div>
                    </div>
                  )}

                  {step.index === 3 && (isCurrent || isDone) && retrievedMemories.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        Analogous Failure Cases Retrieved from Walrus Memory Mainnet:
                      </div>
                      <div className="space-y-1.5">
                        {retrievedMemories.map(m => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/20">
                                {m.category}
                              </span>
                              <span className="text-cyan-300">Similarity: {(m.similarityScore * 100).toFixed(0)}%</span>
                              <span className="text-slate-400">{m.blobId.slice(0, 10)}...</span>
                            </div>
                            <p className="text-slate-300 text-[11px] font-sans">{m.text}</p>
                            <div className="text-[10px] font-mono text-amber-400 font-bold">
                              Weight Adjustment: {m.weightImpact}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.index === 4 && (isCurrent || isDone) && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">Raw Confidence (H_0):</span>
                        <span className="text-rose-400 font-bold line-through">{currentAgent.currentThesis.rawConfidence}%</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-cyan-300">Walrus Calibrated Confidence:</span>
                        <span className="text-emerald-400 font-bold text-sm">{currentAgent.currentThesis.calibratedConfidence}%</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed italic border-t border-slate-800 pt-1.5">
                        {currentAgent.currentThesis.reflectionNotes}
                      </p>
                    </div>
                  )}

                  {step.index === 5 && (isCurrent || isDone) && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Walrus Memory State Committed
                        </span>
                        <span className="text-[10px]">MAINNET RELAYER</span>
                      </div>
                      <div className="text-slate-400 text-[11px] break-all">
                        Blob Hash: <span className="text-cyan-300">{currentAgent.currentThesis.walrusBlobHash}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Tatum Sui Checkpoint Anchor: #{currentAgent.currentThesis.tatumCheckpoint}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Confidence Modulation Comparison & Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Epistemic Modulation Meter */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Epistemic Shift Comparison
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400">Raw Model Greed (H_0)</span>
                  <span className="text-white font-bold">{currentAgent.currentThesis.rawConfidence}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${currentAgent.currentThesis.rawConfidence}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-cyan-400">Calibrated Confidence (Walrus Modulated)</span>
                  <span className="text-emerald-400 font-bold">{currentAgent.currentThesis.calibratedConfidence}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${currentAgent.currentThesis.calibratedConfidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="font-mono text-cyan-400 font-semibold text-[11px]">THE 20-SECOND PAYOFF:</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Without Walrus Memory, the model trades at <strong className="text-rose-400">{currentAgent.currentThesis.rawConfidence}% confidence</strong> into a low-liquidity borrow spike. With memory recall, it scales position size down, avoiding forced liquidation.
              </p>
            </div>

            {/* Unlock Thesis Call to Action */}
            <div className="pt-2">
              <button
                onClick={() => onPaywallClick(currentAgent)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                <span>Unlock Calibrated Thesis ({currentAgent.unlockPriceSui} SUI via x402)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal / JSON Log Stream */}
          <div className="rounded-2xl bg-black/90 border border-slate-800 p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
                <Terminal className="w-3.5 h-3.5" /> Live Reflection Console
              </span>
              <span className="text-[10px] text-slate-500">STDOUT</span>
            </div>

            <div className="h-56 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-4 text-center">
                  Press "Run Epistemic Reflection Loop" to execute live memory pipeline...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('✓')
                        ? 'text-emerald-400 font-semibold'
                        : log.includes('Step 3')
                        ? 'text-cyan-300'
                        : log.includes('ERROR')
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
