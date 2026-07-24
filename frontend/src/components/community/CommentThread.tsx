import { useEffect, useState } from "react";
import { Lightbulb, MessageCircle } from "lucide-react";
import { api } from "@/services/api";
import { htmlToPlainText, looksLikeHtml, sanitizeHtml } from "@/utils/sanitizeHtml";
import type { CommunityComment, CommunityPost } from "@/types";
import { ReplyModal } from "./ReplyModal";
import { initials, timeAgo } from "./communityUtils";
import "./CommentThread.css";
import "./RichTextEditor.css";

interface CommentThreadProps {
  productSlug: string;
  post: CommunityPost;
  currentUserId: number | undefined;
  onCountChange: (count: number) => void;
}

function commentBody(content: string) {
  if (looksLikeHtml(content)) {
    return (
      <div
        className="rich-html ch-comment-html"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }
  return <p>{content}</p>;
}

export function CommentThread({ productSlug, post, onCountChange }: CommentThreadProps) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getPostComments(productSlug, post.id)
      .then((data) => {
        if (!cancelled) {
          setComments(data);
          onCountChange(data.length);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load comments");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug, post.id]);

  const handleReply = async (content: string, isSolution: boolean) => {
    setSubmitting(true);
    try {
      const created = await api.createPostComment(productSlug, post.id, {
        content,
        is_solution: post.post_type === "issue" ? isSolution : false,
      });
      const next = [...comments, created];
      setComments(next);
      onCountChange(next.length);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ch-comments">
      {loading ? <p className="ch-comments-muted">Loading replies…</p> : null}

      {!loading && comments.length === 0 ? (
        <p className="ch-comments-muted">No replies yet. Be the first to help.</p>
      ) : null}

      <ul className="ch-comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className={`ch-comment ${comment.is_solution ? "solution" : ""}`}>
            <span className="ch-avatar sm">{initials(comment.author.name)}</span>
            <div className="ch-comment-body">
              <div className="ch-comment-head">
                <strong>{comment.author.name}</strong>
                <span>{timeAgo(comment.created_at)}</span>
                {comment.is_solution ? (
                  <em>
                    <Lightbulb size={12} /> Suggested solution
                  </em>
                ) : null}
              </div>
              {commentBody(comment.content)}
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="ch-reply-trigger" onClick={() => setReplyOpen(true)}>
        <MessageCircle size={16} />
        Write a reply…
      </button>

      <ReplyModal
        open={replyOpen}
        title={post.post_type === "issue" ? "Reply to issue" : "Write a reply"}
        placeholder={
          post.post_type === "issue"
            ? "Share a fix, tip, or clarifying question…"
            : "Write your reply…"
        }
        submitting={submitting}
        showSolutionOption={post.post_type === "issue"}
        onClose={() => setReplyOpen(false)}
        onSubmit={handleReply}
      />

      {error ? <p className="ch-comments-error">{error}</p> : null}
    </div>
  );
}
