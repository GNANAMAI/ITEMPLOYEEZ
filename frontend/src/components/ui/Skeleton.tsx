import type { CSSProperties } from "react";
import "./Skeleton.css";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden />;
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
