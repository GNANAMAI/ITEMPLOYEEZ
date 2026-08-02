import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  CircleAlert,
  Globe,
  MapPin,
  MessageCircle,
  Building2,
  Send,
  ThumbsUp,
  BookOpen,
} from "lucide-react";
import { api } from "@/services/api";
import { renderPostContent } from "@/utils/formatRichText";
import { htmlToPlainText } from "@/utils/sanitizeHtml";
import "@/utils/formatRichText.css";
import "@/components/community/RichTextEditor.css";
import type { CommunityPost } from "@/types";
import { CommentThread } from "./CommentThread";
import { initials, timeAgo } from "./communityUtils";
import "./PostCard.css";

interface PostCardProps {
  post: CommunityPost;
  productSlug: string;
  currentUserId: number | undefined;
  onResolved: (post: CommunityPost) => void;
  onCommentCountChange: (postId: number, count: number) => void;
}

const TYPE_LABEL: Record<string, string> = {
  issue: "Issue",
  blog: "Article",
  job: "Job opening",
};

function TypeIcon({ type }: { type: string }) {
  if (type === "issue") return <CircleAlert size={12} />;
  if (type === "job") return <Briefcase size={12} />;
  return <BookOpen size={12} />;
}

export function PostCard({
  post,
  productSlug,
  currentUserId,
  onResolved,
  onCommentCountChange,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const plainLength = htmlToPlainText(localPost.content).length;
  const isLong = plainLength > 280;
  const showStats = liked || localPost.comment_count > 0;

  const handleResolve = async () => {
    setResolving(true);
    setError("");
    try {
      const next = localPost.status === "resolved" ? "open" : "resolved";
      const updated = await api.updatePostStatus(productSlug, localPost.id, next);
      setLocalPost(updated);
      onResolved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setResolving(false);
    }
  };

  const toggleComments = () => setShowComments((v) => !v);

  return (
    <article className="ch-post">
      <header className="ch-post-header">
        <div className="ch-post-author">
          <span className="ch-post-avatar">{initials(localPost.author.name)}</span>
          <div className="ch-post-author-info">
            <div className="ch-post-name">{localPost.author.name}</div>
            <div className="ch-post-subline">
              {localPost.author.job_title ? (
                <>
                  <span>{localPost.author.job_title}</span>
                  <span className="ch-dot">·</span>
                </>
              ) : null}
              <span>{timeAgo(localPost.created_at)}</span>
              <span className="ch-dot">·</span>
              <Globe size={12} aria-hidden />
            </div>
            <div className="ch-post-context">
              <TypeIcon type={localPost.post_type} />
              <span>{TYPE_LABEL[localPost.post_type] || localPost.post_type}</span>
              {localPost.post_type === "issue" ? (
                <>
                  <span className="ch-dot">·</span>
                  <span className={localPost.status === "resolved" ? "status-resolved" : "status-open"}>
                    {localPost.status === "resolved" ? "Resolved" : "Open"}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="ch-post-content">
        {localPost.title ? <h3 className="ch-post-title">{localPost.title}</h3> : null}

        {localPost.post_type === "job" ? (
          <div className="ch-job-card">
            {localPost.company ? (
              <div className="ch-job-company">
                <span className="ch-job-co-icon">{localPost.company.charAt(0)}</span>
                <div>
                  <strong>{localPost.company}</strong>
                  {localPost.location ? (
                    <span className="ch-job-loc">
                      <MapPin size={13} />
                      {localPost.location}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={`ch-post-body ${isLong && !expanded ? "collapsed" : ""}`}>
          {renderPostContent(localPost.content)}
        </div>

        {isLong ? (
          <button type="button" className="ch-read-more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "…show less" : "…see more"}
          </button>
        ) : null}

        {localPost.post_type === "job" && localPost.contact_info ? (
          <div className="ch-job-apply">
            <Building2 size={15} />
            <span>{localPost.contact_info}</span>
          </div>
        ) : null}
      </div>

      {showStats ? (
        <div className="ch-post-stats">
          {liked ? <span>1 reaction</span> : null}
          {localPost.comment_count > 0 ? (
            <button type="button" className="ch-stats-link" onClick={toggleComments}>
              {localPost.comment_count} comment{localPost.comment_count === 1 ? "" : "s"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className="ch-post-action-bar"
        data-cols={localPost.post_type === "issue" ? "4" : "3"}
      >
        <button
          type="button"
          className={`ch-action-btn ${liked ? "active" : ""}`}
          onClick={() => setLiked((v) => !v)}
        >
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>
        <button
          type="button"
          className={`ch-action-btn ${showComments ? "active" : ""}`}
          onClick={toggleComments}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
        {localPost.post_type === "issue" ? (
          <button
            type="button"
            className="ch-action-btn"
            onClick={handleResolve}
            disabled={resolving}
          >
            <CheckCircle2 size={18} />
            <span>{localPost.status === "resolved" ? "Reopen" : "Resolve"}</span>
          </button>
        ) : null}
        <button type="button" className="ch-action-btn">
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>

      {error ? <p className="ch-post-error">{error}</p> : null}

      {showComments ? (
        <CommentThread
          productSlug={productSlug}
          post={localPost}
          currentUserId={currentUserId}
          onCountChange={(count) => {
            setLocalPost((prev) => ({ ...prev, comment_count: count }));
            onCommentCountChange(localPost.id, count);
          }}
        />
      ) : null}
    </article>
  );
}
