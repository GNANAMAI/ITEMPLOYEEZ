import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import "./AboutPage.css";

export function AboutPage() {
  return (
    <>
      <PageHero title="About Us" breadcrumbs={[{ label: "Home", path: "/" }, { label: "About Us" }]} />

      <section className="section">
        <div className="container about-grid">
          <div className="about-content">
            <Card>
              <p>
                The IT Employeez Community is a vibrant network designed for IT professionals to
                connect, collaborate, and grow. Whether you're a developer, sysadmin, cybersecurity
                expert, or tech enthusiast, this community provides a platform for knowledge sharing,
                career advice, and industry trends. Members can engage in discussions, attend webinars,
                and access exclusive resources to stay ahead in the fast-evolving tech world.
              </p>
              <p>
                With a focus on peer support, skill development, and networking, the IT Employeez
                Community fosters innovation and problem-solving. From troubleshooting tech challenges
                to exploring new tools and certifications, this group empowers IT professionals to excel
                in their careers. Join a global community of like-minded individuals and be part of a
                dynamic space where technology meets opportunity!
              </p>
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
