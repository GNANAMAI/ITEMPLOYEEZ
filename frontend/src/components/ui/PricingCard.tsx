import { Link } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import "./PricingCard.css";

const FEATURES = [
  "Access to IT Communities",
  "Exclusive resources & tutorials",
  "Career advancement tools",
  "IT product communities",
  "Webinars & peer support",
  "Job boards & workshops",
];

export function PricingCard() {
  const { isAuthenticated, hasActiveSubscription } = useAuth();

  return (
    <Card className="pricing-card">
      <div className="pricing-header">
        <span className="mono-label">IT Employeez Membership</span>
        <h3>₹99 / Year per product</h3>
        <p className="pricing-note">Subscribe to a product community for full access.</p>
      </div>

      <ul className="pricing-features">
        {FEATURES.map((feature) => (
          <li key={feature}>
            <Check size={16} /> {feature}
          </li>
        ))}
      </ul>

      {hasActiveSubscription ? (
        <p className="pricing-active">You have active community memberships.</p>
      ) : (
        <>
          {!isAuthenticated ? (
            <p className="pricing-login-hint">
              <Link to="/signup">Create a free account</Link> or <Link to="/login">log in</Link> to subscribe.
            </p>
          ) : null}
          <Link to="/it-apps">
            <Button variant="accent" size="lg" className="pricing-cta">
              Browse IT Products
            </Button>
          </Link>
        </>
      )}

      <p className="pricing-refund">
        <Shield size={14} /> 15-day money-back guarantee. See{" "}
        <Link to="/cancel-policies">cancellation policy</Link>.
      </p>
    </Card>
  );
}
