import axios from "axios";

import { API_TIMEOUT_MS } from "../constants";
import type { AssessClaimRequest, AssessClaimUploadRequest, Assessment } from "../types/assessment";
import { toError } from "./apiError";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: API_TIMEOUT_MS,
});

client.interceptors.response.use(undefined, (err) => Promise.reject(toError(err)));

export async function assessClaimWithPdf({ productName, claim, file }: AssessClaimUploadRequest): Promise<Assessment> {
  const body = new FormData();
  body.append("productName", productName);
  body.append("claim", claim);
  body.append("file", file);
  const { data } = await client.post<Assessment>("/claims/assess", body);
  return data;
}

export async function assessClaim(request: AssessClaimRequest): Promise<Assessment> {
  const { data } = await client.post<Assessment>("/claims/assess", request);
  return data;
}
