import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="breadcrumb-item">
            {item.path && !isLast ? <Link to={item.path}>{item.label}</Link> : <span>{item.label}</span>}
            {!isLast ? <ChevronRight size={14} aria-hidden /> : null}
          </span>
        );
      })}
    </nav>
  );
}
