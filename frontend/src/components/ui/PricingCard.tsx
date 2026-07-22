import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useRazorpaySubscribe } from "@/hooks/useRazorpaySubscribe";
import "./PricingCard.css";

const FEATURES = [
  "Access to IT Communities",
  "Exclusive resources & tutorials",
  "Career advancement tools",
  "17 IT product categories",
  "Webinars & peer support",
  "Job boards & workshops",
];

export function PricingCard() {
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { isAuthenticated, hasActiveSubscription } = useAuth();
  const { subscribe } = useRazorpaySubscribe();

  const handleSubscribe = async () => {
    setMessage("");
    setLoading(true);
    try {
      const result = await subscribe(planType);
      if ("needsLogin" in result && result.needsLogin) {
        setMessage("Please create an account or log in first.");
      } else if ("success" in result) {
        setMessage("Subscription activated successfully!");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="pricing-card">
      <div className="pricing-toggle">
        <button
          type="button"
          className={planType === "monthly" ? "active" : ""}
          onClick={() => setPlanType("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={planType === "yearly" ? "active" : ""}
          onClick={() => setPlanType("yearly")}
        >
          Yearly <span className="save-badge">Save 20%</span>
        </button>
      </div>

      <div className="pricing-header">
        <span className="mono-label">IT Employeez Membership</span>
        <h3>{planType === "monthly" ? "Monthly Plan" : "Yearly Plan"}</h3>
        <p className="pricing-note">Full access to communities, resources, and career tools.</p>
      </div>

      <ul className="pricing-features">
        {FEATURES.map((feature) => (
          <li key={feature}>
            <Check size={16} /> {feature}
          </li>
        ))}
      </ul>

      {hasActiveSubscription ? (
        <p className="pricing-active">Your membership is active.</p>
      ) : (
        <>
          {!isAuthenticated ? (
            <p className="pricing-login-hint">
              <Link to="/signup">Create a free account</Link> or <Link to="/login">log in</Link> to subscribe.
            </p>
          ) : null}
          <Button variant="accent" size="lg" loading={loading} onClick={handleSubscribe} className="pricing-cta">
            Subscribe with Razorpay
          </Button>
        </>
      )}

      <p className="pricing-refund">
        <Shield size={14} /> 15-day money-back guarantee. See{" "}
        <Link to="/cancel-policies">cancellation policy</Link>.
      </p>

      {message ? <p className="pricing-message">{message}</p> : null}
    </Card>
  );
}
