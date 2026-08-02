import { FormEvent, useState, type ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { renderRichText } from "@/utils/formatRichText";
import "@/utils/formatRichText.css";

interface AdminContentEditorProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  saving?: boolean;
  message?: string;
  submitLabel?: string;
  previewHeading?: string;
  extraActions?: ReactNode;
}

export function AdminContentEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  saving = false,
  message = "",
  submitLabel = "Save Page",
  previewHeading,
  extraActions,
}: AdminContentEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <form className="admin-content-editor" onSubmit={onSubmit}>
      <div className="admin-content-toolbar">
        <div className="admin-content-tabs" role="tablist" aria-label="Editor mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "edit"}
            className={`admin-content-tab${mode === "edit" ? " active" : ""}`}
            onClick={() => setMode("edit")}
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={`admin-content-tab${mode === "preview" ? " active" : ""}`}
            onClick={() => setMode("preview")}
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
        <div className="admin-content-toolbar-actions">
          {extraActions}
          {message ? (
            <span
              className={
                message.toLowerCase().includes("fail") ? "admin-error" : "admin-success"
              }
              style={{ margin: 0 }}
            >
              {message}
            </span>
          ) : null}
          <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <div className="admin-content-edit">
          <label className="admin-content-field">
            <span>Page title</span>
            <input value={title} onChange={(e) => onTitleChange(e.target.value)} />
          </label>
          <label className="admin-content-field">
            <span>Page content</span>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              spellCheck
            />
          </label>
          <div className="admin-content-hints">
            <span>
              <code>**Section title**</code> on its own line
            </span>
            <span>
              <code>- bullet point</code> for lists
            </span>
            <span>Blank line between paragraphs</span>
          </div>
        </div>
      ) : (
        <div className="admin-content-preview">
          <p className="admin-content-preview-label">Public page preview</p>
          <article className="admin-content-preview-card">
            <h2>{previewHeading || title || "Untitled"}</h2>
            <div className="legal-body">
              {content.trim() ? (
                renderRichText(content)
              ) : (
                <p className="admin-muted">Nothing to preview yet. Switch to Edit and add content.</p>
              )}
            </div>
          </article>
        </div>
      )}
    </form>
  );
}
