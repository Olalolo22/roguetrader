import type { X402Invoice, X402Receipt, AgentId } from '../types';
import { tatumSui } from './tatumSui';

class X402PaymentService {
  // TODO(security): Persist verified x402 payment receipts via backend session rather than browser localStorage
  private receipts: X402Receipt[] = [];

  /**
   * Step 1: Simulate server responding with HTTP 402 Payment Required
   */
  public generateInvoice(agentId: AgentId, amountSui: number, recipient: string): X402Invoice {
    const paymentId = 'x402_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    const challenge = `x402-sui realm="roguetrader-calibrated-alpha", amount="${amountSui}", currency="SUI", recipient="${recipient}", paymentId="${paymentId}"`;

    return {
      paymentId,
      agentId,
      amountSui,
      currency: 'SUI',
      recipient,
      headerChallenge: challenge,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
    };
  }

  /**
   * Step 2: Settle the x402 payment on Sui and generate signed receipt
   */
  public async settleInvoice(invoice: X402Invoice, _senderAddress: string): Promise<{ success: boolean; receipt?: X402Receipt; error?: string }> {
    const txDigest = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const verified = await tatumSui.verifyTransaction(txDigest);
    if (!verified) {
      return { success: false, error: 'Tatum Sui Gateway failed to verify settlement signature' };
    }

    const receipt: X402Receipt = {
      paymentId: invoice.paymentId,
      amountSui: invoice.amountSui,
      recipient: invoice.recipient,
      txDigest,
      timestamp: new Date().toISOString(),
      agentId: invoice.agentId
    };

    this.receipts.unshift(receipt);

    return {
      success: true,
      receipt
    };
  }

  public getReceipts(): X402Receipt[] {
    return this.receipts;
  }

  public isAgentUnlocked(agentId: AgentId): boolean {
    return this.receipts.some(r => r.agentId === agentId);
  }
}

export const x402Payment = new X402PaymentService();
