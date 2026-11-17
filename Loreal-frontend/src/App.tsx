import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { Layout } from "./components/Layout";

import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ClaimsPage } from "./pages/ClaimsPage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { EvaluatorPage } from "./pages/EvaluatorPage";

import { api } from "./api";
import type { ClaimUpdate, NewClaim } from "./api";
import type { Assessment } from "./types/assessment";
import type { Claim } from "./types/claim";
import type { Product } from "./types/product";

import "./App.css";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  // Load products and claims from the API; re-runs when the user clicks Retry.
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getProducts(), api.getClaims()])
      .then(([productList, claimList]) => {
        if (cancelled) return;
        setProducts(productList);
        setClaims(claimList);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(`Could not reach the Claims API. ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const loadData = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const replaceClaim = (updated: Claim) =>
    setClaims((previous) => previous.map((claim) => (claim.id === updated.id ? updated : claim)));

  const runAction = async (action: () => Promise<void>) => {
    try {
      setError(null);
      await action();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const handleAddProduct = (product: Omit<Product, "id">) =>
    runAction(async () => {
      const created = await api.createProduct(product);
      setProducts((previous) => [...previous, created]);
    });

  const handleAddClaim = (claim: NewClaim) =>
    runAction(async () => {
      const created = await api.createClaim(claim);
      setClaims((previous) => [...previous, created]);
    });

  const handleUpdateClaim = (id: number, updates: ClaimUpdate) =>
    runAction(async () => replaceClaim(await api.updateClaim(id, updates)));

  const handleReview = (id: number) => {
    const claim = claims.find((c) => c.id === id);
    if (claim?.status === "Pending") {
      void handleUpdateClaim(id, { status: "Under Review" }).catch(() => undefined);
    }
  };

  const handleAssessed = (assessment: Assessment) =>
    setClaims((previous) =>
      previous.map((claim) =>
        claim.id === assessment.claimId ? { ...claim, latestAssessment: assessment } : claim,
      ),
    );

  return (
    <>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadData}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading claims…</p>
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage products={products} claims={claims} />} />
            <Route
              path="/products"
              element={<ProductsPage products={products} onAddProduct={handleAddProduct} />}
            />
            <Route
              path="/claims"
              element={
                <ClaimsPage
                  products={products}
                  claims={claims}
                  onAddClaim={handleAddClaim}
                  onReview={handleReview}
                  onUpdateClaim={handleUpdateClaim}
                />
              }
            />
            <Route
              path="/assessment"
              element={<AssessmentPage claims={claims} onSubmitAssessment={handleUpdateClaim} />}
            />
            <Route
              path="/evaluator"
              element={
                <EvaluatorPage
                  claims={claims}
                  onUpdateClaim={handleUpdateClaim}
                  onAssessed={handleAssessed}
                />
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
