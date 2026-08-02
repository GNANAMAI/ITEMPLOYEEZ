import { Link } from "react-router-dom";
import "./Footer.css";

const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "IT Products", path: "/it-apps" },
  { label: "IT Communities", path: "/community-subscribe" },
  { label: "Our Services", path: "/services" },
  { label: "Contact Us", path: "/contact" },
  { label: "Login as Admin", path: "/login?mode=admin" },
];

const POLICY_LINKS = [
  { label: "Privacy & Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms-conditions" },
  { label: "Cancellation & Refund Policy", path: "/cancel-policies" },
  { label: "Disclaimer", path: "/disclaimer" },
];

const FLOW_STEPS = [
  { step: "1", label: "Browse Products", path: "/it-apps" },
  { step: "2", label: "Subscribe", path: "/it-apps" },
  { step: "3", label: "Join Community", path: "/community-subscribe" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>IT Employeez</h3>
          <p>
            At IT Employeez, we envision a future where technology bridges gaps and drives progress.
            We aim to be the catalyst for innovation and success, providing the tools and resources
            necessary for IT professionals to excel.
          </p>
          <div className="footer-flow">
            <p className="footer-flow-label">How it works</p>
            <ol>
              {FLOW_STEPS.map((item) => (
                <li key={item.step}>
                  <Link to={item.path}>
                    <span>{item.step}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Our Policy</h4>
          <ul>
            {POLICY_LINKS.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>©{year} IT Employeez. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
