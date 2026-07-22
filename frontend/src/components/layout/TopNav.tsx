import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import "./TopNav.css";

const NAV_LINKS = [
  { label: "IT Products", path: "/it-apps" },
  { label: "IT Communities", path: "/community-subscribe" },
  { label: "Our Services", path: "/services" },
];

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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
            <>
              <span className="nav-user">Hi, {user?.name.split(" ")[0]}</span>
              <button type="button" className="nav-text-btn" onClick={logout}>
                Logout
              </button>
            </>
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
