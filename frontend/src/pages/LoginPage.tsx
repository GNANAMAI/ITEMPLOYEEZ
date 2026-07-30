import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, MessageSquare, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { SAMPLE_ADMIN_CREDS } from "@/pages/admin/adminNav";
import { resolveReturnTo } from "@/utils/navigation";
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

const ADMIN_PERKS = [
  {
    icon: Shield,
    title: "Site management",
    text: "Banners, products, services, and legal pages in one place.",
  },
  {
    icon: MessageSquare,
    title: "Members & messages",
    text: "View candidates, contact submissions, and subscriptions.",
  },
  {
    icon: TrendingUp,
    title: "Business controls",
    text: "Sub-admins, pricing, and payment history.",
  },
];

function getReturnPath(searchParams: URLSearchParams) {
  return resolveReturnTo(searchParams, "/it-apps");
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, setTokens, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnTo = getReturnPath(searchParams);
  const isAdminMode = searchParams.get("mode") === "admin";

  const perks = useMemo(() => (isAdminMode ? ADMIN_PERKS : LOGIN_PERKS), [isAdminMode]);

  useEffect(() => {
    if (isAdminMode) {
      setEmail(SAMPLE_ADMIN_CREDS.email);
      setPassword(SAMPLE_ADMIN_CREDS.password);
    }
  }, [isAdminMode]);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    if (accessToken && refreshToken && !isAdminMode) {
      setTokens(accessToken, refreshToken);
      navigate(returnTo, { replace: true });
    }
  }, [searchParams, setTokens, navigate, returnTo, isAdminMode]);

  useEffect(() => {
    if (isAuthenticated && !isAdminMode) navigate(returnTo, { replace: true });
  }, [isAuthenticated, navigate, returnTo, isAdminMode]);

  const setLoginMode = (admin: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (admin) {
      next.set("mode", "admin");
    } else {
      next.delete("mode");
    }
    setSearchParams(next, { replace: true });
    setError("");
  };

  const handleMemberSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password, rememberMe);
      // Keep users in the intended flow (products → checkout → community).
      const next =
        returnTo.startsWith("/admin") ? "/it-apps" : returnTo;
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await api.adminLogin({ email, password });
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const next =
        returnTo.startsWith("/admin") ? returnTo : "/admin/dashboard";
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-brand" aria-label="IT Employeez benefits">
        <div className="login-brand-bg" aria-hidden />
        <div className="login-brand-content">
          <p className="login-brand-eyebrow">
            {isAdminMode ? "Admin portal" : "IT Employeez Community"}
          </p>
          <h2>
            {isAdminMode ? (
              <>
                Manage. <span>Control.</span>
              </>
            ) : (
              <>
                Connect. Learn. <span>Grow.</span>
              </>
            )}
          </h2>
          <p className="login-brand-lead">
            {isAdminMode
              ? "Sign in with your sub-admin account to manage site content, members, and subscriptions."
              : "Sign in to access member communities, curated IT resources, and career support built for developers, sysadmins, and tech professionals."}
          </p>

          <div className="login-perks">
            {perks.map((perk) => (
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
            {isAdminMode ? (
              <>
                <span className="code-kw">await</span> admin.login({"{"} role:{" "}
                <span className="code-str">&quot;sub_admin&quot;</span> {"}"});
                <br />
                <span className="code-kw">return</span> dashboard.access();
              </>
            ) : (
              <>
                <span className="code-kw">await</span> member.login({"{"} role:{" "}
                <span className="code-str">&quot;IT Professional&quot;</span> {"}"});
                <br />
                <span className="code-kw">return</span> community.access();
              </>
            )}
          </div>
        </div>
      </aside>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-mode-switch" role="tablist" aria-label="Login type">
            <button
              type="button"
              role="tab"
              aria-selected={!isAdminMode}
              className={`login-mode-btn${!isAdminMode ? " active" : ""}`}
              onClick={() => setLoginMode(false)}
            >
              Member login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isAdminMode}
              className={`login-mode-btn${isAdminMode ? " active" : ""}`}
              onClick={() => setLoginMode(true)}
            >
              Admin login
            </button>
          </div>

          <p className="login-form-eyebrow">{isAdminMode ? "Sub-admin access" : "Welcome back"}</p>
          <h1>{isAdminMode ? "Log in as admin" : "Log in"}</h1>
          <p className="login-form-sub">
            {isAdminMode
              ? "Use your sub-admin credentials to open the management dashboard."
              : "Access your dashboard, communities, and member resources."}
          </p>

          <Card className="login-form-card">
            <form onSubmit={isAdminMode ? handleAdminSubmit : handleMemberSubmit}>
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
              {!isAdminMode ? (
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
              ) : null}
              {error ? <p className="auth-error">{error}</p> : null}
              <Button type="submit" variant="primary" loading={loading} className="auth-submit">
                {isAdminMode ? "Login to admin dashboard" : "Login"}
              </Button>
            </form>

            {isAdminMode ? (
              <p className="login-admin-hint">
                Default (dev): <code>{SAMPLE_ADMIN_CREDS.email}</code> /{" "}
                <code>{SAMPLE_ADMIN_CREDS.password}</code>
              </p>
            ) : (
              <>
                <p className="auth-switch">
                  Not registered yet?{" "}
                  <Link to={`/signup?returnTo=${encodeURIComponent(returnTo)}`}>Sign Up</Link>
                </p>

                <div className="auth-divider">or continue with</div>
                <a href={GOOGLE_AUTH_URL} className="google-btn">
                  <img src="https://www.google.com/favicon.ico" alt="" width={18} height={18} />
                  Continue with Google
                </a>
              </>
            )}

            <p className="auth-switch login-mode-foot">
              {isAdminMode ? (
                <>
                  Back to{" "}
                  <button type="button" className="login-inline-link" onClick={() => setLoginMode(false)}>
                    member login
                  </button>
                </>
              ) : (
                <>
                  Site admin?{" "}
                  <button type="button" className="login-inline-link" onClick={() => setLoginMode(true)}>
                    Login as admin
                  </button>
                </>
              )}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
