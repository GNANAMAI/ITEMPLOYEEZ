import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import "./AuthPages.css";
import "./SignupPage.css";

const SIGNUP_STEPS = [
  { num: "01", label: "Create your account" },
  { num: "02", label: "Explore IT products" },
  { num: "03", label: "Join the community" },
];

const SIGNUP_HIGHLIGHTS = [
  { icon: Layers, text: "Browse all IT product categories" },
  { icon: Users, text: "Connect with IT professionals" },
  { icon: ShieldCheck, text: "Secure member account" },
];

export function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    job_title: "",
    agree_terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.agree_terms) {
      setError("You must agree to the Terms of Service");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/community-subscribe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-bg" aria-hidden>
        <span className="signup-blob signup-blob-a" />
        <span className="signup-blob signup-blob-b" />
        <span className="signup-blob signup-blob-c" />
      </div>

      <div className="signup-shell">
        <header className="signup-header">
          <div className="signup-badge">
            <Sparkles size={16} />
            Free membership
          </div>
          <h1>Join IT Employeez</h1>
          <p>
            Create your account in minutes and unlock IT resources, product knowledge hubs,
            and a community built for tech professionals.
          </p>
        </header>

        <div className="signup-steps" aria-label="Membership journey">
          {SIGNUP_STEPS.map((step, index) => (
            <div key={step.num} className="signup-step">
              <span className="signup-step-num">{step.num}</span>
              <span className="signup-step-label">{step.label}</span>
              {index < SIGNUP_STEPS.length - 1 ? (
                <span className="signup-step-line" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>

        <div className="signup-form-card">
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-form-grid">
              <Input
                label="Full Name *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Email address *"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Job Title"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>

            <Input
              label="Password *"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <label className="signup-terms">
              <input
                type="checkbox"
                checked={form.agree_terms}
                onChange={(e) => setForm({ ...form, agree_terms: e.target.checked })}
              />
              <span>
                I agree with the <Link to="/terms-conditions">Terms Of Service</Link>.
              </span>
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <Button type="submit" variant="accent" loading={loading} className="signup-submit">
              Create New Account
            </Button>
          </form>

          <p className="signup-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

        <div className="signup-highlights">
          {SIGNUP_HIGHLIGHTS.map((item) => (
            <div key={item.text} className="signup-highlight">
              <item.icon size={18} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <p className="signup-footnote">
          <CheckCircle2 size={16} />
          No payment required to create your account
        </p>
      </div>
    </div>
  );
}
