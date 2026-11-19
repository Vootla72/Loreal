import { Prisma } from '@prisma/client';

export const RESPONSE_SELECT = {
  id: true,
  claimId: true,
  isJustified: true,
  confidenceScore: true,
  reasoning: true,
  model: true,
  createdAt: true,
  claim: { select: { productName: true, claimText: true } },
} satisfies Prisma.AssessmentSelect;

export type SavedAssessment = Prisma.AssessmentGetPayload<{ select: typeof RESPONSE_SELECT }>;

// Body of POST /api/claims/assess.-- same as Frontend
export interface AssessmentResponse {
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

export const toResponse = (assessment: SavedAssessment, cached: boolean): AssessmentResponse => ({
  id: assessment.id,
  claimId: assessment.claimId,
  productName: assessment.claim.productName,
  claim: assessment.claim.claimText,
  isJustified: assessment.isJustified,
  confidenceScore: assessment.confidenceScore,
  reasoning: assessment.reasoning,
  model: assessment.model,
  createdAt: assessment.createdAt.toISOString(),
  cached,
});
