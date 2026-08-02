import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import type { Service } from "@/types";

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getService(slug).then(setService).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero title="Loading..." breadcrumbs={[{ label: "Home", path: "/" }, { label: "Services", path: "/services" }]} />
        <section className="section"><div className="container"><Skeleton style={{ height: 200 }} /></div></section>
      </>
    );
  }

  if (!service) {
    return (
      <>
        <PageHero
          title="Not Found"
          breadcrumbs={[
            { label: "Home", path: "/" },
            { label: "Services", path: "/services" },
            { label: "Not Found" },
          ]}
        />
        <section className="section">
          <div className="container">
            <p>Service not found.</p>
            <Link to="/services">
              <Button variant="primary">Back to Services</Button>
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={service.title}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Services", path: "/services" },
          { label: service.title },
        ]}
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <Card>
            <h2>{service.title}</h2>
            <p>{service.content}</p>
          </Card>

          <div style={{ marginTop: "2rem", textAlign: "center", display: "grid", gap: "0.75rem", justifyItems: "center" }}>
            <p style={{ margin: 0, color: "var(--color-text-muted)", maxWidth: 420 }}>
              Next step: browse IT Products, subscribe to a community, then unlock member discussions.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/it-apps">
                <Button variant="accent" size="lg">Browse IT Products</Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="lg">All Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
