import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useRazorpaySubscribe } from "@/hooks/useRazorpaySubscribe";
import { api } from "@/services/api";
import type { ProductDetail } from "@/types";
import "./ProductDetailPage.css";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasActiveSubscription } = useAuth();
  const { subscribe } = useRazorpaySubscribe();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!slug) return;
    api
      .getProductDetail(slug)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSubscribing(true);
    setMessage("");
    try {
      const result = await subscribe("monthly");
      if ("success" in result) {
        setMessage("Subscription activated! Welcome to IT Employeez.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHero title="Loading..." breadcrumbs={[{ label: "Home", path: "/" }, { label: "IT Products", path: "/it-apps" }]} />
        <section className="section"><div className="container"><Skeleton className="detail-skeleton" /></div></section>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <PageHero title="Not Found" breadcrumbs={[{ label: "Home", path: "/" }]} />
        <section className="section"><div className="container"><p>Product not found.</p></div></section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={detail.title}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "IT Products", path: "/it-apps" },
          { label: detail.title },
        ]}
      />

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-gallery">
            <img src={detail.image_url} alt={detail.title} className="detail-main-image" />
            {detail.gallery_urls.length > 1 ? (
              <div className="detail-thumbs">
                {detail.gallery_urls.map((url) => (
                  <img key={url} src={url} alt="" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="detail-info">
            <Card>
              <h2>{detail.title}</h2>
              <p>{detail.description}</p>

              {hasActiveSubscription ? (
                <p className="detail-active">✓ Your membership is active</p>
              ) : (
                <Button variant="accent" size="lg" loading={subscribing} onClick={handleSubscribe}>
                  Subscribe Now
                </Button>
              )}

              {message ? <p className="detail-message">{message}</p> : null}
            </Card>

            <Card className="member-promo">
              <h3>Join the IT Employeez Community</h3>
              <p>Get full access to resources, career tools, and peer support.</p>
              <Link to="/signup">Create your account →</Link>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
