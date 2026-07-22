import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import "./AuthPages.css";
import "./LoginPage.css";

const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL;

const LOGIN_PERKS = [
  {
    icon: BookOpen,
    title: "Exclusive resources",
    text: "Tools, tutorials, and best practices for IT professionals.",
  },
  {
    icon: MessageSquare,
    title: "Member communities",
    text: "Discuss, collaborate, and learn with peers in your field.",
  },
  {
    icon: TrendingUp,
    title: "Career growth",
    text: "Workshops, job boards, and guidance to advance your career.",
  },
];

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, setTokens, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      navigate("/", { replace: true });
    }
  }, [searchParams, setTokens, navigate]);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-brand" aria-label="IT Employeez community benefits">
        <div className="login-brand-bg" aria-hidden />
        <div className="login-brand-content">
          <p className="login-brand-eyebrow">IT Employeez Community</p>
          <h2>
            Connect. Learn. <span>Grow.</span>
          </h2>
          <p className="login-brand-lead">
            Sign in to access member communities, curated IT resources, and career support built
            for developers, sysadmins, and tech professionals.
          </p>

          <div className="login-perks">
            {LOGIN_PERKS.map((perk) => (
              <div key={perk.title} className="login-perk">
                <span className="login-perk-icon">
                  <perk.icon size={20} />
                </span>
                <div>
                  <strong>{perk.title}</strong>
                  <span>{perk.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="login-terminal" aria-hidden>
            <span className="code-kw">await</span> member.login({"{"} role:{" "}
            <span className="code-str">&quot;IT Professional&quot;</span> {"}"});
            <br />
            <span className="code-kw">return</span> community.access();
          </div>
        </div>
      </aside>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <p className="login-form-eyebrow">Welcome back</p>
          <h1>Log in</h1>
          <p className="login-form-sub">Access your dashboard, communities, and member resources.</p>

          <Card className="login-form-card">
            <form onSubmit={handleSubmit}>
              <Input
                label="Email address *"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password *"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="auth-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="/candidate/forgot-password">Forgot password?</Link>
              </div>
              {error ? <p className="auth-error">{error}</p> : null}
              <Button type="submit" variant="primary" loading={loading} className="auth-submit">
                Login
              </Button>
            </form>

            <p className="auth-switch">
              Not registered yet? <Link to="/signup">Sign Up</Link>
            </p>

            <div className="auth-divider">or continue with</div>
            <a href={GOOGLE_AUTH_URL} className="google-btn">
              <img src="https://www.google.com/favicon.ico" alt="" width={18} height={18} />
              Continue with Google
            </a>
          </Card>
        </div>
      </section>
    </div>
  );
}
