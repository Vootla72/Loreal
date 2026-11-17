import { useState } from "react";
import type { FormEvent } from "react";

import { api } from "../api";
import type { Assessment } from "../types/assessment";
import type { Claim } from "../types/claim";

interface ClaimAssessmentProps {
  claim: Claim;
  onAssessed?: (assessment: Assessment) => void;
}

const SAMPLE_EVIDENCE =
  "Randomised, double-blind, vehicle-controlled study. n=40 women aged 25-55. " +
  "Skin hydration measured by Corneometer at baseline, 24h, 48h and 72h. " +
  "Mean hydration +38% at 24h, +29% at 48h and +21% at 72h vs baseline (all p<0.01).";

const MIN_EVIDENCE_LENGTH = 20;

const confidenceLevel = (score: number) =>
  score >= 0.75 ? "high" : score >= 0.5 ? "medium" : "low";

/**
 * Evaluator attaches clinical study results and calls POST /api/claims/assess.
 * The backend asks the LLM whether the evidence justifies the claim, saves the
 * verdict, and returns it. This component shows:
 * Justified (Yes/No), Confidence Score and Reasoning.
 */
export const ClaimAssessment = ({ claim, onAssessed }: ClaimAssessmentProps) => {
  const [evidence, setEvidence] = useState("");
  const [result, setResult] = useState<Assessment | undefined>(claim.latestAssessment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !loading && evidence.trim().length >= MIN_EVIDENCE_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      const assessment = await api.assessClaim(claim.id, evidence.trim());
      setResult(assessment);
      onAssessed?.(assessment);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const confidencePct = result ? Math.round(result.confidenceScore * 100) : 0;

  return (
    <section className="ai-assessment" aria-labelledby="ai-assessment-title">
      <h3 id="ai-assessment-title">AI Evidence Assessment</h3>
      <p className="muted">
        Does the clinical study justify <strong>“{claim.claim}”</strong>?
      </p>

      <form onSubmit={handleSubmit}>
        <div className="label-row">
          <label htmlFor="evidence">Clinical Study Results</label>
          <button type="button" className="link-button" onClick={() => setEvidence(SAMPLE_EVIDENCE)}>
            Use sample evidence
          </button>
        </div>
        <textarea
          id="evidence"
          rows={6}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Paste study design, panel size, endpoints, results and statistical significance…"
          disabled={loading}
          required
        />

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Assessing…" : result ? "Re-run AI Assessment" : "Run AI Assessment"}
        </button>
      </form>

      <div aria-live="polite">
        {error && <p className="form-error">{error}</p>}

        {result && !loading && (
          <div className={`assessment-result ${result.isJustified ? "justified" : "not-justified"}`}>
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

            {result.gaps.length > 0 && (
              <>
                <span className="metric-label">Evidence Gaps</span>
                <ul className="gaps">
                  {result.gaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </>
            )}

            <small className="muted">
              Model: {result.model} · {new Date(result.createdAt).toLocaleString()}
            </small>
          </div>
        )}
      </div>
    </section>
  );
};
