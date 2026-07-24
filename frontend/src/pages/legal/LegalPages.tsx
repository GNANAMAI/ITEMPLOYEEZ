import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { LegalTabs } from "@/components/ui/LegalTabs";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import { renderRichText } from "@/utils/formatRichText";
import "./LegalPage.css";
import "@/utils/formatRichText.css";

interface LegalPageViewProps {
  slug: string;
  breadcrumbLabel: string;
}

export function LegalPageView({ slug, breadcrumbLabel }: LegalPageViewProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLegalPage(slug)
      .then((page) => {
        setTitle(page.title);
        setContent(page.content);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <PageHero
        title={breadcrumbLabel}
        breadcrumbs={[{ label: "Home", path: "/" }, { label: breadcrumbLabel }]}
      />
      <section className="section">
        <div className="container legal-content">
          <LegalTabs />
          <Card>
            {loading ? (
              <Skeleton style={{ height: 300 }} />
            ) : (
              <>
                <h2>{title}</h2>
                <div className="legal-body">{renderRichText(content)}</div>
              </>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}

export function TermsPage() {
  return <LegalPageView slug="terms-conditions" breadcrumbLabel="Terms & Conditions" />;
}

export function PrivacyPage() {
  return <LegalPageView slug="privacy-policy" breadcrumbLabel="Privacy Policy" />;
}

export function CancelPolicyPage() {
  return <LegalPageView slug="cancel-policies" breadcrumbLabel="Cancellation & Refund Policy" />;
}

export function DisclaimerPage() {
  return <LegalPageView slug="disclaimer" breadcrumbLabel="Disclaimer" />;
}
