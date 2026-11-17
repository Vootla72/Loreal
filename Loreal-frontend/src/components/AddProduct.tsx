
import { useState } from "react";
import type { Product } from "../types/product";

interface AddProductProps {
  onAddProduct: (product: Omit<Product, "id">) => Promise<void>;
}

export const AddProduct = ({ onAddProduct }: AddProductProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onAddProduct({ name, description, category });
    } catch {
      return; // error is shown in the app banner; keep the form filled in
    }

    setName("");
    setDescription("");
    setCategory("");
  };

  return (
    <section className="form-section">
      <h2>Add New Product</h2>

      <form onSubmit={handleSubmit}>
        <label>Product Name</label>
        <input
          type="text"
          placeholder="Enter product name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          placeholder="Enter product description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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

        <button type="submit">Add Product</button>
      </form>
    </section>
  );
};

