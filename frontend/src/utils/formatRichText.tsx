import type { ReactNode } from "react";
import { looksLikeHtml, sanitizeHtml } from "@/utils/sanitizeHtml";

/** Render post content — HTML from rich editor or legacy markdown/plain text. */
export function renderPostContent(text: string | null | undefined): ReactNode {
  if (!text?.trim()) return null;

  if (looksLikeHtml(text)) {
    return (
      <div
        className="rich-html"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
      />
    );
  }

  return renderRichText(text);
}

/** Render simple markdown: paragraphs, **bold**, and - bullet lists. */
export function renderRichText(text: string | null | undefined): ReactNode {
  if (!text?.trim()) return null;

  const blocks = text.trim().split(/\n\n+/);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").filter((line) => line.trim());

    if (lines.every((line) => line.trim().startsWith("- "))) {
      return (
        <ul key={blockIndex} className="rich-text-list">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.trim().slice(2))}</li>
          ))}
        </ul>
      );
    }

    if (lines.length === 1) {
      const line = lines[0];
      const labeled = line.match(/^\*\*(.+?):\*\*\s*(.+)$/);
      if (labeled) {
        const [, label, rest] = labeled;
        const items = rest.split(",").map((item) => item.trim()).filter(Boolean);
        if (items.length > 1) {
          return (
            <div key={blockIndex} className="rich-text-labeled">
              <h3 className="rich-text-label">{label}</h3>
              <ul className="rich-text-list">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={blockIndex} className="rich-text-paragraph">
            <strong>{label}:</strong> {rest}
          </p>
        );
      }

      if (line.startsWith("**") && line.endsWith("**") && line.indexOf("**", 2) === line.length - 2) {
        return (
          <h3 key={blockIndex} className="rich-text-heading">
            {line.slice(2, -2)}
          </h3>
        );
      }

      return (
        <p key={blockIndex} className="rich-text-paragraph">
          {renderInline(line)}
        </p>
      );
    }

    return (
      <div key={blockIndex} className="rich-text-block">
        {lines.map((line, lineIndex) => (
          <p key={lineIndex} className="rich-text-paragraph">
            {renderInline(line)}
          </p>
        ))}
      </div>
    );
  });
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
