import { useState } from "react";
import { Briefcase, CircleAlert, FileText } from "lucide-react";
import type { CommunityPost, CommunityPostCreateBody, CommunityTab } from "@/types";
import { CreatePostModal } from "./CreatePostModal";
import { initials } from "./communityUtils";
import "./PostComposer.css";

interface PostComposerProps {
  tab: CommunityTab;
  productTitle: string;
  userName: string;
  submitting: boolean;
  onSubmit: (body: CommunityPostCreateBody) => Promise<CommunityPost | void>;
}

const TAB_ACTION: Record<Exclude<CommunityTab, "expert">, { icon: typeof CircleAlert; label: string }> = {
  issue: { icon: CircleAlert, label: "Issue" },
  blog: { icon: FileText, label: "Article" },
  job: { icon: Briefcase, label: "Job" },
};

export function PostComposer({ tab, productTitle, userName, submitting, onSubmit }: PostComposerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (tab === "expert") return null;

  const action = TAB_ACTION[tab];
  const ActionIcon = action.icon;

  return (
    <>
      <div className="ch-composer-bar">
        <button type="button" className="ch-composer-trigger" onClick={() => setModalOpen(true)}>
          <span className="ch-avatar sm">{initials(userName)}</span>
          <span className="ch-composer-prompt">Start a post…</span>
        </button>
        <div className="ch-composer-actions-bar">
          <button type="button" className="ch-composer-action" onClick={() => setModalOpen(true)}>
            <ActionIcon size={18} />
            <span>{action.label}</span>
          </button>
        </div>
      </div>

      <CreatePostModal
        open={modalOpen}
        tab={tab}
        productTitle={productTitle}
        userName={userName}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={onSubmit}
      />
    </>
  );
}
