import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageToolbar } from "@/components/layout/PageToolbar";
import { Button } from "@/components/ui/Button";
import { MockRazorpayModal } from "@/components/payment/MockRazorpayModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRazorpaySubscribe } from "@/hooks/useRazorpaySubscribe";
import { api } from "@/services/api";
import type { ProductDetail } from "@/types";
import "./SubscriptionCheckoutPage.css";
import "@/components/ui/BackLink.css";

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

export function SubscriptionCheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { subscribe, mockCheckout, cancelMock, finishMockSuccess, userEmail } = useRazorpaySubscribe();
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
    if (!slug) return;
    setSubscribing(true);
    setMessage("");
    try {
      const result = await subscribe(slug, "yearly");
      if ("needsLogin" in result) {
        navigate(`/login?returnTo=${encodeURIComponent(`/subscription-checkout/${slug}`)}`);
        return;
      }
      if ("cancelled" in result) {
        setMessage("Payment cancelled.");
        return;
      }
      navigate(`/community-subscribe?product=${encodeURIComponent(slug)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  const productPath = slug ? `/product-details/${encodeURIComponent(slug)}` : "/it-apps";
  const companyPath = detail?.category_id ? `/product/${detail.category_id}` : "/it-apps";

  if (loading) {
    return (
      <div className="checkout-page-wrap">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: "Checkout" },
          ]}
          backFallback={productPath}
        />
        <section className="section checkout-page">
          <div className="container">
            <Skeleton className="checkout-skeleton" />
          </div>
        </section>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="checkout-page-wrap">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: "Not found" },
          ]}
          backFallback="/it-apps"
        />
        <section className="section checkout-page">
          <div className="container">
            <p>Product not found.</p>
            <Link to="/it-apps">Browse IT Products</Link>
          </div>
        </section>
      </div>
    );
  }

  const periodLabel = detail.billing_period === "yearly" ? "Year" : "Month";

  return (
    <>
      <div className="checkout-page-wrap">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: detail.category_name || "Company", path: companyPath },
            { label: detail.title, path: productPath },
            { label: "Checkout" },
          ]}
          backFallback={productPath}
        />

        <section className="section checkout-page">
          <div className="container checkout-wrap">
            <h1 className="checkout-title">
              <span className="checkout-title-bar" />
              Plan Subscriptions
            </h1>

            <div className="checkout-card">
              <div className="checkout-product-image">
                <img src={detail.image_url} alt={detail.title} />
              </div>
              <div className="checkout-product-info">
                <p className="checkout-pay-label">Pay Now</p>
                <p className="checkout-price">
                  {formatPrice(detail.price_paise)} / {periodLabel}
                </p>
                <p className="checkout-for">For {detail.title}</p>
                <Button
                  variant="primary"
                  size="lg"
                  loading={subscribing}
                  className="checkout-subscribe-btn"
                  onClick={handleSubscribe}
                >
                  Subscribe Now
                </Button>
                {message ? <p className="checkout-message">{message}</p> : null}
              </div>
            </div>
          </div>
        </section>
      </div>

      {mockCheckout ? (
        <MockRazorpayModal
          checkout={mockCheckout}
          userEmail={userEmail}
          onSuccess={finishMockSuccess}
          onClose={cancelMock}
        />
      ) : null}
    </>
  );
}
