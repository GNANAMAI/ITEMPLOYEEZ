import { BookOpen, Briefcase, CircleAlert, Sparkles } from "lucide-react";
import type { CommunityStats, CommunityTab } from "@/types";
import "./CommunityTabs.css";

const TABS: { id: CommunityTab; label: string; icon: typeof CircleAlert }[] = [
  { id: "issue", label: "Issues", icon: CircleAlert },
  { id: "blog", label: "Blogs", icon: BookOpen },
  { id: "job", label: "Jobs", icon: Briefcase },
  { id: "expert", label: "Experts", icon: Sparkles },
];

interface CommunityTabsProps {
  active: CommunityTab;
  stats: CommunityStats | null;
  onChange: (tab: CommunityTab) => void;
}

function countFor(tab: CommunityTab, stats: CommunityStats | null): number | null {
  if (!stats) return null;
  if (tab === "issue") return stats.open_issues;
  if (tab === "blog") return stats.blog_count;
  if (tab === "job") return stats.active_jobs;
  return stats.expert_count;
}

export function CommunityTabs({ active, stats, onChange }: CommunityTabsProps) {
  return (
    <nav className="ch-tabs" aria-label="Community sections">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const count = countFor(tab.id, stats);
        return (
          <button
            key={tab.id}
            type="button"
            className={`ch-tab ${active === tab.id ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {count !== null ? <em>{count}</em> : null}
          </button>
        );
      })}
    </nav>
  );
}
