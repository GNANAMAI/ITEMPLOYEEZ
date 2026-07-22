import { NavLink } from "react-router-dom";
import "./LegalTabs.css";

const TABS = [
  { label: "Terms & Conditions", path: "/terms-conditions" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Cancel Policy", path: "/cancel-policies" },
  { label: "Disclaimer", path: "/disclaimer" },
];

export function LegalTabs() {
  return (
    <nav className="legal-tabs" aria-label="Legal policies">
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `legal-tab ${isActive ? "active" : ""}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
