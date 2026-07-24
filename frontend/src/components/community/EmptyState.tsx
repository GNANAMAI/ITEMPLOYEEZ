import { BookOpen, Briefcase, CircleAlert, Sparkles } from "lucide-react";
import type { CommunityTab } from "@/types";
import "./EmptyState.css";

const COPY: Record<
  CommunityTab,
  { icon: typeof CircleAlert; title: string; body: string }
> = {
  issue: {
    icon: CircleAlert,
    title: "No issues yet",
    body: "Hit a blocker? Post the error and steps to reproduce — the community can help solve it.",
  },
  blog: {
    icon: BookOpen,
    title: "No blogs yet",
    body: "Share tips, walkthroughs, or lessons learned about this product with fellow subscribers.",
  },
  job: {
    icon: Briefcase,
    title: "No job openings",
    body: "Hiring for this product stack? Post the role so community members can reach out.",
  },
  expert: {
    icon: Sparkles,
    title: "No experts listed",
    body: "Senior members can publish an expert profile so others can message them for guidance.",
  },
};

export function EmptyState({ tab }: { tab: CommunityTab }) {
  const item = COPY[tab];
  const Icon = item.icon;
  return (
    <div className="ch-empty">
      <div className="ch-empty-icon">
        <Icon size={28} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </div>
  );
}
