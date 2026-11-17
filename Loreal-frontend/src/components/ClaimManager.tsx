
import { useState } from "react";
import type { ClaimUpdate } from "../api";
import type { Claim } from "../types/claim";

interface ClaimManagerProps {
  claims: Claim[];
  onUpdateClaim: (id: number, updates: ClaimUpdate) => Promise<void>;
}

export const ClaimManager = ({
  claims,
  onUpdateClaim,
}: ClaimManagerProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [applicability, setApplicability] = useState<string>("");
  const [feasibility, setFeasibility] = useState<string>("");
  const [comments, setComments] = useState("");

  const selectedClaim = claims.find(
    (claim) => claim.id === selectedId
  );

  const handleSelect = (claim: Claim) => {
    setSelectedId(claim.id);
    setApplicability(
      claim.applicability === undefined
        ? ""
        : String(claim.applicability)
    );
    setFeasibility(
      claim.feasibility === undefined
        ? ""
        : String(claim.feasibility)
    );
    setComments(claim.managerComments ?? "");
  };

  const handleSubmit = async () => {
    if (
      !selectedClaim ||
      applicability === "" ||
      feasibility === ""
    ) {
      return;
    }

    const isApplicable = applicability === "true";
    const isFeasible = feasibility === "true";

    try {
      await onUpdateClaim(selectedClaim.id, {
        applicability: isApplicable,
        feasibility: isFeasible,
        managerComments: comments,
        status:
          isApplicable && isFeasible
            ? "Sent to Scientist"
            : "Rejected",
      });
    } catch {
      return;
    }

    setSelectedId(null);
    setApplicability("");
    setFeasibility("");
    setComments("");
  };

  const pendingClaims = claims.filter(
    (claim) =>
      claim.status === "Pending" ||
      claim.status === "Under Review"
  );

  return (
    <section className="manager-section">
      <h2>Claim Manager Review</h2>
      <p>Review applicability and feasibility of proposed claims.</p>

      <div className="manager-list">
        {pendingClaims.map((claim) => (
          <div className="manager-card" key={claim.id}>
            <div>
              <h3>{claim.product}</h3>
              <p>{claim.claim}</p>
              <small>{claim.category}</small>
            </div>

            <button onClick={() => handleSelect(claim)}>
              Evaluate
            </button>
          </div>
        ))}

        {pendingClaims.length === 0 && (
          <p>No pending claims for review.</p>
        )}
      </div>

      {selectedClaim && (
        <div className="evaluation-form">
          <h3>Evaluate: {selectedClaim.product}</h3>

          <label>Is this claim applicable?</label>

          <select
            value={applicability}
            onChange={(event) =>
              setApplicability(event.target.value)
            }
          >
            <option value="">Select answer</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <label>Is this claim feasible?</label>

          <select
            value={feasibility}
            onChange={(event) =>
              setFeasibility(event.target.value)
            }
          >
            <option value="">Select answer</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <label>Manager Comments</label>

          <textarea
            value={comments}
            onChange={(event) =>
              setComments(event.target.value)
            }
            placeholder="Enter evaluation comments"
          />

          <button
            disabled={!applicability || !feasibility}
            onClick={handleSubmit}
          >
            Submit Evaluation
          </button>
        </div>
      )}
    </section>
  );
};

