
import {AddProduct} from "../components/AddProduct";
import type { Product } from "../types/product";

interface ProductsPageProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => Promise<void>;
}

export const ProductsPage = ({
  products,
  onAddProduct,
}: ProductsPageProps) => {
  return (
    <>
      <h2>Product Management</h2>

      <AddProduct onAddProduct={onAddProduct} />

      <section className="claims-section">
        <h2>Existing Products</h2>

        {products.map((product) => (
          <div key={product.id} className="manager-card">
            <div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <small>{product.category}</small>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

