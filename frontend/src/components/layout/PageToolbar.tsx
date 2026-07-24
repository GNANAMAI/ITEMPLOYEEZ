import { Link } from "react-router-dom";
import { BackLink } from "@/components/ui/BackLink";
import "./PageToolbar.css";

export interface ToolbarCrumb {
  label: string;
  path?: string;
}

interface PageToolbarProps {
  items: ToolbarCrumb[];
  backFallback?: string;
  backLabel?: string;
  wide?: boolean;
  children?: React.ReactNode;
}

export function PageToolbar({
  items,
  backFallback = "/it-apps",
  backLabel = "Back",
  wide = false,
  children,
}: PageToolbarProps) {
  return (
    <div className="page-toolbar">
      <div className={`${wide ? "community-hub-container" : "container"} page-toolbar-inner`}>
        <div className="page-toolbar-nav">
          <BackLink fallback={backFallback} label={backLabel} />
          <nav className="toolbar-crumbs" aria-label="Breadcrumb">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="toolbar-crumb-item">
                  {item.path && !isLast ? (
                    <Link to={item.path} className="toolbar-crumb-link">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="toolbar-crumb-current" aria-current={isLast ? "page" : undefined}>
                      {item.label}
                    </span>
                  )}
                  {!isLast ? <span className="toolbar-crumb-sep" aria-hidden>·</span> : null}
                </span>
              );
            })}
          </nav>
        </div>
        {children ? <div className="page-toolbar-extra">{children}</div> : null}
      </div>
    </div>
  );
}
