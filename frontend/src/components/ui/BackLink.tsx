import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BackLink.css";

interface BackLinkProps {
  fallback?: string;
  label?: string;
}

export function BackLink({ fallback = "/it-apps", label = "Back" }: BackLinkProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    const historyIdx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof historyIdx === "number" && historyIdx > 0) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  };

  return (
    <button type="button" className="back-link" onClick={handleBack}>
      <ArrowLeft size={18} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
