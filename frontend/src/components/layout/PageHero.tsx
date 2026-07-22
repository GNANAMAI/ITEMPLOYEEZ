import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/Breadcrumb";
import "./PageHero.css";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
}

export function PageHero({ title, subtitle, breadcrumbs, children }: PageHeroProps) {
  return (
    <section className="page-hero grid-bg">
      <div className="container">
        {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-hero-subtitle">{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}
