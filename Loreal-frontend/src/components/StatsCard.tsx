
interface StatsCardProps {
  title: string;
  count: number;
}

export const StatsCard = ({ title, count }: StatsCardProps) => {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{count}</h2>
    </div>
  );
};

