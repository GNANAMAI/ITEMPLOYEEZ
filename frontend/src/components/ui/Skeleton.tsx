import "./Skeleton.css";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function ProductGridSkeleton() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="skeleton-tile" />
      ))}
    </div>
  );
}
