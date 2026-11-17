export interface Assessment {
  id: number;
  claimId: number;
  isJustified: boolean;
  /** 0.0 - 1.0 */
  confidenceScore: number;
  reasoning: string;
  gaps: string[];
  evidence: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  createdAt: string;
}
