import { useState } from "react";

import { ClaimAssessment } from "../components/ClaimAssessment";
import type { ClaimUpdate } from "../api";
import type { Assessment } from "../types/assessment";
import type { Claim } from "../types/claim";

interface EvaluatorPageProps {
  claims: Claim[];
  onUpdateClaim: (id: number, updates: ClaimUpdate) => Promise<void>;
  onAssessed: (assessment: Assessment) => void;
}

export const EvaluatorPage = ({ claims, onUpdateClaim, onAssessed }: EvaluatorPageProps) => {
  const evaluationClaims = claims.filter((claim) => claim.status === "Ready for Evaluation");

  const [selectedId, setSelectedId] = useState<number | "">("");
  const [comments, setComments] = useState("");

  const selectedClaim = evaluationClaims.find((claim) => claim.id === selectedId);

  const handleDecision = async (decision: "Approved" | "Evaluation Rejected") => {
    if (selectedId === "") return;

    try {
      await onUpdateClaim(selectedId, { status: decision, finalComments: comments });
    } catch {
      return;
    }

    setSelectedId("");
    setComments("");

    alert(`Claim ${decision.toLowerCase()} successfully!`);
  };

  return (
    <div>
      <h2>Evaluator Review</h2>

      <h3>Claims Awaiting Final Evaluation</h3>

      {evaluationClaims.length === 0 ? (
        <p>No claims are waiting for evaluation.</p>
      ) : (
        <div className="form-card">
          <label>Select Claim</label>

          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value ? Number(e.target.value) : "");
              setComments("");
            }}
          >
            <option value="">Select a claim</option>

            {evaluationClaims.map((claim) => (
              <option key={claim.id} value={claim.id}>
                {claim.product} - {claim.claim}
              </option>
            ))}
          </select>

          {selectedClaim && (
            <>
              <h3>Claim Details</h3>

              <p><strong>Product:</strong> {selectedClaim.product}</p>
              <p><strong>Claim:</strong> {selectedClaim.claim}</p>
              <p><strong>Category:</strong> {selectedClaim.category}</p>

              <h3>Scientific Assessment</h3>

              <p><strong>Test:</strong> {selectedClaim.scientistTest}</p>
              <p><strong>Result:</strong> {selectedClaim.scientistResult}</p>
              <p>
                <strong>Scientist Comments:</strong>{" "}
                {selectedClaim.scientistComments || "No comments"}
              </p>

              {/* key resets the component's state when a different claim is selected */}
              <ClaimAssessment key={selectedClaim.id} claim={selectedClaim} onAssessed={onAssessed} />

              <label>Final Evaluation Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your evaluation comments..."
              />

              {!selectedClaim.latestAssessment && (
                <p className="muted">Run the AI assessment before making a final decision.</p>
              )}

              <div className="button-group">
                <button
                  type="button"
                  disabled={!selectedClaim.latestAssessment}
                  onClick={() => void handleDecision("Approved")}
                >
                  Approve Claim
                </button>

                <button
                  type="button"
                  className="reject-button"
                  onClick={() => void handleDecision("Evaluation Rejected")}
                >
                  Reject Claim
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
