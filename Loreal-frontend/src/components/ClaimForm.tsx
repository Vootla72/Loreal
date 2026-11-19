import { useState } from "react";
import type { SubmitEvent } from "react";

import { checkPdf } from "../utils/utils";
import type { AssessClaimUploadRequest } from "../types/assessment";
import { PdfPicker } from "../utils/PdfPicker";
import { SampleForm } from "./SampleForm";

interface ClaimFormProps {
  loading: boolean;
  onSubmit: (request: AssessClaimUploadRequest) => void;
}

export const ClaimForm = ({ loading, onSubmit }: ClaimFormProps) => {
  const [productName, setProductName] = useState("");
  const [claim, setClaim] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const canSubmit =
    !loading &&
    productName.trim() !== "" &&
    claim.trim() !== "" &&
    file !== null;

  const handlePick = (picked: File) => {
    const problem = checkPdf(picked);
    setFileError(problem);
    if (!problem) setFile(picked);
  };

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
        onPick={handlePick}
        onRemove={() => setFile(null)}
      />

      <button type="submit" disabled={!canSubmit}>
        {loading ? "Assessing…" : "Run AI Assessment"}
      </button>
    </form>
  );
};
