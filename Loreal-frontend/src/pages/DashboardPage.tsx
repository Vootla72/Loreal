
import {StatsCard} from "../components/StatsCard";
import type { Claim } from "../types/claim";
import type { Product } from "../types/product";

interface DashboardPageProps {
  products: Product[];
  claims: Claim[];
}

export const DashboardPage = ({
  products,
  claims,
}: DashboardPageProps) => {
  const pendingCount = claims.filter(
    (claim) => claim.status === "Pending"
  ).length;

  const approvedCount = claims.filter(
    (claim) => claim.status === "Approved"
  ).length;

  const scientistCount = claims.filter(
    (claim) => claim.status === "Sent to Scientist"
  ).length;

  return (
    <>
      <h2>Dashboard Overview</h2>

      <section className="stats">
        <StatsCard title="Total Products" count={products.length} />

        <StatsCard title="Total Claims" count={claims.length} />

        <StatsCard title="Pending Claims" count={pendingCount} />

        <StatsCard title="Approved Claims" count={approvedCount} />
      </section>

      <section className="claims-section">
        <h2>Workflow Summary</h2>

        <p>Claims waiting for Manager Review: {pendingCount}</p>
        <p>Claims sent to Scientist: {scientistCount}</p>
        <p>Approved Claims: {approvedCount}</p>
      </section>
    </>
  );
};

