import { FormEvent, useEffect, useState } from "react";
import { MessageSquare, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import type { CommunityExpert, ExpertMessage } from "@/types";
import { initials, timeAgo } from "./communityUtils";
import "./ExpertDirectory.css";

interface ExpertDirectoryProps {
  productSlug: string;
  productTitle: string;
  currentUserId: number | undefined;
}

export function ExpertDirectory({ productSlug, productTitle, currentUserId }: ExpertDirectoryProps) {
  const [experts, setExperts] = useState<CommunityExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeExpert, setActiveExpert] = useState<CommunityExpert | null>(null);

  const loadExperts = () => {
    setLoading(true);
    api
      .getCommunityExperts(productSlug)
      .then(setExperts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load experts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExperts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug]);

  const myProfile = experts.find((e) => e.is_self);

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!headline.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.updateExpertProfile(productSlug, {
        is_expert: true,
        expert_headline: headline.trim(),
        expert_bio: bio.trim() || undefined,
      });
      setShowSetup(false);
      loadExperts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleOptOut = async () => {
    setSaving(true);
    try {
      await api.updateExpertProfile(productSlug, { is_expert: false });
      loadExperts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ch-experts">
      <div className="ch-experts-head">
        <div>
          <h2>Experts</h2>
          <p>Senior members available for guidance in {productTitle}.</p>
        </div>
        {!myProfile ? (
          <Button type="button" variant="accent" size="sm" onClick={() => setShowSetup(true)}>
            Become an expert
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" loading={saving} onClick={handleOptOut}>
            Leave expert list
          </Button>
        )}
      </div>

      {showSetup ? (
        <form className="ch-expert-setup" onSubmit={handleSaveProfile}>
          <div className="ch-expert-setup-top">
            <h3>
              <Sparkles size={16} /> Your expert profile
            </h3>
            <button type="button" onClick={() => setShowSetup(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <label className="ch-field">
            <span>Headline</span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. 12 yrs Adobe Creative Cloud · Design Systems"
              required
              maxLength={120}
            />
          </label>
          <label className="ch-field">
            <span>Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What can members ask you about?"
              rows={3}
            />
          </label>
          <Button type="submit" variant="accent" size="sm" loading={saving} disabled={!headline.trim()}>
            Publish profile
          </Button>
        </form>
      ) : null}

      {error ? <p className="ch-experts-error">{error}</p> : null}
      {loading ? <p className="ch-experts-muted">Loading experts…</p> : null}

      {!loading && experts.length === 0 ? (
        <div className="ch-experts-empty">
          <Sparkles size={28} />
          <h3>No experts yet</h3>
          <p>Be the first senior member to offer guidance in this community.</p>
        </div>
      ) : null}

      <div className="ch-expert-grid">
        {experts.map((expert) => (
          <article key={expert.user_id} className="ch-expert-card">
            <span className="ch-avatar lg">{initials(expert.name)}</span>
            <h3>{expert.name}</h3>
            {expert.job_title ? <p className="ch-expert-job">{expert.job_title}</p> : null}
            {expert.expert_headline ? <p className="ch-expert-headline">{expert.expert_headline}</p> : null}
            {expert.expert_bio ? <p className="ch-expert-bio">{expert.expert_bio}</p> : null}
            {!expert.is_self ? (
              <Button type="button" variant="primary" size="sm" onClick={() => setActiveExpert(expert)}>
                <MessageSquare size={14} /> Message
              </Button>
            ) : (
              <span className="ch-expert-you">Your profile</span>
            )}
          </article>
        ))}
      </div>

      {activeExpert ? (
        <ExpertConversation
          productSlug={productSlug}
          expert={activeExpert}
          currentUserId={currentUserId}
          onClose={() => setActiveExpert(null)}
        />
      ) : null}
    </div>
  );
}

interface ExpertConversationProps {
  productSlug: string;
  expert: CommunityExpert;
  currentUserId: number | undefined;
  onClose: () => void;
}

function ExpertConversation({ productSlug, expert, currentUserId, onClose }: ExpertConversationProps) {
  const [messages, setMessages] = useState<ExpertMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getExpertThread(productSlug, expert.user_id)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load conversation");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productSlug, expert.user_id]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError("");
    try {
      const created = await api.sendExpertMessage(productSlug, expert.user_id, content.trim());
      setMessages((prev) => [...prev, created]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ch-conv-backdrop" role="dialog" aria-modal="true" aria-label={`Message ${expert.name}`}>
      <div className="ch-conv-panel">
        <div className="ch-conv-head">
          <div>
            <strong>{expert.name}</strong>
            <span>{expert.expert_headline || "Community expert"}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close conversation">
            <X size={18} />
          </button>
        </div>

        <div className="ch-conv-body">
          {loading ? <p className="ch-experts-muted">Loading conversation…</p> : null}
          {!loading && messages.length === 0 ? (
            <p className="ch-experts-muted">Start the conversation with a clear question.</p>
          ) : null}
          {messages.map((msg) => {
            const mine = msg.from_user_id === currentUserId;
            return (
              <div key={msg.id} className={`ch-conv-bubble ${mine ? "mine" : ""}`}>
                <p>{msg.content}</p>
                <span>{timeAgo(msg.created_at)}</span>
              </div>
            );
          })}
        </div>

        <form className="ch-conv-form" onSubmit={handleSend}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Message ${expert.name}…`}
            rows={3}
          />
          <Button type="submit" variant="accent" size="sm" loading={sending} disabled={!content.trim()}>
            Send
          </Button>
        </form>
        {error ? <p className="ch-experts-error">{error}</p> : null}
      </div>
    </div>
  );
}
