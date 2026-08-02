import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { withReturnTo } from "@/utils/navigation";

import "./TopNav.css";

const NAV_LINKS = [
  { label: "IT Products", path: "/it-apps" },
  { label: "IT Communities", path: "/community-subscribe" },
  { label: "Our Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const returnTo = location.pathname + location.search;
  const loginHref = withReturnTo("/login", returnTo);
  const signupHref = withReturnTo("/signup", returnTo);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  // Close dropdown when route changes
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".nav-user-menu")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="top-nav">
      <div className="container top-nav-inner">
        <Link
          to="/"
          className="logo"
          onClick={() => setMenuOpen(false)}
        >
          <span className="logo-mark">IT</span>
          <span className="logo-text">Employeez</span>
        </Link>

        <nav
          className={`nav-links ${menuOpen ? "open" : ""}`}
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="nav-mobile-actions">
            {isAuthenticated ? (
              <button
                type="button"
                className="nav-register-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to={loginHref}
                  className="nav-text-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to={signupHref}
                  className="nav-register-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Join/Signup
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="nav-user-menu">
              <button
                type="button"
                className="nav-welcome-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                Welcome, {user?.name}
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div
                  className="nav-user-dropdown"
                  role="menu"
                >
                  <Link
                    to="/it-apps"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    Browse Products
                  </Link>

                  <Link
                    to="/community-subscribe"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    My Communities
                  </Link>

                  {user?.role === "sub_admin" ? (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Admin Dashboard
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to={loginHref}
                className="nav-text-btn"
              >
                Login
              </Link>

              <Link
                to={signupHref}
                className="nav-register-btn"
              >
                Join/Signup
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}