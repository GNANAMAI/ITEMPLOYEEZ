const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "p",
  "br",
  "div",
]);

export function sanitizeHtml(html: string): string {
  if (!html?.trim()) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  const clean = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return Array.from(el.childNodes).map(clean).join("");
    }

    const inner = Array.from(el.childNodes).map(clean).join("");
    if (tag === "br") return "<br>";
    return `<${tag}>${inner}</${tag}>`;
  };

  return Array.from(doc.body.childNodes).map(clean).join("").trim();
}

export function htmlToPlainText(html: string): string {
  if (!html?.trim()) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

export function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}
