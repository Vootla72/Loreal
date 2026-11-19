import { memo } from "react";
import { LoaderCircle } from "lucide-react";

export const LoadingState = memo(function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <div className="loading-title">
        <LoaderCircle className="spin" size={22} aria-hidden="true" />
        <strong>Assessing the clinical study…</strong>
      </div>
      <p className="muted">The AI is checking the claim against the evidence. This usually takes a few seconds.</p>

      <div className="skeleton" aria-hidden="true">
        <span className="skeleton-line short" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line medium" />
      </div>
    </div>
  );
});
