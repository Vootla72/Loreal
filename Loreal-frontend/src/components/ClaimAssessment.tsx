import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { assessClaimWithPdf } from "../api";
import type { Assessment } from "../types/assessment";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // same limit as the backend

const SAMPLE = {
  productName: "Revitalift Night Cream",
  claim: "Reduces wrinkles by 20% in 4 weeks",
  pdf: "sample-clinical-study.pdf",
};

const confidenceLevel = (score: number) =>
  score >= 0.75 ? "high" : score >= 0.5 ? "medium" : "low";

const checkPdf = (file: File) => {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "Please choose a PDF file.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_PDF_BYTES) return "The PDF is larger than 10 MB.";
  return null;
};

export const ClaimAssessment = () => {
  const [productName, setProductName] = useState("");
  const [claim, setClaim] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !loading && productName.trim() !== "" && claim.trim() !== "" && file !== null;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = ""; // allows choosing the same file again later
    if (!picked) return; // dialog cancelled: keep the current file
    const problem = checkPdf(picked);
    setFileError(problem);
    if (!problem) setFile(picked);
  };

  const fillSample = async () => {
    setProductName(SAMPLE.productName);
    setClaim(SAMPLE.claim);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${SAMPLE.pdf}`);
      if (!response.ok) throw new Error();
      setFile(new File([await response.blob()], SAMPLE.pdf, { type: "application/pdf" }));
      setFileError(null);
    } catch {
      setFileError("The sample PDF could not be loaded.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await assessClaimWithPdf({ productName, claim, file }));
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
          <button type="button" className="link-button" onClick={fillSample} disabled={loading}>
            Use sample
          </button>
        </div>

        <label htmlFor="productName">Product</label>
        <input
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. Revitalift Night Cream"
          maxLength={200}
          disabled={loading}
          required
        />

        <label htmlFor="claim">Claim</label>
        <input
          id="claim"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="e.g. Reduces wrinkles by 20% in 4 weeks"
          maxLength={500}
          disabled={loading}
          required
        />

        <label htmlFor="evidence">Clinical Study Results (PDF)</label>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFile}
          hidden
        />
        <div className="file-picker">
          <button
            id="evidence"
            type="button"
            className="icon-button"
            onClick={() => fileInput.current?.click()}
            disabled={loading}
            aria-label={file ? "Replace PDF" : "Upload PDF"}
            title={file ? "Replace PDF" : "Upload PDF"}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M12 18v-6M9 15l3-3 3 3" />
            </svg>
          </button>
          <span className={`file-name${file ? "" : " muted"}`} title={file?.name}>
            {file ? file.name : "Upload the study as a PDF (max 10 MB)"}
          </span>
          {file && (
            <button
              type="button"
              className="remove-file"
              onClick={() => setFile(null)}
              disabled={loading}
              aria-label={`Remove ${file.name}`}
            >
              ×
            </button>
          )}
        </div>
        {fileError && <p className="field-error" role="alert">{fileError}</p>}

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Assessing…" : "Run AI Assessment"}
        </button>
      </form>

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

            {result.cached && (
              <p className="cached-note" role="note">
                This claim was already assessed with the same evidence, so the earlier verdict was reused.
              </p>
            )}

            <small className="muted">
              {result.cached ? "Reused assessment" : "Saved as assessment"} #{result.id} for claim #{result.claimId} ·
              Model: {result.model} · {new Date(result.createdAt).toLocaleString()}
            </small>
          </div>
        )}
      </section>
    </div>
  );
};
