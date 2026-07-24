import { BookOpen, Briefcase, CircleAlert, Sparkles } from "lucide-react";
import type { CommunityStats, MembershipProduct } from "@/types";
import "./CommunityRightRail.css";

interface CommunityRightRailProps {
  product: MembershipProduct;
  stats: CommunityStats | null;
  periodEnd: string | null;
}

export function CommunityRightRail({ product, stats, periodEnd }: CommunityRightRailProps) {
  return (
    <aside className="ch-rail">
      <div className="ch-rail-card ch-rail-subscription">
        <div className="ch-rail-sub-head">
          <img src={product.image_url} alt="" className="ch-rail-logo" />
          <div>
            <h3>{product.title}</h3>
            <p className="ch-rail-muted">Subscriber community</p>
          </div>
        </div>
        {periodEnd ? (
          <p className="ch-rail-period">
            Active until{" "}
            <strong>
              {new Date(periodEnd).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </strong>
          </p>
        ) : (
          <p className="ch-rail-period">
            Status: <strong>Active</strong>
          </p>
        )}
      </div>

      {stats ? (
        <div className="ch-rail-card ch-rail-stats">
          <h4>At a glance</h4>
          <ul>
            <li>
              <CircleAlert size={15} />
              <span>Open issues</span>
              <strong>{stats.open_issues}</strong>
            </li>
            <li>
              <BookOpen size={15} />
              <span>Blogs</span>
              <strong>{stats.blog_count}</strong>
            </li>
            <li>
              <Briefcase size={15} />
              <span>Jobs</span>
              <strong>{stats.active_jobs}</strong>
            </li>
            <li>
              <Sparkles size={15} />
              <span>Experts</span>
              <strong>{stats.expert_count}</strong>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="ch-rail-card ch-rail-guidelines">
        <h4>Guidelines</h4>
        <ul>
          <li>Stay product-focused and respectful.</li>
          <li>Share solutions that help others.</li>
          <li>Job posts must be genuine openings.</li>
        </ul>
      </div>
    </aside>
  );
}
