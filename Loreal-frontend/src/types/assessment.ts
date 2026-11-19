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
  confidenceScore: number;
  reasoning: string;
  model: string;
  createdAt: string;
  cached: boolean;
}
