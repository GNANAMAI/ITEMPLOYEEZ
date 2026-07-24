import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import { PageToolbar } from "@/components/layout/PageToolbar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { ProductDetail } from "@/types";
import { renderRichText } from "@/utils/formatRichText";
import "./ProductDetailPage.css";
import "@/utils/formatRichText.css";
import "@/components/ui/BackLink.css";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasMembership } = useAuth();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api
      .getProductDetail(slug)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate(`/login?returnTo=${encodeURIComponent(`/product-details/${slug}`)}`);
      return;
    }
    navigate(`/subscription-checkout/${encodeURIComponent(slug!)}`);
  };

  const companyPath = detail?.category_id ? `/product/${detail.category_id}` : "/it-apps";

  if (loading) {
    return (
      <div className="product-detail-page">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: "Loading..." },
          ]}
          backFallback="/it-apps"
        />
        <section className="section">
          <div className="container">
            <Skeleton className="detail-layout-skeleton" />
          </div>
        </section>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="product-detail-page">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: "Not found" },
          ]}
          backFallback="/it-apps"
        />
        <section className="section">
          <div className="container">
            <p>Product not found.</p>
            <Link to="/it-apps">Browse IT Products</Link>
          </div>
        </section>
      </div>
    );
  }

  const hasAccess = hasMembership(detail.slug);

  return (
    <div className="product-detail-page">
      <PageToolbar
        items={[
          { label: "Home", path: "/" },
          { label: "IT Products", path: "/it-apps" },
          { label: detail.category_name || "Company", path: companyPath },
          { label: detail.title },
        ]}
        backFallback={companyPath}
      />

      <section className="section">
        <div className="container detail-pro-layout">
          <aside className="detail-pro-aside">
            {detail.category_image_url ? (
              <img src={detail.category_image_url} alt={detail.category_name || ""} className="detail-brand-logo" />
            ) : null}
            <div className="detail-product-card">
              <img src={detail.image_url} alt={detail.title} />
              <span>{detail.title}</span>
            </div>
          </aside>

          <div className="detail-pro-main">
            <header className="detail-pro-header">
              <h1>{detail.title}</h1>
              {detail.subtitle ? <p className="detail-subtitle">{detail.subtitle}</p> : null}
            </header>
            <div className="detail-description">{renderRichText(detail.description)}</div>
          </div>

          <aside className="detail-pro-member">
            <div className="member-card">
              <div className="member-card-icon">
                <Users size={28} />
              </div>
              <p>Become a member to join this IT community</p>
            </div>
            {hasAccess ? (
              <div className="member-active">
                <p>Enjoy your community membership!</p>
                <Link to={`/community-subscribe?product=${encodeURIComponent(detail.slug)}`}>
                  Go to community →
                </Link>
              </div>
            ) : (
              <>
                <p className="member-note">Subscribe to unlock discussions, resources, and peer support.</p>
                <Button variant="primary" size="lg" className="detail-subscribe-btn" onClick={handleSubscribe}>
                  Subscribe Now
                </Button>
              </>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
