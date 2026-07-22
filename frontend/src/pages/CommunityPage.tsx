import { Link } from "react-router-dom";
import { Lock, Users, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PricingCard } from "@/components/ui/PricingCard";
import { useAuth } from "@/hooks/useAuth";
import "./CommunityPage.css";

const PREVIEW_ITEMS = [
  { icon: MessageSquare, label: "Discussions" },
  { icon: BookOpen, label: "Exclusive Resources" },
  { icon: Users, label: "Peer Support" },
];

export function CommunityPage() {
  const { isAuthenticated, hasActiveSubscription, user } = useAuth();

  return (
    <>
      <section className="community-banner">
        <div className="community-banner-overlay">
          <div className="container">
            <span className="mono-label">Members Only</span>
            <h1>IT Communities</h1>
            <p>Connect, collaborate, and grow with fellow IT professionals.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container community-content">
          {!isAuthenticated ? (
            <Card className="gate-card">
              <Lock size={40} className="gate-icon" />
              <h2>Please Login/Signup to access IT Communities</h2>
              <p>Join IT Employeez to unlock discussions, webinars, and exclusive member resources.</p>

              <div className="gate-preview">
                {PREVIEW_ITEMS.map((item) => (
                  <div key={item.label} className="gate-preview-item blurred">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="gate-actions">
                <Link to="/login"><Button variant="primary">Login</Button></Link>
                <Link to="/signup"><Button variant="accent">Create Account</Button></Link>
              </div>
            </Card>
          ) : !hasActiveSubscription ? (
            <div className="community-subscribe">
              <Card className="gate-card">
                <h2>Welcome, {user?.name}!</h2>
                <p>Subscribe to unlock full access to IT Communities.</p>
              </Card>
              <PricingCard />
            </div>
          ) : (
            <Card className="community-hub">
              <h2>Welcome back, {user?.name}!</h2>
              <p className="community-status">✓ Your membership is active</p>
              <div className="hub-grid">
                <div className="hub-item">
                  <MessageSquare size={24} />
                  <h3>Discussions</h3>
                  <p>Connect with peers on tech challenges and trends.</p>
                </div>
                <div className="hub-item">
                  <BookOpen size={24} />
                  <h3>Resources</h3>
                  <p>Access exclusive tutorials, tools, and best practices.</p>
                </div>
                <div className="hub-item">
                  <Users size={24} />
                  <h3>Networking</h3>
                  <p>Build your professional network in the IT community.</p>
                </div>
              </div>
              <Link to="/cancel-policies" className="manage-link">Manage subscription / cancellation policy</Link>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
