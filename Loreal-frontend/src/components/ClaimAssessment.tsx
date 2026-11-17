import { useState } from "react";
import type { FormEvent } from "react";

import { assessClaim } from "../api";
import type { AssessClaimRequest, Assessment } from "../types/assessment";

const EMPTY_FORM: AssessClaimRequest = { productName: "", claim: "", evidence: "" };

const SAMPLE: AssessClaimRequest = {
  productName: "Revitalift Night Cream",
  claim: "Reduces wrinkles by 20% in 4 weeks",
  evidence:
    "Randomised, double-blind, vehicle-controlled study. n=60 women aged 40-65. " +
    "Crow's-feet wrinkle depth measured by fringe projection profilometry at baseline, week 2 and week 4. " +
    "Mean wrinkle depth reduced by 22% at week 4 vs baseline, exceeding the claimed 20% (p<0.01); " +
    "vehicle showed no significant change.",
};

const MIN_EVIDENCE_LENGTH = 20;

const confidenceLevel = (score: number) =>
  score >= 0.75 ? "high" : score >= 0.5 ? "medium" : "low";

/**
 * Sends a claim and its clinical evidence to POST /api/claims/assess and shows the
 * saved verdict: Justified (Yes/No), Confidence Score and Reasoning.
 */
export const ClaimAssessment = () => {
  const [form, setForm] = useState<AssessClaimRequest>(EMPTY_FORM);
  const [result, setResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof AssessClaimRequest) => (value: string) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const canSubmit =
    !loading &&
    form.productName.trim() !== "" &&
    form.claim.trim() !== "" &&
    form.evidence.trim().length >= MIN_EVIDENCE_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      setResult(await assessClaim(form));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const confidencePct = result ? Math.round(result.confidenceScore * 100) : 0;

  return (
    <div className="assessment-layout">
      <form className="card" onSubmit={handleSubmit}>
        <div className="card-header">
          <h2>Assess a Claim</h2>
          <button type="button" className="link-button" onClick={() => setForm(SAMPLE)} disabled={loading}>
            Use sample
          </button>
        </div>

        <label htmlFor="productName">Product</label>
        <input
          id="productName"
          value={form.productName}
          onChange={(e) => update("productName")(e.target.value)}
          placeholder="e.g. Revitalift Night Cream"
          maxLength={200}
          disabled={loading}
          required
        />

        <label htmlFor="claim">Claim</label>
        <input
          id="claim"
          value={form.claim}
          onChange={(e) => update("claim")(e.target.value)}
          placeholder="e.g. Reduces wrinkles by 20% in 4 weeks"
          maxLength={500}
          disabled={loading}
          required
        />

        <label htmlFor="evidence">Clinical Study Results</label>
        <textarea
          id="evidence"
          rows={7}
          value={form.evidence}
          onChange={(e) => update("evidence")(e.target.value)}
          placeholder="Study design, panel size, endpoints, results and statistical significance…"
          disabled={loading}
          required
        />

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Assessing…" : "Run AI Assessment"}
        </button>
      </form>

      <section className="card result-card" aria-live="polite" aria-busy={loading}>
        <h2>Result</h2>

        {error && <p className="form-error">{error}</p>}

        {!result && !error && (
          <p className="muted">Submit a claim and its evidence to see whether the study justifies it.</p>
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

              <div className="confidence">
                <dt className="metric-label">Confidence Score</dt>
                <dd className="metric-value">{confidencePct}%</dd>
                <div
                  className={`meter ${confidenceLevel(result.confidenceScore)}`}
                  role="meter"
                  aria-label="Confidence score"
                  aria-valuenow={confidencePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="meter-fill" style={{ width: `${confidencePct}%` }} />
                </div>
              </div>
            </dl>

            <span className="metric-label">Reasoning</span>
            <p className="reasoning">{result.reasoning}</p>

            <small className="muted">
              Saved as assessment #{result.id} for claim #{result.claimId} · Model: {result.model} ·{" "}
              {new Date(result.createdAt).toLocaleString()}
            </small>
          </div>
        )}
      </section>
    </div>
  );
};
