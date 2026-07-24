import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { RazorpayCheckout } from "@/types";
import "./MockRazorpayModal.css";

type Step = "contact" | "payment" | "processing" | "success";

interface MockRazorpayModalProps {
  checkout: RazorpayCheckout;
  userEmail?: string;
  onSuccess: () => void;
  onClose: () => void;
}

function formatAmount(paise?: number) {
  if (!paise) return "₹99";
  return `₹${(paise / 100).toFixed(0)}`;
}

export function MockRazorpayModal({ checkout, userEmail, onSuccess, onClose }: MockRazorpayModalProps) {
  const [step, setStep] = useState<Step>("contact");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(userEmail || "test@example.com");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const amount = formatAmount(checkout.amount_paise);
  const productTitle = checkout.product_title || "Community Membership";

  const handleContinue = () => {
    if (!mobile.trim()) return;
    setStep("payment");
  };

  const handlePay = () => {
    setStep("processing");
    window.setTimeout(() => {
      setStep("success");
      window.setTimeout(onSuccess, 1200);
    }, 1800);
  };

  return (
    <div className="mock-rzp-overlay" role="dialog" aria-modal="true" aria-label="Razorpay checkout">
      <div className="mock-rzp-backdrop" onClick={onClose} aria-hidden />
      <div className="mock-rzp-modal">
        <div className="mock-rzp-test-badge">Test Mode</div>
        <button type="button" className="mock-rzp-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="mock-rzp-layout">
          <aside className="mock-rzp-sidebar">
            <div className="mock-rzp-brand">
              <span className="mock-rzp-brand-icon">IT</span>
              <div>
                <strong>IT Employeez</strong>
                <span>{productTitle}</span>
              </div>
            </div>
            <div className="mock-rzp-summary">
              <p className="mock-rzp-summary-label">Price Summary</p>
              <p className="mock-rzp-amount">{amount}</p>
            </div>
            <div className="mock-rzp-user-chip">
              Using as {email || "test@example.com"}
            </div>
            <p className="mock-rzp-secured">Secured by Razorpay</p>
          </aside>

          <div className="mock-rzp-main">
            {step === "contact" ? (
              <div className="mock-rzp-contact">
                <h3>Contact details</h3>
                <p>Enter mobile &amp; email to continue</p>
                <label>
                  Mobile number
                  <div className="mock-rzp-phone-row">
                    <span>+91</span>
                    <input
                      type="tel"
                      placeholder="Mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button type="button" className="mock-rzp-primary-btn" onClick={handleContinue}>
                  Continue
                </button>
              </div>
            ) : null}

            {step === "payment" ? (
              <div className="mock-rzp-payment">
                <h3>Payment Options</h3>
                <div className="mock-rzp-methods">
                  <button type="button" className="mock-rzp-method active">UPI</button>
                  <button type="button" className="mock-rzp-method">Cards</button>
                  <button type="button" className="mock-rzp-method">Netbanking</button>
                </div>
                <div className="mock-rzp-qr">
                  <div className="mock-rzp-qr-box" aria-hidden />
                  <p>Scan QR to pay {amount}</p>
                </div>
                <button type="button" className="mock-rzp-primary-btn" onClick={handlePay}>
                  Pay {amount}
                </button>
                <p className="mock-rzp-demo-note">
                  Demo checkout — configure Razorpay keys in .env for live payments.
                </p>
              </div>
            ) : null}

            {step === "processing" ? (
              <div className="mock-rzp-processing">
                <div className="mock-rzp-spinner" />
                <h3>Confirming Payment</h3>
                <p>This will only take a few seconds.</p>
              </div>
            ) : null}

            {step === "success" ? (
              <div className="mock-rzp-success">
                <div className="mock-rzp-success-icon">✓</div>
                <h3>Payment Successful</h3>
                <p>Redirecting to your community...</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
