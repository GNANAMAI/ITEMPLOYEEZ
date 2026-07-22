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
        <PageHero title="Not Found" breadcrumbs={[{ label: "Home", path: "/" }]} />
        <section className="section"><div className="container"><p>Service not found.</p></div></section>
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

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link to="/#pricing">
              <Button variant="accent" size="lg">Subscribe to Access</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
