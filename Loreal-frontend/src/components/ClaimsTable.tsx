
import { useState } from "react";
import type { Claim } from "../types/claim";

interface ClaimsTableProps {
  claims: Claim[];
  onReview: (id: number) => void;
}

export const ClaimsTable = ({ claims, onReview }: ClaimsTableProps) => {
  const [search, setSearch] = useState<string>("");

  const filteredClaims = claims.filter((claim) => {
    const searchText = search.toLowerCase();

    return (
      claim.product.toLowerCase().includes(searchText) ||
      claim.claim.toLowerCase().includes(searchText)
    );
  });

  return (
    <section className="claims-section" id="claims">
      <div className="section-header">
        <div>
          <h2>Product Claims</h2>
          <p>Review and manage proposed product claims</p>
        </div>

        <input
          type="text"
          placeholder="Search products or claims..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Claim</th>
              <th>Category</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredClaims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.product}</td>
                <td>{claim.claim}</td>
                <td>{claim.category}</td>
                <td>
                  <span
                    className={`status ${claim.status
                      .toLowerCase()
                      .replace(/ /g, "-")}`}
                  >
                    {claim.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => onReview(claim.id)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}

            {filteredClaims.length === 0 && (
              <tr>
                <td colSpan={5}>No claims found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

