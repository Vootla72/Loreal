import { Assessment, Claim, ClaimStatus, Product, ScientistResult } from '@prisma/client';

/** Prisma enum <-> UI label. The UI and API speak in labels; the DB stores enums. */
export const STATUS_LABELS: Record<ClaimStatus, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  SENT_TO_SCIENTIST: 'Sent to Scientist',
  REJECTED: 'Rejected',
  READY_FOR_EVALUATION: 'Ready for Evaluation',
  APPROVED: 'Approved',
  EVALUATION_REJECTED: 'Evaluation Rejected',
};

export const RESULT_LABELS: Record<ScientistResult, string> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  INCONCLUSIVE: 'Inconclusive',
};

const invert = <K extends string>(record: Record<K, string>) =>
  Object.fromEntries(Object.entries(record).map(([k, v]) => [v, k])) as Record<string, K>;

export const STATUS_FROM_LABEL = invert(STATUS_LABELS);
export const RESULT_FROM_LABEL = invert(RESULT_LABELS);

export function toAssessmentResponse(a: Assessment) {
  return {
    id: a.id,
    claimId: a.claimId,
    isJustified: a.isJustified,
    confidenceScore: a.confidenceScore,
    reasoning: a.reasoning,
    gaps: a.gaps,
    evidence: a.evidence,
    model: a.model,
    promptVersion: a.promptVersion,
    latencyMs: a.latencyMs,
    createdAt: a.createdAt.toISOString(),
  };
}

export type ClaimWithRelations = Claim & { product: Product; assessments: Assessment[] };

export function toClaimResponse(c: ClaimWithRelations) {
  const latest = c.assessments[0];
  return {
    id: c.id,
    productId: c.productId,
    product: c.product.name,
    claim: c.claimText,
    category: c.category,
    status: STATUS_LABELS[c.status],
    applicability: c.applicability ?? undefined,
    feasibility: c.feasibility ?? undefined,
    managerComments: c.managerComments ?? undefined,
    scientistTest: c.scientistTest ?? undefined,
    scientistResult: c.scientistResult ? RESULT_LABELS[c.scientistResult] : undefined,
    scientistComments: c.scientistComments ?? undefined,
    finalComments: c.finalComments ?? undefined,
    latestAssessment: latest ? toAssessmentResponse(latest) : undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}
