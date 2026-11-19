import { useClaimAssessment } from "../hooks/useClaimAssessment";
import { AssessmentResult } from "./AssessmentResult";
import { ClaimForm } from "./ClaimForm";

export const ClaimAssessment = () => {
  const { result, loading, error, assess } = useClaimAssessment();

  return (
    <div className="assessment-layout">
      <ClaimForm loading={loading} onSubmit={assess} />
      <AssessmentResult result={result} error={error} loading={loading} />
    </div>
  );
};
