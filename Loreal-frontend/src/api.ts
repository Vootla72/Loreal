import type { Assessment } from "./types/assessment";
import type { Claim } from "./types/claim";
import type { Product } from "./types/product";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export interface NewClaim {
  productId: number;
  claim: string;
  category: string;
}

export type ClaimUpdate = Partial<
  Omit<Claim, "id" | "productId" | "product" | "claim" | "category" | "latestAssessment">
>;

export const api = {
  getProducts: () => request<Product[]>("/products"),

  createProduct: (product: Omit<Product, "id">) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(product) }),

  getClaims: () => request<Claim[]>("/claims"),

  createClaim: (claim: NewClaim) =>
    request<Claim>("/claims", { method: "POST", body: JSON.stringify(claim) }),

  updateClaim: (id: number, updates: ClaimUpdate) =>
    request<Claim>(`/claims/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),

  assessClaim: (claimId: number, evidence: string) =>
    request<Assessment>("/claims/assess", {
      method: "POST",
      body: JSON.stringify({ claimId, evidence }),
    }),
};
