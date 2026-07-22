import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";
import "../AuthPages.css";
import "./AdminPages.css";

export function SubAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await api.adminLogin({ email, password });
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      navigate("/sub-admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <Card className="admin-login-card">
        <span className="mono-label">Admin Dashboard</span>
        <h1>Login as Sub-Admin</h1>
        <form onSubmit={handleSubmit}>
          <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="auth-error">{error}</p> : null}
          <Button type="submit" variant="primary" loading={loading} className="auth-submit">Login</Button>
        </form>
        <p className="auth-switch"><Link to="/">← Back to site</Link></p>
      </Card>
    </div>
  );
}

export function SubAdminDashboardPage() {
  const [messages, setMessages] = useState<Array<{ name: string; email: string; message: string; subject?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getContactMessages()
      .then(setMessages)
      .catch(() => {
        setError("Unauthorized. Please log in as sub-admin.");
        navigate("/sub-admin/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/sub-admin/login");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <h1>IT Employeez: Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <h2>Contact Messages</h2>
          {loading ? <p>Loading...</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}
          {!loading && messages.length === 0 ? <p>No contact messages yet.</p> : null}
          <div className="admin-messages">
            {messages.map((msg, index) => (
              <Card key={index} className="admin-message-card">
                <strong>{msg.name}</strong> — {msg.email}
                {msg.subject ? <p className="admin-subject">Subject: {msg.subject}</p> : null}
                <p>{msg.message}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
