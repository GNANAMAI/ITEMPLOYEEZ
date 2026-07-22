import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import type { Service } from "@/types";
import "./ServicesPage.css";

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getServices()
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        title="Our Services"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Our Services" }]}
      />

      <section className="services-section-live">
        <div className="container">
          {loading ? (
            <div className="services-live-grid">
              <Skeleton className="service-skeleton" />
              <Skeleton className="service-skeleton" />
            </div>
          ) : services.length === 0 ? (
            <p className="services-empty">Unable to load services. Please ensure the API is running.</p>
          ) : (
            <div className="services-live-grid">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
