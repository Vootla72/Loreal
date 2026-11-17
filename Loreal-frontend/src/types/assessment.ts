/** Request body for POST /api/claims/assess */
export interface AssessClaimRequest {
  productName: string;
  claim: string;
  evidence: string;
}

/** Saved assessment returned by POST /api/claims/assess */
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
}
