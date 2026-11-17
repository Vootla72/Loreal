
import { useState } from "react";
import type { FormEvent } from "react";

import type { Product } from "../types/product";
import type { NewClaim } from "../api";

interface AddClaimProps {
  products: Product[];
  onAddClaim: (claim: NewClaim) => Promise<void>;
}

export const AddClaim = ({ products, onAddClaim }: AddClaimProps) => {
  const [productId, setProductId] = useState<number | "">("");
  const [claimText, setClaimText] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (productId === "") return;

    try {
      await onAddClaim({ productId, claim: claimText, category });
    } catch {
      return; // error is shown in the app banner; keep the form filled in
    }

    setProductId("");
    setClaimText("");
    setCategory("");
  };

  return (
    <section className="form-section">
      <h2>Propose New Claim</h2>

      <form onSubmit={handleSubmit}>
        <label>Select Product</label>

        <select
          value={productId}
          onChange={(event) =>
            setProductId(
              event.target.value === ""
                ? ""
                : Number(event.target.value)
            )
          }
          required
        >
          <option value="">Select product</option>

          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <label>Proposed Claim</label>

        <textarea
          placeholder="Enter proposed product claim"
          value={claimText}
          onChange={(event) => setClaimText(event.target.value)}
          required
        />

        <label>Category</label>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="Anti-aging">Anti-aging</option>
          <option value="Hydration">Hydration</option>
          <option value="Sun Protection">Sun Protection</option>
          <option value="Skincare">Skincare</option>
        </select>

        <button type="submit" disabled={products.length === 0}>
          Submit Claim
        </button>

        {products.length === 0 && (
          <p>Please add a product before proposing a claim.</p>
        )}
      </form>
    </section>
  );
};

