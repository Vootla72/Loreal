import { memo, useMemo } from "react";

import type { Assessment } from "../types/assessment";
import { ConfidenceMeter } from "./ConfidenceMeter";

interface AssessmentResultProps {
  result: Assessment | null;
  error: string | null;
  loading: boolean;
}

export const AssessmentResult = memo(function AssessmentResult({ result, error, loading }: AssessmentResultProps) {
  const assessedAt = useMemo(() => (result ? new Date(result.createdAt).toLocaleString() : ""), [result]);

  return (
  <section className="card result-card" aria-live="polite" aria-busy={loading}>
    <h2>Result</h2>

    {error && <p className="form-error">{error}</p>}

    {!result && !error && (
      <p className="muted">Upload a clinical study to see whether it justifies the claim.</p>
    )}

    {result && (
      <div className={`assessment-result ${result.isJustified ? "justified" : "not-justified"}`}>
        <p className="result-claim">
          “{result.claim}” <span className="muted">· {result.productName}</span>
        </p>

        <dl className="assessment-metrics">
          <div>
            <dt className="metric-label">Justified</dt>
            <dd className={`verdict ${result.isJustified ? "yes" : "no"}`}>
              {result.isJustified ? "Yes" : "No"}
            </dd>
          </div>

          <ConfidenceMeter score={result.confidenceScore} />
        </dl>

        <span className="metric-label">Reasoning</span>
        <p className="reasoning">{result.reasoning}</p>

        {result.cached && (
          <p className="cached-note" role="note">
            This claim was already assessed with the same evidence, so the earlier verdict was reused.
          </p>
        )}

        <small className="muted">
          {result.cached ? "Reused assessment" : "Saved as assessment"} #{result.id} for claim #{result.claimId} ·
          Model: {result.model} · {assessedAt}
        </small>
      </div>
    )}
  </section>
  );
});
