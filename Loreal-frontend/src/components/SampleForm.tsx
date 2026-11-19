import type { AssessClaimUploadRequest } from "../types/assessment";
import { SAMPLE_DATA } from "../data/sampleData";

async function loadSamplePdf(): Promise<File> {
  const response = await fetch(`${import.meta.env.BASE_URL}${SAMPLE_DATA.pdf}`);
  if (!response.ok) throw new Error(`Sample PDF request failed (${response.status})`);
  return new File([await response.blob()], SAMPLE_DATA.pdf, { type: "application/pdf" });
}

interface SampleFormProps {
  show?: boolean;
  disabled: boolean;
  onFill: (sample: AssessClaimUploadRequest) => void;
  onError: (message: string) => void;
}

export const SampleForm = ({ show = false, disabled, onFill, onError }: SampleFormProps) => {
  if (!show) return null;

  const fillSample = async () => {
    try {
      onFill({ productName: SAMPLE_DATA.productName, claim: SAMPLE_DATA.claim, file: await loadSamplePdf() });
    } catch {
      onError("The sample PDF could not be loaded.");
    }
  };

  return (
    <button type="button" className="link-button" onClick={fillSample} disabled={disabled}>
      Use sample
    </button>
  );
};
