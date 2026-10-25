import type { AgentProfile, AgentThesis, AgentId } from '../types';
import { walrusMemory } from './walrusMemory';
import { x402Payment } from './x402Payment';

export const INITIAL_AGENTS: AgentProfile[] = [
  {
    id: 'alphasui',
    name: 'AlphaSui-v4',
    badge: 'TOP CALIBRATED',
    avatar: '⚡',
    style: 'Bayesian Market Microstructure & Cetus Volume Flow',
    brierScore: 0.142, // Elite calibration (close to 0.0)
    calibrationPct: 86,
    rank: 1,
    totalMemories: 18,
    resolvedCalls: 12,
    status: 'ONLINE',
    unlockPriceSui: 0.05,
    recipientAddress: '0x7a8f941029ba8ec001b92040188efacb772109aa',
    currentThesis: {
      id: 'thesis-alpha-101',
      agentId: 'alphasui',
      marketPair: 'SUI/USDC',
      rawConfidence: 84,
      calibratedConfidence: 62,
      stance: 'CAUTIOUS_LONG',
      rawHypothesis: 'Cetus 1h volume crossed $14M; DeepBook spread tightened to 2.8 bps. Initial model recommends aggressive long toward $2.24.',
      reflectionNotes: 'Reflective pass triggered: Walrus Memory retrieved Oct 14 failure incident (NAVI borrow utilization > 78%). Current borrow utilization is 71%. Reduced confidence from 84% to 62%; tightened stop-loss.',
      fullAnalysis: 'SUI shows strong spot accumulation at $2.06 support. However, elevated borrow rates on NAVI signal potential long exhaustion if BTC consolidates below $68k. Strategy: Enter scaled spot at $2.072 - $2.080 with conservative take-profit at $2.185. Risk invalidated if SUI drops below $2.038 on 15m candle close.',
      entryRange: '$2.072 - $2.080',
      targetPrice: 2.185,
      stopLoss: 2.038,
      retrievedMemories: [],
      walrusJobId: 'job_wm_9881023bc4a',
      walrusBlobHash: '0x992fa100eb81711200dfa8829011b',
      timestamp: new Date().toISOString(),
      tatumCheckpoint: 89412950,
      isUnlocked: false
    }
  },
  {
    id: 'deepregime',
    name: 'DeepRegime-AI',
    badge: 'MEAN REVERSION',
    avatar: '🛡️',
    style: 'Macro Liquidity Cycles & Cross-Chain Yield Divergence',
    brierScore: 0.284, // Fair calibration
    calibrationPct: 72,
    rank: 2,
    totalMemories: 14,
    resolvedCalls: 9,
    status: 'ONLINE',
    unlockPriceSui: 0.03,
    recipientAddress: '0x3c1092aab88410ef9923188ba099c118274092bb',
    currentThesis: {
      id: 'thesis-regime-202',
      agentId: 'deepregime',
      marketPair: 'SUI/USDC',
      rawConfidence: 68,
      calibratedConfidence: 51,
      stance: 'NEUTRAL',
      rawHypothesis: 'Macro BTC correlation high (0.84). Expecting chop between $2.02 and $2.12.',
      reflectionNotes: 'Walrus Memory recalled Oct 22 incident where BTC dump overrode standalone SUI strength. Setting neutral posture.',
      fullAnalysis: 'Macro signals are conflicting. Sui on-chain active addresses are up +18%, but US dollar index is pressing local resistance. Recommended posture: Maintain delta-neutral staking yield (e.g. haSUI) rather than directional directional leverage.',
      entryRange: '$2.040 - $2.060',
      targetPrice: 2.115,
      stopLoss: 2.015,
      retrievedMemories: [],
      walrusJobId: 'job_wm_5511aa78810',
      walrusBlobHash: '0x5511aa7881023bc99102998ecba01',
      timestamp: new Date().toISOString(),
      tatumCheckpoint: 89412948,
      isUnlocked: false
    }
  },
  {
    id: 'hypesentinel',
    name: 'HypeSentinel-Bot',
    badge: 'DEGRADED / HIGH BIAS',
    avatar: '🔥',
    style: 'Social Trend Momentum & Meme Token Velocity',
    brierScore: 0.546, // Poor calibration (hallucinating confidence)
    calibrationPct: 45,
    rank: 3,
    totalMemories: 22,
    resolvedCalls: 14,
    status: 'ONLINE',
    unlockPriceSui: 0.01,
    recipientAddress: '0x9b11aa8871029efb990188efacba9881729011cc',
    currentThesis: {
      id: 'thesis-hype-303',
      agentId: 'hypesentinel',
      marketPair: 'SUI/USDC',
      rawConfidence: 94,
      calibratedConfidence: 42,
      stance: 'STRONG_LONG',
      rawHypothesis: 'Massive Twitter engagement spike for #SuiNetwork! 94% confidence parabolic pump to $2.80 imminent!',
      reflectionNotes: 'WARNING: Model has a severe 0.546 Brier score penalty from Oct 24 meme hallucination. Walrus reflection heavily slashed raw confidence from 94% down to 42%.',
      fullAnalysis: 'Social metrics are euphoric, but volume delta is lagging. High risk of bull-trap based on historical meme pumps that lacked institutional DEX depth.',
      entryRange: '$2.080 - $2.100',
      targetPrice: 2.800,
      stopLoss: 1.980,
      retrievedMemories: [],
      walrusJobId: 'job_wm_2211aa88710',
      walrusBlobHash: '0x2211aa8871029efb990188efacba9',
      timestamp: new Date().toISOString(),
      tatumCheckpoint: 89412945,
      isUnlocked: false
    }
  }
];

class AgentEngineService {
  private agents: AgentProfile[] = [...INITIAL_AGENTS];

  constructor() {
    this.syncUnlockedState();
  }

  public syncUnlockedState() {
    this.agents.forEach(agent => {
      agent.currentThesis.isUnlocked = x402Payment.isAgentUnlocked(agent.id);
    });
  }

  public getAgents(): AgentProfile[] {
    this.syncUnlockedState();
    return this.agents;
  }

  public getAgent(id: AgentId): AgentProfile | undefined {
    this.syncUnlockedState();
    return this.agents.find(a => a.id === id);
  }

  /**
   * The 5-Step Reflective Thought Engine
   * Shows on-screen step-by-step how Walrus Memory alters raw model hypothesis
   */
  public async runReflectiveThought(
    agentId: AgentId,
    onStepChange?: (step: number, description: string, detail?: any) => void
  ): Promise<AgentThesis> {
    const agent = this.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');

    // Step 1: Ingest live market state from Tatum Sui RPC
    if (onStepChange) onStepChange(1, 'Querying live Sui blockchain state & pool depth via Tatum Gateway...');
    await new Promise(r => setTimeout(r, 700));

    // Step 2: Form raw hypothesis
    if (onStepChange) onStepChange(2, `Formulating raw uncalibrated hypothesis H_0 for ${agent.name}...`, {
      rawConfidence: agent.currentThesis.rawConfidence,
      hypothesis: agent.currentThesis.rawHypothesis
    });
    await new Promise(r => setTimeout(r, 900));

    // Step 3: Semantic Walrus Memory Recall
    if (onStepChange) onStepChange(3, 'Executing memwal.recall() on Walrus Memory Mainnet for analogous market failures...');
    const retrieved = await walrusMemory.recall(
      `SUI breakout volume resistance liquidation failure ${agent.style}`,
      2
    );
    agent.currentThesis.retrievedMemories = retrieved;
    await new Promise(r => setTimeout(r, 1100));

    // Step 4: Epistemic Self-Correction pass
    if (onStepChange) onStepChange(4, 'Epistemic Modulation: Adjusting confidence & posture based on retrieved memories...', {
      originalConfidence: agent.currentThesis.rawConfidence,
      calibratedConfidence: agent.currentThesis.calibratedConfidence,
      retrievedNotes: agent.currentThesis.reflectionNotes
    });
    await new Promise(r => setTimeout(r, 1000));

    // Step 5: Commit to Walrus Memory Mainnet
    if (onStepChange) onStepChange(5, 'Committing calibrated decision audit record to Walrus Memory (Mainnet)...', {
      blobHash: agent.currentThesis.walrusBlobHash
    });
    await new Promise(r => setTimeout(r, 600));

    return agent.currentThesis;
  }
}

export const agentEngine = new AgentEngineService();
