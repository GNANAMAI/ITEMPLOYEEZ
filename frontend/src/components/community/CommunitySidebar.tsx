import { ChevronDown, ChevronRight, Users } from "lucide-react";
import type { MembershipGroup, MembershipProduct } from "@/types";
import "./CommunitySidebar.css";

interface CommunitySidebarProps {
  groups: MembershipGroup[];
  expanded: Record<number, boolean>;
  selectedSlug: string | null;
  onToggleCategory: (categoryId: number) => void;
  onSelectProduct: (slug: string) => void;
}

export function CommunitySidebar({
  groups,
  expanded,
  selectedSlug,
  onToggleCategory,
  onSelectProduct,
}: CommunitySidebarProps) {
  return (
    <aside className="ch-sidebar">
      <div className="ch-sidebar-head">
        <Users size={18} />
        <h3>My Communities</h3>
      </div>

      {groups.map((group) => {
        const isOpen = !!expanded[group.category.id];
        return (
          <div key={group.category.id} className="ch-accordion">
            <button
              type="button"
              className={`ch-accordion-head ${isOpen ? "open" : ""}`}
              onClick={() => onToggleCategory(group.category.id)}
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="ch-accordion-label">{group.category.name}</span>
              <span className="ch-accordion-count">{group.products.length}</span>
            </button>
            {isOpen ? (
              <ul className="ch-accordion-body">
                {group.products.map((product: MembershipProduct) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      className={selectedSlug === product.slug ? "active" : ""}
                      onClick={() => onSelectProduct(product.slug)}
                    >
                      <img src={product.image_url} alt="" className="ch-product-thumb" />
                      <span>{product.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </aside>
  );
}
