import { useState } from 'react';
import type React from 'react';
import { Play, CheckCircle2, Database, Terminal, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
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
      title: 'Tatum Sui RPC State Observation',
      subtitle: 'Query live Sui mainnet state, checkpoint, and Cetus pool depth',
      status: 'pending'
    },
    {
      index: 2,
      title: 'Formulate Uncalibrated Hypothesis H_0',
      subtitle: 'Raw LLM model forms initial trade stance without error memory',
      status: 'pending'
    },
    {
      index: 3,
      title: 'Walrus Semantic Recall (memwal.recall)',
      subtitle: 'Search Walrus Mainnet for analogous past liquidation failure cases',
      status: 'pending'
    },
    {
      index: 4,
      title: 'Epistemic Bayesian Modulation',
      subtitle: 'Self-correcting confidence penalty applied to avoid liquidation',
      status: 'pending'
    },
    {
      index: 5,
      title: 'Walrus Memory Mainnet Commit',
      subtitle: 'Write immutable decision audit blob to Walrus Memory relayer',
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
      <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-base font-bold text-white font-['Orbitron']">
              Epistemic Reflection Engine
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Watch <span className="text-cyan-300">Walrus Memory</span> intercept unconstrained LLM confidence in real time.
          </p>
        </div>

        {/* Agent Switcher Pills - Scrollable on mobile */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/[0.06] overflow-x-auto whitespace-nowrap scrollbar-none w-full sm:w-auto">
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => {
                if (!isRunning) onSelectAgent(a.id);
              }}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                selectedAgentId === a.id
                  ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-white'
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
          className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isRunning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Calibrating with Walrus...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Run Epistemic Loop</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Steps Timeline vs Interactive Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 5 Steps Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {steps.map(step => {
            const isCurrent = step.status === 'running';
            const isDone = step.status === 'completed';

            return (
              <div
                key={step.index}
                className={`p-3.5 rounded-xl border transition-all duration-150 ${
                  isCurrent
                    ? 'bg-[#090b10] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                    : isDone
                    ? 'bg-[#08090d] border-white/[0.08]'
                    : 'bg-[#050608] border-white/[0.04] opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold mt-0.5 ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-cyan-500 text-black animate-pulse'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.index}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                        {step.title}
                        {isCurrent && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500">
                    {isDone && <span className="text-emerald-400">PASSED</span>}
                    {isCurrent && <span className="text-cyan-400">EXECUTING</span>}
                    {step.status === 'pending' && <span>WAITING</span>}
                  </span>
                </div>

                {/* Step Specific Details */}
                {step.index === 2 && (isCurrent || isDone) && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-black/60 border border-white/[0.04] text-xs font-mono space-y-1">
                    <div className="text-zinc-500 text-[10px]">Uncalibrated Prompt Stance:</div>
                    <div className="text-amber-300 italic text-[11px]">"{currentAgent.currentThesis.rawHypothesis}"</div>
                    <div className="text-zinc-500 text-[10px]">
                      Initial Greed: <span className="text-zinc-200 font-bold">{currentAgent.currentThesis.rawConfidence}%</span>
                    </div>
                  </div>
                )}

                {step.index === 3 && (isCurrent || isDone) && retrievedMemories.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Retrieved Memories from Walrus Relayer:
                    </div>
                    <div className="space-y-1">
                      {retrievedMemories.map(m => (
                        <div
                          key={m.id}
                          className="p-2 rounded-lg bg-black/60 border border-cyan-500/20 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-rose-400 bg-rose-950/60 px-1 rounded border border-rose-500/20">
                              {m.category}
                            </span>
                            <span className="text-cyan-300">Match: {(m.similarityScore * 100).toFixed(0)}%</span>
                            <span className="text-zinc-500">{m.blobId.slice(0, 10)}...</span>
                          </div>
                          <p className="text-zinc-300 text-[11px] font-sans">{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step.index === 4 && (isCurrent || isDone) && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-black/60 border border-cyan-500/30 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Raw Confidence (H_0):</span>
                      <span className="text-rose-400 font-bold line-through">{currentAgent.currentThesis.rawConfidence}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300">Walrus Calibrated:</span>
                      <span className="text-emerald-400 font-bold">{currentAgent.currentThesis.calibratedConfidence}%</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] font-sans border-t border-white/[0.04] pt-1">
                      {currentAgent.currentThesis.reflectionNotes}
                    </p>
                  </div>
                )}

                {step.index === 5 && (isCurrent || isDone) && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Walrus Memory State Committed
                      </span>
                      <span className="text-[10px]">MAINNET</span>
                    </div>
                    <div className="text-zinc-400 text-[10px] break-all">
                      Blob: <span className="text-cyan-300">{currentAgent.currentThesis.walrusBlobHash}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Confidence Shift & Console (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Epistemic Modulation Meter */}
          <div className="border border-white/[0.08] bg-[#08090d] rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Epistemic Confidence Shift
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Δ {(currentAgent.currentThesis.rawConfidence - currentAgent.currentThesis.calibratedConfidence)}%
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400 text-[11px]">Raw Greed (H_0)</span>
                  <span className="text-zinc-200 font-bold">{currentAgent.currentThesis.rawConfidence}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentAgent.currentThesis.rawConfidence}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-cyan-400 text-[11px]">Calibrated (Walrus Modulated)</span>
                  <span className="text-emerald-400 font-bold">{currentAgent.currentThesis.calibratedConfidence}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${currentAgent.currentThesis.calibratedConfidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.04] text-[11px] text-zinc-400 leading-relaxed font-sans">
              Without Walrus Memory, the model enters at <strong className="text-rose-400 font-mono">{currentAgent.currentThesis.rawConfidence}%</strong> into a borrow spike. With memory recall, it reduces exposure, saving the vault from liquidation.
            </div>

            <button
              onClick={() => onPaywallClick(currentAgent)}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span>Unlock Calibrated Thesis ({currentAgent.unlockPriceSui} SUI via x402)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Terminal Log Stream */}
          <div className="border border-white/[0.08] bg-black rounded-xl p-3.5 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-500 border-b border-white/[0.06] pb-1.5 text-[10px]">
              <span className="flex items-center gap-1 text-cyan-400">
                <Terminal className="w-3 h-3" /> Live Reflection Console
              </span>
              <span>STDOUT</span>
            </div>

            <div className="h-48 overflow-y-auto space-y-1 text-[11px] text-zinc-400 pr-1">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic py-6 text-center text-[10px]">
                  Press "Run Epistemic Loop" to execute live memory pipeline...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('✓')
                        ? 'text-emerald-400 font-medium'
                        : log.includes('Step 3')
                        ? 'text-cyan-300'
                        : log.includes('ERROR')
                        ? 'text-rose-400'
                        : 'text-zinc-400'
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
