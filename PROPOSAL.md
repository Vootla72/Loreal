# Claims Intelligence Engine: Technical Proposal

## 1. Business process understanding

A cosmetic claim ("Reduces wrinkles by 20% in 4 weeks") is a regulated promise. In the EU, Regulation 1223/2009 and the common criteria of Regulation 655/2013 require every claim to be truthful and supported by adequate evidence. The workflow therefore passes through four roles, each acting as a gate:

| Step | Role | Decision | Status after |
|---|---|---|---|
| 1 | Business team | Proposes a product and its candidate claims | Pending |
| 2 | Claim manager | Is the claim applicable (fits product, market, regulation) and feasible (testable, affordable)? | Sent to Scientist / Rejected |
| 3 | R&I scientist | Runs the formulation test and records the result | Ready for Evaluation / Rejected |
| 4 | Evaluator | Attaches clinical study results; the AI checks they justify the claim; evaluator approves or rejects | Approved / Evaluation Rejected |

The AI does not replace the evaluator. It gives a fast, consistent first opinion (verdict, confidence, reasoning, evidence gaps) and the human makes the final, accountable decision. The Approve button is disabled until an assessment exists.

The key failure modes the AI must catch are mismatches between claim and evidence:
- **Endpoint**: self-assessed "smoother skin" does not prove measured wrinkle depth.
- **Magnitude**: a 14% reduction does not support "20%".
- **Timeframe**: a week-8 result does not support "in 4 weeks".
- **Design**: no control, tiny panel, or no statistical significance.

## 2. Research performed

- **Regulation.** EU 655/2013 common criteria (legal compliance, truthfulness, evidential support, honesty, fairness, informed decision-making) are encoded directly in the system prompt so the model reasons the way a claims reviewer would.
- **Substantiation methods.** Typical instrumental endpoints were reviewed: profilometry for wrinkles, corneometry for hydration, SPF in-vivo testing. The prompt asks the model to compare endpoint, magnitude, timeframe and design explicitly.
- **LLM output reliability.** OpenAI Structured Outputs (`response_format: json_schema`, `strict: true`) guarantees a parseable response with exactly `isJustified`, `confidenceScore`, `reasoning`, `gaps`. Temperature 0 gives repeatable verdicts.
- **Prompt injection.** Evidence is untrusted text, so it is wrapped in `<evidence>` tags and the system prompt tells the model to treat it as data only.
- **Stack choices.** Prisma was chosen over TypeORM for its typed client, declarative schema and first-class migrations. NestJS gives modules, dependency injection and DTO validation out of the box.

## 3. Technical architecture

```mermaid
flowchart LR
  UI[React + Vite UI] -- REST /api --> API[NestJS API]
  API -- ValidationPipe DTOs --> SVC[ClaimsService]
  SVC -- Prisma --> DB[(PostgreSQL)]
  SVC --> LLM[LlmService]
  LLM -- Structured Outputs --> OAI[OpenAI]
  LLM -. no API key .-> MOCK[Offline mock assessor]
```

**Data model.** `Product 1—n Claim 1—n Assessment`.
- `Claim` holds the workflow status as an enum plus the fields each role fills in.
- `Assessment` is append-only history. Each row stores the evidence, verdict, confidence, reasoning, gaps, model id, prompt version and latency. This gives an audit trail of which model and prompt produced which decision, which matters for regulated claims.

**Request flow for `POST /api/claims/assess`.**
1. DTO validation rejects bad input (`claimId` integer, evidence 20 to 20,000 chars, unknown fields refused).
2. The service loads the claim and product, and refuses unless the status is Ready for Evaluation.
3. The LLM service builds the prompt, including the scientist's test summary, and calls OpenAI with a 30-second timeout and two retries.
4. The verdict is clamped, persisted, and returned to the UI. OpenAI failures become a clean 502.

**Why this design.**
- The LLM sits behind its own service, so the provider or model can change through config (`OPENAI_MODEL`) without touching business logic.
- The mock assessor lets the whole flow run in demos, tests and CI without a key or cost.
- Labels ("Ready for Evaluation") live only at the API edge; the database stores stable enum values.
- The frontend talks to one typed API client (`src/api.ts`), and the Vite proxy avoids CORS in development.

## 4. Product roadmap

**Next (weeks)**
- Authentication and role-based access (SSO via Azure AD), so only evaluators can assess or approve.
- Upload study PDFs; extract text server-side and cite the passages the verdict relies on.
- Status-transition rules enforced in the backend as a state machine, with an audit log of who changed what.
- Automated tests: unit tests for the service, contract tests for the API, and a golden set of claim/evidence pairs to regression-test prompt changes.

**Later (months)**
- Retrieval over L'Oréal's historical studies and regulatory guidance (RAG), so the model compares against precedent.
- Multi-market rules: EU, US FTC/FDA, China NMPA. One claim, a verdict per market.
- Ensemble or second-model review for low-confidence verdicts, routed to a senior evaluator.
- Claim wording suggestions: "Evidence supports 15% in 4 weeks; consider rewording."
- Async processing with a queue for long documents, and streaming progress to the UI.

**Vision**
- A claims knowledge graph linking ingredients, formulas, studies and approved claims across brands.
- Predict claim feasibility before a study is commissioned, saving test budget.
- Continuous monitoring: re-check live claims automatically when regulations or new study data change.
- Evaluation dashboards tracking AI-versus-human agreement over time, to calibrate confidence scores.

## Appendix: React component (JSX)

A simplified, dependency-free version of the component. The full TypeScript version used in the app is `Loreal-frontend/src/components/ClaimAssessment.tsx`.

```jsx
import { useState } from "react";

export function ClaimAssessment({ claimId, claimText }) {
  const [evidence, setEvidence] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/claims/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, evidence }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Assessment failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h3>Does the study justify “{claimText}”?</h3>

      <form onSubmit={handleSubmit}>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Paste clinical study results…"
          required
        />
        <button type="submit" disabled={loading || evidence.trim().length < 20}>
          {loading ? "Assessing…" : "Run AI Assessment"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {result && (
        <div aria-live="polite">
          <p><strong>Justified:</strong> {result.isJustified ? "Yes" : "No"}</p>
          <p><strong>Confidence Score:</strong> {Math.round(result.confidenceScore * 100)}%</p>
          <p><strong>Reasoning:</strong> {result.reasoning}</p>
        </div>
      )}
    </section>
  );
}
```
