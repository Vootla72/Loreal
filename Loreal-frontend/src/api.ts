import type { AssessClaimRequest, Assessment } from "./types/assessment";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/** Calls POST /api/claims/assess and returns the saved assessment. */
export async function assessClaim(request: AssessClaimRequest): Promise<Assessment> {
  const response = await fetch(`${BASE_URL}/claims/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as Assessment;
}
