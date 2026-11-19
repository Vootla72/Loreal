import axios from "axios";

import { MAX_PDF_MB } from "../constants";

interface NestError {
  message?: string | string[];
}

export function toError(err: unknown): Error {
  if (!axios.isAxiosError<NestError>(err)) return err instanceof Error ? err : new Error("Unexpected error");

  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return new Error("The assessment took too long. Please try again.");
  }
  if (!err.response) return new Error("Could not reach the Claims API. Is the backend running?");

  if (err.response.status === 413) return new Error(`The PDF is larger than ${MAX_PDF_MB} MB.`);

  const message = err.response.data?.message;
  if (Array.isArray(message)) return new Error(message.join(", "));
  return new Error(message || `Request failed (${err.response.status})`);
}
