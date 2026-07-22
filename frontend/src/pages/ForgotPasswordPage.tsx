import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";
import "./AuthPages.css";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.forgotPassword(email);
      setMessage(result.message);
      if (result.reset_token) {
        setToken(result.reset_token);
        setStep("reset");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.resetPassword(token, newPassword);
      setMessage("Password updated! You can now log in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-form-card auth-narrow">
        <h1>Forgot Password</h1>
        {step === "request" ? (
          <form onSubmit={handleRequest}>
            <Input label="Email address *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {error ? <p className="auth-error">{error}</p> : null}
            {message ? <p className="auth-success">{message}</p> : null}
            <Button type="submit" variant="primary" loading={loading} className="auth-submit">Send Reset Link</Button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <Input label="Reset Token *" required value={token} onChange={(e) => setToken(e.target.value)} />
            <Input label="New Password *" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {error ? <p className="auth-error">{error}</p> : null}
            {message ? <p className="auth-success">{message}</p> : null}
            <Button type="submit" variant="accent" loading={loading} className="auth-submit">Reset Password</Button>
          </form>
        )}
        <p className="auth-switch"><Link to="/login">Back to Login</Link></p>
      </Card>
    </div>
  );
}
