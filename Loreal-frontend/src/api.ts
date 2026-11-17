import axios from "axios";

import type { AssessClaimRequest, Assessment } from "./types/assessment";

/**
 * Shared HTTP client. The timeout sits above the backend's worst case
 * (a 30-second OpenAI call retried twice), so the UI never waits forever.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 100_000,
  headers: { "Content-Type": "application/json" },
});

/** Turns any axios failure into an Error with a message the UI can show. */
function toError(err: unknown): Error {
  if (!axios.isAxiosError(err)) return err instanceof Error ? err : new Error("Unexpected error");

  if (err.code === "ECONNABORTED") return new Error("The assessment took too long. Please try again.");
  if (!err.response) return new Error("Could not reach the Claims API. Is the backend running?");

  // NestJS errors look like { statusCode, message: string | string[] }
  const message = (err.response.data as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return new Error(message.join(", "));
  return new Error(message ?? `Request failed (${err.response.status})`);
}

/** Calls POST /api/claims/assess and returns the saved assessment. */
export async function assessClaim(request: AssessClaimRequest): Promise<Assessment> {
  try {
    const { data } = await client.post<Assessment>("/claims/assess", request);
    return data;
  } catch (err) {
    throw toError(err);
  }
}
