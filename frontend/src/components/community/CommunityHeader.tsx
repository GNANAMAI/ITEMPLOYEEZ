import { BadgeCheck } from "lucide-react";
import type { CommunityStats, MembershipProduct } from "@/types";
import "./CommunityHeader.css";

interface CommunityHeaderProps {
  product: MembershipProduct & { categoryName?: string };
  stats: CommunityStats | null;
}

function memberLabel(count: number) {
  return count === 1 ? "1 member" : `${count} members`;
}

export function CommunityHeader({ product, stats }: CommunityHeaderProps) {
  return (
    <header className="ch-header">
      <div className="ch-header-inner">
        <img src={product.image_url} alt="" className="ch-header-logo" />
        <div className="ch-header-info">
          <div className="ch-header-title-row">
            <h1>{product.title}</h1>
            <span className="ch-subscribed-badge">
              <BadgeCheck size={13} />
              Subscribed
            </span>
          </div>
          <p className="ch-header-meta">
            {product.categoryName ? <span>{product.categoryName}</span> : null}
            {product.categoryName && stats ? <span className="ch-meta-dot">·</span> : null}
            {stats ? <span>{memberLabel(stats.member_count)}</span> : null}
            {stats && stats.expert_count > 0 ? (
              <>
                <span className="ch-meta-dot">·</span>
                <span>{stats.expert_count} experts</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </header>
  );
}
