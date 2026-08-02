import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import "./TopNav.css";


const NAV_LINKS = [
  { label: "IT Products", path: "/it-apps" },
  { label: "IT Communities", path: "/community-subscribe" },
  { label: "Our Services", path: "/services" },
];

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const location = useLocation();

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

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
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark">IT</span>
          <span className="logo-text">Employeez</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
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
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-text-btn" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="nav-register-btn" onClick={() => setMenuOpen(false)}>
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
                <div className="nav-user-dropdown" role="menu">
                  <Link
                    to="/community-subscribe"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    My Communities
                  </Link>

                  <Link
                    to="/it-apps"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    IT Products
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-text-btn">
                Login
              </Link>

              <Link to="/signup" className="nav-register-btn">
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
