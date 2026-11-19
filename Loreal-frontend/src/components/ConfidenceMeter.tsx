import { memo, useMemo } from "react";

import { CONFIDENCE_HIGH, CONFIDENCE_MEDIUM } from "../constants";

export const ConfidenceMeter = memo(function ConfidenceMeter({ score }: { score: number }) {
  const { pct, level } = useMemo(
    () => ({
      pct: Math.round(score * 100),
      level: score >= CONFIDENCE_HIGH ? "high" : score >= CONFIDENCE_MEDIUM ? "medium" : "low",
    }),
    [score],
  );

  return (
    <div className="confidence">
      <dt className="metric-label">Confidence Score</dt>
      <dd className="metric-value">{pct}%</dd>
      <div
        className={`meter ${level}`}
        role="meter"
        aria-label="Confidence score"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
});
