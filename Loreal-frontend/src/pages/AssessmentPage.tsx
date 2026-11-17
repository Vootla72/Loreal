import { useState } from "react";
import type { FormEvent } from "react";
import type { ClaimUpdate } from "../api";
import type { Claim } from "../types/claim";

interface AssessmentPageProps {
  claims: Claim[];
  onSubmitAssessment: (id: number, updates: ClaimUpdate) => Promise<void>;
}

export const AssessmentPage = ({
  claims,
  onSubmitAssessment,
}: AssessmentPageProps) => {
  const scientistClaims = claims.filter(
    (claim) => claim.status === "Sent to Scientist",
  );

  const [selectedId, setSelectedId] = useState<number | "">("");
  const [testName, setTestName] = useState("");
  const [result, setResult] = useState<"Pass" | "Fail" | "Inconclusive">(
    "Pass",
  );
  const [comments, setComments] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedId === "" || !testName.trim()) {
      return;
    }

    try {
      await onSubmitAssessment(selectedId, {
        scientistTest: testName,
        scientistResult: result,
        scientistComments: comments,
        status: result === "Pass" ? "Ready for Evaluation" : "Rejected",
      });
    } catch {
      return;
    }

    setSelectedId("");
    setTestName("");
    setResult("Pass");
    setComments("");

    alert("Assessment submitted successfully!");
  };

  return (
    <div>
      <h2>Scientist Dashboard</h2>

      <h3>Claims Awaiting Testing</h3>

      {scientistClaims.length === 0 ? (
        <p>No claims are waiting for scientific assessment.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Claim</th>
                <th>Category</th>
              </tr>
            </thead>

            <tbody>
              {scientistClaims.map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.product}</td>
                  <td>{claim.claim}</td>
                  <td>{claim.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Submit Scientific Assessment</h3>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>Select Claim</label>

        <select
          value={selectedId}
          onChange={(e) =>
            setSelectedId(e.target.value ? Number(e.target.value) : "")
          }
          required
        >
          <option value="">Select a claim</option>

          {scientistClaims.map((claim) => (
            <option key={claim.id} value={claim.id}>
              {claim.product} - {claim.claim}
            </option>
          ))}
        </select>

        <label>Test Name</label>
        <input
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Example: Hydration Test"
          required
        />

        <label>Test Result</label>
        <select
          value={result}
          onChange={(e) =>
            setResult(e.target.value as "Pass" | "Fail" | "Inconclusive")
          }
        >
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
          <option value="Inconclusive">Inconclusive</option>
        </select>

        <label>Scientific Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter test observations..."
        />

        <button type="submit" disabled={scientistClaims.length === 0}>
          Submit Assessment
        </button>
      </form>
    </div>
  );
};
  