import { useState } from "react";

import { AddClaim } from "../components/AddClaim";
import { ClaimsTable } from "../components/ClaimsTable";
import { ClaimManager } from "../components/ClaimManager";

import type { ClaimUpdate, NewClaim } from "../api";
import type { Claim } from "../types/claim";
import type { Product } from "../types/product";

interface ClaimsPageProps {
  products: Product[];
  claims: Claim[];
  onAddClaim: (claim: NewClaim) => Promise<void>;
  onReview: (id: number) => void;
  onUpdateClaim: (id: number, updates: ClaimUpdate) => Promise<void>;
}

export const ClaimsPage = ({
  products,
  claims,
  onAddClaim,
  onReview,
  onUpdateClaim,
}: ClaimsPageProps) => {
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const handleReview = (id: number) => {
    onReview(id);
    setSelectedClaimId(id);
  };

  return (
    <>
      <h2>Claims Management</h2>

      <AddClaim products={products} onAddClaim={onAddClaim} />

      <ClaimsTable claims={claims} onReview={handleReview} />
      {selectedClaimId !== null && (
        <div className="review-panel">
          <div className="review-header">
            <h3>Claim Manager Review</h3>

            <button
              className="close-button"
              onClick={() => setSelectedClaimId(null)}
            >
              Close
            </button>
          </div>

          <p>Review applicability and feasibility of proposed claims.</p>

          <ClaimManager
            claims={claims.filter((claim) => claim.id === selectedClaimId)}
            onUpdateClaim={onUpdateClaim}
          />
        </div>
      )}
    </>
  );
};
