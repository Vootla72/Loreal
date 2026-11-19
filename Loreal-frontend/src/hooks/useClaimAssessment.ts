import { useCallback, useState } from "react";

import { assessClaimWithPdf } from "../services/claimsApi";
import type { AssessClaimUploadRequest, Assessment } from "../types/assessment";

export const useClaimAssessment = () => {
  const [result, setResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assess = useCallback(async (request: AssessClaimUploadRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await assessClaimWithPdf(request));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, assess };
};
