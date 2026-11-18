import axios from "axios";

import type { AssessClaimRequest, AssessClaimUploadRequest, Assessment } from "./types/assessment";

/**
 * Shared HTTP client. The timeout sits above the backend's worst case
 * (a 30-second OpenAI call retried twice), so the UI never waits forever.
 * No fixed Content-Type: axios sends JSON for objects and multipart for FormData.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 100_000,
});

function toError(err: unknown): Error {
  if (!axios.isAxiosError(err)) return err instanceof Error ? err : new Error("Unexpected error");

  if (err.code === "ECONNABORTED") return new Error("The assessment took too long. Please try again.");
  if (!err.response) return new Error("Could not reach the Claims API. Is the backend running?");

  // NestJS errors look like { statusCode, message: string | string[] }
  const message = (err.response.data as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return new Error(message.join(", "));
  if (message) return new Error(message);
  if (err.response.status === 413) return new Error("The PDF is larger than 10 MB.");
  return new Error(`Request failed (${err.response.status})`);
}

export async function assessClaimWithPdf({ productName, claim, file }: AssessClaimUploadRequest): Promise<Assessment> {
  const body = new FormData();
  body.append("productName", productName);
  body.append("claim", claim);
  body.append("file", file);
  try {
    const { data } = await client.post<Assessment>("/claims/assess", body);
    return data;
  } catch (err) {
    throw toError(err);
  }
}

export async function assessClaim(request: AssessClaimRequest): Promise<Assessment> {
  try {
    const { data } = await client.post<Assessment>("/claims/assess", request);
    return data;
  } catch (err) {
    throw toError(err);
  }
}
