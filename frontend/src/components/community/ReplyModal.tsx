import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sanitizeHtml, htmlToPlainText } from "@/utils/sanitizeHtml";
import { RichTextEditor, richTextLength } from "./RichTextEditor";
import "./CreatePostModal.css";
import "./RichTextEditor.css";

interface ReplyModalProps {
  open: boolean;
  title: string;
  placeholder?: string;
  submitting: boolean;
  showSolutionOption?: boolean;
  onClose: () => void;
  onSubmit: (content: string, isSolution: boolean) => Promise<void>;
}

export function ReplyModal({
  open,
  title,
  placeholder = "Write your reply…",
  submitting,
  showSolutionOption = false,
  onClose,
  onSubmit,
}: ReplyModalProps) {
  const [content, setContent] = useState("");
  const [isSolution, setIsSolution] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setContent("");
    setIsSolution(false);
    setError("");
  }, [open]);

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

  if (!open) return null;

  const canSubmit = htmlToPlainText(content).length > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError("");
    try {
      await onSubmit(sanitizeHtml(content), isSolution);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    }
  };

  return (
    <div className="cpm-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="cpm-backdrop" onClick={onClose} aria-label="Close dialog" />
      <form className="cpm-modal cpm-modal-sm" onSubmit={handleSubmit}>
        <div className="cpm-header">
          <h2>{title}</h2>
          <button type="button" className="cpm-close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="cpm-body">
          <RichTextEditor value={content} onChange={setContent} placeholder={placeholder} minHeight={140} />
        </div>

        {error ? <p className="cpm-error">{error}</p> : null}

        <div className="cpm-footer">
          {showSolutionOption ? (
            <label className="cpm-solution-check">
              <input
                type="checkbox"
                checked={isSolution}
                onChange={(e) => setIsSolution(e.target.checked)}
              />
              Mark as suggested solution
            </label>
          ) : (
            <span className="cpm-count">{richTextLength(content)} characters</span>
          )}
          <Button type="submit" variant="accent" size="sm" loading={submitting} disabled={!canSubmit}>
            Reply
          </Button>
        </div>
      </form>
    </div>
  );
}
