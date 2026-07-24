import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { htmlToPlainText } from "@/utils/sanitizeHtml";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "What do you want to talk about?",
  minHeight = 180,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
    isInternalChange.current = false;
  };

  const exec = (command: string, valueArg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, valueArg);
    emitChange();
  };

  const isEmpty = !htmlToPlainText(value);

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>
          <Bold size={17} />
        </button>
        <button type="button" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>
          <Italic size={17} />
        </button>
        <button type="button" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>
          <Underline size={17} />
        </button>
        <span className="rte-divider" />
        <button
          type="button"
          title="Bullet list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
        >
          <List size={17} />
        </button>
        <button
          type="button"
          title="Numbered list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
        >
          <ListOrdered size={17} />
        </button>
      </div>

      <div className="rte-editor-wrap" style={{ minHeight }}>
        {isEmpty ? <span className="rte-placeholder">{placeholder}</span> : null}
        <div
          ref={editorRef}
          className="rte-editor"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
}

export function richTextLength(html: string): number {
  return htmlToPlainText(html).length;
}
