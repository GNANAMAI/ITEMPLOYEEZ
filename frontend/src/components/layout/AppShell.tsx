import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { withReturnTo } from "@/utils/navigation";
import "./AppShell.css";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAdmin =
    location.pathname.startsWith("/admin") || location.pathname.startsWith("/sub-admin");
  const isAuthPage = ["/login", "/signup", "/candidate/forgot-password"].includes(
    location.pathname,
  );
  const showHomeCta = location.pathname === "/";
  const showCommunityCta = location.pathname === "/community-subscribe" && !isAuthenticated;
  const communityReturn = "/community-subscribe" + location.search;

  if (isAdmin) {
    return <div className="app-shell admin-shell">{children}</div>;
  }

  return (
    <div className={`app-shell ${isAuthPage ? "auth-shell" : ""}`}>
      <TopNav />
      <main className="app-main">{children}</main>
      {!isAuthPage ? <Footer /> : null}
      <FloatingContact />
      {showHomeCta ? (
        <div className="mobile-sticky-cta">
          <Link to={withReturnTo("/signup", "/it-apps")}>
            <Button variant="accent" size="sm">
              Join
            </Button>
          </Link>
          <Link to="/it-apps">
            <Button variant="primary" size="sm">
              Products
            </Button>
          </Link>
        </div>
      ) : null}
      {showCommunityCta ? (
        <div className="mobile-sticky-cta">
          <Link to={withReturnTo("/login", communityReturn)}>
            <Button variant="primary" size="sm">
              Login
            </Button>
          </Link>
          <Link to={withReturnTo("/signup", communityReturn)}>
            <Button variant="accent" size="sm">
              Sign Up
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
