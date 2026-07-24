import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Menu, Search, X } from "lucide-react";
import { PageToolbar } from "@/components/layout/PageToolbar";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityRightRail } from "@/components/community/CommunityRightRail";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { EmptyState } from "@/components/community/EmptyState";
import { ExpertDirectory } from "@/components/community/ExpertDirectory";
import { PostCard } from "@/components/community/PostCard";
import { PostComposer } from "@/components/community/PostComposer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type {
  CommunityPost,
  CommunityPostCreateBody,
  CommunityStats,
  CommunityTab,
  MembershipGroup,
} from "@/types";
import "./CommunityPage.css";
import "@/components/ui/BackLink.css";

export function CommunityPage() {
  const { isAuthenticated, user, memberships, refreshMemberships } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState<MembershipGroup[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<CommunityTab>("issue");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingGroups(false);
      return;
    }
    api
      .getGroupedMemberships()
      .then((data) => {
        setGroups(data);
        const fromQuery = searchParams.get("product");
        if (fromQuery && data.some((g) => g.products.some((p) => p.slug === fromQuery))) {
          setSelectedSlug(fromQuery);
          const catId = data.find((g) => g.products.some((p) => p.slug === fromQuery))?.category.id;
          if (catId) setExpanded((prev) => ({ ...prev, [catId]: true }));
        } else if (data.length > 0 && data[0].products.length > 0) {
          setSelectedSlug(data[0].products[0].slug);
          setExpanded((prev) => ({ ...prev, [data[0].category.id]: true }));
        }
      })
      .finally(() => setLoadingGroups(false));
  }, [isAuthenticated, searchParams]);

  useEffect(() => {
    if (!selectedSlug || !isAuthenticated) return;

    setError("");
    api
      .getCommunityStats(selectedSlug)
      .then(setStats)
      .catch(() => setStats(null));

    if (tab === "expert") {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    api
      .getCommunityPosts(selectedSlug, tab)
      .then(setPosts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load posts"))
      .finally(() => setLoadingPosts(false));
  }, [selectedSlug, tab, isAuthenticated]);

  const selectedProduct = useMemo(() => {
    for (const group of groups) {
      const product = group.products.find((p) => p.slug === selectedSlug);
      if (product) return { ...product, categoryName: group.category.name };
    }
    return null;
  }, [groups, selectedSlug]);

  const periodEnd = useMemo(() => {
    const m = memberships.find((item) => item.product.slug === selectedSlug && item.is_active);
    return m?.current_period_end ?? null;
  }, [memberships, selectedSlug]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.company && p.company.toLowerCase().includes(q)),
    );
  }, [posts, searchQuery]);

  const selectProduct = (slug: string) => {
    setSelectedSlug(slug);
    setSearchParams({ product: slug });
    setSidebarOpen(false);
  };

  const handleCreatePost = async (body: CommunityPostCreateBody) => {
    if (!selectedSlug) return;
    setSubmitting(true);
    try {
      const created = await api.createCommunityPost(selectedSlug, body);
      setPosts((prev) => [created, ...prev]);
      const nextStats = await api.getCommunityStats(selectedSlug);
      setStats(nextStats);
      await refreshMemberships();
      return created;
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <section className="community-banner">
          <div className="community-banner-overlay">
            <div className="container">
              <span className="mono-label">Members Only</span>
              <h1>IT Communities</h1>
              <p>Connect, collaborate, and grow with fellow IT professionals.</p>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container community-content">
            <Card className="gate-card">
              <Lock size={40} className="gate-icon" />
              <h2>Please Login/Signup to access IT Communities</h2>
              <p>Join IT Employeez to unlock discussions, webinars, and exclusive member resources.</p>
              <div className="gate-actions">
                <Link to="/login?returnTo=%2Fcommunity-subscribe">
                  <Button variant="primary">Login</Button>
                </Link>
                <Link to="/signup?returnTo=%2Fcommunity-subscribe">
                  <Button variant="accent">Create Account</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </>
    );
  }

  if (loadingGroups) {
    return (
      <section className="section community-hub-page">
        <div className="container ch-loading-shell">
          <div className="ch-skeleton-block" />
          <div className="ch-skeleton-block tall" />
        </div>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <>
        <section className="community-banner community-banner-hub">
          <div className="container community-banner-content">
            <h1>Welcome to the IT Communities!</h1>
            <p>
              To subscribe for a new IT Community,{" "}
              <Link to="/it-apps" className="community-banner-link">
                please click here
              </Link>
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <Card className="gate-card">
              <h2>Welcome, {user?.name}!</h2>
              <p>You have not subscribed to any IT community yet. Browse products and subscribe to get access.</p>
              <Link to="/it-apps">
                <Button variant="accent">Browse IT Products</Button>
              </Link>
            </Card>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="community-hub-page">
      <PageToolbar
        items={[
          { label: "Home", path: "/" },
          { label: "IT Communities" },
        ]}
        backFallback="/"
        wide
      >
        <label className="community-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search posts, people, jobs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </PageToolbar>

      <div className="community-hub-container community-hub-layout">
        <button
          type="button"
          className="ch-sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle communities"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          Communities
        </button>

        <div className={`ch-sidebar-wrap ${sidebarOpen ? "open" : ""}`}>
          <CommunitySidebar
            groups={groups}
            expanded={expanded}
            selectedSlug={selectedSlug}
            onToggleCategory={(id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
            onSelectProduct={selectProduct}
          />
        </div>

        <main className="community-main">
          {selectedProduct ? (
            <div className="ch-center-panel">
              <CommunityHeader product={selectedProduct} stats={stats} />
              <CommunityTabs active={tab} stats={stats} onChange={setTab} />

              {tab !== "expert" ? (
                <PostComposer
                  tab={tab}
                  productTitle={selectedProduct.title}
                  userName={user?.name || "You"}
                  submitting={submitting}
                  onSubmit={handleCreatePost}
                />
              ) : null}

              <div className="ch-panel-body">
                {error ? <p className="community-error">{error}</p> : null}

                {tab === "expert" && selectedSlug ? (
                  <ExpertDirectory
                    productSlug={selectedSlug}
                    productTitle={selectedProduct.title}
                    currentUserId={user?.id}
                  />
                ) : (
                  <div className="ch-feed">
                    {loadingPosts ? (
                      <div className="ch-feed-loading">
                        <div className="ch-skeleton-block" />
                        <div className="ch-skeleton-block" />
                      </div>
                    ) : null}

                    {!loadingPosts && filteredPosts.length === 0 ? <EmptyState tab={tab} /> : null}

                    {!loadingPosts
                      ? filteredPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            productSlug={selectedSlug!}
                            currentUserId={user?.id}
                            onResolved={(updated) => {
                              setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                              if (selectedSlug) {
                                api.getCommunityStats(selectedSlug).then(setStats).catch(() => null);
                              }
                            }}
                            onCommentCountChange={(postId, count) =>
                              setPosts((prev) =>
                                prev.map((p) => (p.id === postId ? { ...p, comment_count: count } : p)),
                              )
                            }
                          />
                        ))
                      : null}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </main>

        {selectedProduct ? (
          <div className="ch-rail-wrap">
            <CommunityRightRail product={selectedProduct} stats={stats} periodEnd={periodEnd} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
