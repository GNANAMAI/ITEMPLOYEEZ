import { FormEvent, useEffect, useState } from "react";
import { Globe, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CommunityPost, CommunityPostCreateBody, CommunityTab } from "@/types";
import { sanitizeHtml, htmlToPlainText } from "@/utils/sanitizeHtml";
import { RichTextEditor, richTextLength } from "./RichTextEditor";
import { initials } from "./communityUtils";
import "./CreatePostModal.css";
import "./RichTextEditor.css";

interface CreatePostModalProps {
  open: boolean;
  tab: CommunityTab;
  productTitle: string;
  userName: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (body: CommunityPostCreateBody) => Promise<CommunityPost | void>;
}

const MODAL_TITLE: Record<Exclude<CommunityTab, "expert">, string> = {
  issue: "Share an issue",
  blog: "Write an article",
  job: "Post a job opening",
};

const CONTENT_PLACEHOLDER: Record<Exclude<CommunityTab, "expert">, string> = {
  issue: "Describe the error, steps to reproduce, and what you already tried…",
  blog: "Share insights, tips, or a write-up about this product…",
  job: "Describe the role, responsibilities, and ideal candidate…",
};

export function CreatePostModal({
  open,
  tab,
  productTitle,
  userName,
  submitting,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContent("");
    setCompany("");
    setLocation("");
    setContactInfo("");
    setError("");
  }, [open, tab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || tab === "expert") return null;

  const plainContent = htmlToPlainText(content);
  const canSubmit =
    title.trim().length > 0 &&
    plainContent.length > 0 &&
    (tab !== "job" || company.trim().length > 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError("");
    try {
      await onSubmit({
        post_type: tab,
        title: title.trim(),
        content: sanitizeHtml(content),
        company: tab === "job" ? company.trim() : undefined,
        location: tab === "job" ? location.trim() || undefined : undefined,
        contact_info: tab === "job" ? contactInfo.trim() || undefined : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  return (
    <div className="cpm-overlay" role="dialog" aria-modal="true" aria-label={MODAL_TITLE[tab]}>
      <button type="button" className="cpm-backdrop" onClick={onClose} aria-label="Close dialog" />
      <form className="cpm-modal" onSubmit={handleSubmit}>
        <div className="cpm-header">
          <h2>{MODAL_TITLE[tab]}</h2>
          <button type="button" className="cpm-close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="cpm-author">
          <span className="cpm-avatar">{initials(userName)}</span>
          <div>
            <strong>{userName}</strong>
            <span className="cpm-audience">
              <Globe size={13} />
              {productTitle} · {tab === "issue" ? "Issues" : tab === "job" ? "Jobs" : "Blogs"}
            </span>
          </div>
        </div>

        <div className="cpm-body">
          <input
            className="cpm-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={tab === "job" ? "Role title (e.g. Senior macOS Engineer)" : "Add a title"}
            maxLength={200}
            required
          />

          {tab === "job" ? (
            <div className="cpm-job-row">
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company *"
                required
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (Remote / City)"
              />
            </div>
          ) : null}

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder={CONTENT_PLACEHOLDER[tab]}
            minHeight={360}
          />

          {tab === "job" ? (
            <input
              className="cpm-contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="How to apply — email or contact instructions"
            />
          ) : null}
        </div>

        {error ? <p className="cpm-error">{error}</p> : null}

        <div className="cpm-footer">
          <span className="cpm-count">{richTextLength(content)} characters</span>
          <Button type="submit" variant="accent" loading={submitting} disabled={!canSubmit}>
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}
