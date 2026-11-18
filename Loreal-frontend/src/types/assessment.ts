export interface AssessClaimRequest {
  productName: string;
  claim: string;
  evidence: string;
}

export interface AssessClaimUploadRequest {
  productName: string;
  claim: string;
  file: File;
}

export interface Assessment {
  id: number;
  claimId: number;
  productName: string;
  claim: string;
  isJustified: boolean;
  /** 0.0 - 1.0 */
  confidenceScore: number;
  reasoning: string;
  model: string;
  createdAt: string;
  /** True when an earlier verdict for the same claim and evidence was reused instead of calling the LLM. */
  cached: boolean;
}
