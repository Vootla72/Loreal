import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { checkPdf } from "../utils/utils";
import type { AssessClaimUploadRequest } from "../types/assessment";
import { PdfPicker } from "../utils/PdfPicker";
import { SampleForm } from "./SampleForm";

interface ClaimFormProps {
  loading: boolean;
  onSubmit: (request: AssessClaimUploadRequest) => void;
}

export function ClaimForm({ loading, onSubmit }: ClaimFormProps) {
  const [productName, setProductName] = useState("");
  const [claim, setClaim] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const canSubmit =
    !loading && productName.trim() !== "" && claim.trim() !== "" && file !== null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = ""; // allows choosing the same file again later
    if (!picked) return;
    const problem = checkPdf(picked);
    setFileError(problem);
    if (!problem) setFile(picked);
  };

  const handleRemove = () => setFile(null);

  const fillSample = (sample: AssessClaimUploadRequest) => {
    setProductName(sample.productName);
    setClaim(sample.claim);
    setFile(sample.file);
    setFileError(null);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !file) return;
    onSubmit({ productName, claim, file });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h2>Assess a Claim</h2>
        <SampleForm
          show
          disabled={loading}
          onFill={fillSample}
          onError={setFileError}
        />
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
      <PdfPicker
        id="evidence"
        file={file}
        error={fileError}
        disabled={loading}
        onChange={handleFileChange}
        onRemove={handleRemove}
      />

      <button type="submit" className="submit-button" disabled={!canSubmit}>
        {loading && (
          <LoaderCircle className="spin" size={16} aria-hidden="true" />
        )}
        {loading ? "Assessing…" : "Run AI Assessment"}
      </button>
    </form>
  );
}
