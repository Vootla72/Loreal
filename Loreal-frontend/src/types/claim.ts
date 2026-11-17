import type { Assessment } from "./assessment";

export type ClaimStatus =
  | "Pending"
  | "Under Review"
  | "Sent to Scientist"
  | "Rejected"
  | "Ready for Evaluation"
  | "Approved"
  | "Evaluation Rejected";

export interface Claim {
  id: number;
  productId: number;
  product: string;
  claim: string;
  category: string;
  status: ClaimStatus;
  applicability?: boolean;
  feasibility?: boolean;
  managerComments?: string;

  // Scientist assessment
  scientistTest?: string;
  scientistResult?: "Pass" | "Fail" | "Inconclusive";
  scientistComments?: string;

  finalComments?: string;

  // Most recent LLM assessment of the clinical evidence
  latestAssessment?: Assessment;
}
