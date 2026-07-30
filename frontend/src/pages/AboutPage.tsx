import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import { renderRichText } from "@/utils/formatRichText";
import "./AboutPage.css";
import "@/utils/formatRichText.css";

export function AboutPage() {
  const [title, setTitle] = useState("About Us");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAbout()
      .then((page) => {
        setTitle(page.title || "About Us");
        setContent(page.content || "");
      })
      .catch(() => {
        setContent(
          "The IT Employeez Community is a vibrant network designed for IT professionals to connect, collaborate, and grow.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero title={title} breadcrumbs={[{ label: "Home", path: "/" }, { label: "About Us" }]} />

      <section className="section">
        <div className="container about-grid">
          <div className="about-content">
            <Card>
              {loading ? (
                <Skeleton style={{ height: 220 }} />
              ) : (
                <div className="legal-body">{renderRichText(content)}</div>
              )}
            </Card>
          </div>

          <aside className="about-sidebar">
            <Card>
              <h3>What We Offer</h3>
              <ul>
                <li>IT Products — 17 categories</li>
                <li>IT Communities — members-only access</li>
                <li>Career & Resource Services</li>
                <li>Webinars & peer support</li>
              </ul>
            </Card>
            <Card className="about-contact-card">
              <h3>Contact</h3>
              <p>Phone: +91-8712956595</p>
              <p>Email: santu.edi@gmail.com</p>
              <p>Location: Vizag</p>
            </Card>
          </aside>
        </div>

        <div className="container about-copyright">
          <p>© 2025 Santosh Software Systems. All rights to services, content, and software are reserved.</p>
        </div>
      </section>
    </>
  );
}
