import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, LogOut, UserRound } from "lucide-react";
import { api } from "@/services/api";
import { ADMIN_NAV } from "./adminNav";
import "./AdminLayout.css";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    api
      .adminMe()
      .then((user) => {
        setAdminName(user.name || "Admin");
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/admin/login", { replace: true });
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/admin/login");
  };

  if (checking) {
    return (
      <div className="admin-boot">
        <p>Loading admin...</p>
      </div>
    );
  }

  return (
    <div className={`admin-app ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link to="/admin/dashboard" className="admin-brand">
            <span className="admin-brand-mark">IT</span>
            {!collapsed ? (
              <span className="admin-brand-text">
                IT EMPLOYEEZ
                <small>BYTES AND BRILLIANCE</small>
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="admin-nav">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
              title={item.label}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button type="button" className="admin-nav-link admin-logout-link" onClick={handleLogout}>
            <LogOut size={14} />
            {!collapsed ? <span>Logout</span> : null}
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-spacer" />
          <div className="admin-user-chip">
            <UserRound size={18} />
            <span>{adminName}</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </div>
  );
}
