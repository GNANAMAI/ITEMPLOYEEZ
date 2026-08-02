import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cloud,
  Code2,
  Lock,
  Search,
  Shield,
  Terminal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import type { ProductCategory, ProductDetail } from "@/types";
import "@/components/ui/ServiceCard.css";
import "./HomePage.css";

const ROLES = [
  { icon: Code2, label: "Developers" },
  { icon: Terminal, label: "Sysadmins" },
  { icon: Shield, label: "Cybersecurity" },
  { icon: Cloud, label: "Cloud & DevOps" },
];

const WHY_JOIN_ITEMS = [
  {
    title: "Access to Exclusive Resources",
    text: "Industry-leading tools, tutorials, and best practices tailored for IT professionals. Stay ahead with up-to-date member content.",
    image: "https://itemployeez.com/public/uploads/images/1742202640.png",
    link: "/service-details/access-to-exclusive-resources",
  },
  {
    title: "Career Advancement",
    text: "Job boards, skill-building workshops, and career support to help you grow in your current role or explore new opportunities.",
    image: "https://itemployeez.com/public/uploads/images/1742470879.jpg",
    link: "/service-details/Career-Advancement",
  },
];

const FEATURED_SLUGS = ["SAP ECC", "macOS"];

export function HomePage() {
  const [homeProducts, setHomeProducts] = useState<ProductCategory[]>([]);
  const [featuredDetails, setFeaturedDetails] = useState<ProductDetail[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [products, details] = await Promise.all([
          api.getHomeProducts(),
          api.getProductDetails(),
        ]);
        setHomeProducts(Array.isArray(products) ? products : []);
        const featured = (Array.isArray(details) ? details : []).filter((d) =>
          FEATURED_SLUGS.includes(d.slug),
        );
        setFeaturedDetails(
          FEATURED_SLUGS.map((slug) => featured.find((d) => d.slug === slug)).filter(
            (d): d is ProductDetail => Boolean(d),
          ),
        );
      } catch (error) {
        console.error("Failed to load homepage data:", error);
        setHomeProducts([]);
        setFeaturedDetails([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = companySearch.toLowerCase().trim();
    if (!query) return homeProducts;
    return homeProducts.filter((p) => p.name.toLowerCase().includes(query));
  }, [homeProducts, companySearch]);

  const filteredFeatured = useMemo(() => {
    const query = productSearch.toLowerCase().trim();
    if (!query) return featuredDetails;
    return featuredDetails.filter((d) => d.title.toLowerCase().includes(query));
  }, [featuredDetails, productSearch]);

  return (
    <div className="home-page">
      {/* Community hero — keep above the live-style blue block */}
      <section className="hero-pro">
        <div className="hero-pro-bg" aria-hidden />
        <div className="container hero-pro-inner">
          <div className="hero-pro-copy fade-up">
            <p className="hero-brand">IT Employeez</p>
            <h1>
              Become Part Of Our
              <span> Vibrant IT Community!</span>
            </h1>
            <p className="hero-lead">
              Connect with developers, sysadmins, and cybersecurity experts. Share knowledge, grow
              your skills, and stay ahead in the tech industry — together.
            </p>
            <div className="hero-actions">
              <Link to="/signup?returnTo=%2Fit-apps">
                <Button variant="accent" size="lg">
                  Join IT Employeez
                </Button>
              </Link>
              <Link to="/it-apps">
                <Button variant="outline" size="lg" className="hero-btn-outline">
                  Explore IT Products
                </Button>
              </Link>
            </div>
            <ol className="hero-flow">
              <li>
                <span>1</span> Sign up
              </li>
              <li>
                <span>2</span> Browse products
              </li>
              <li>
                <span>3</span> Subscribe &amp; join community
              </li>
            </ol>
          </div>

          <div className="hero-pro-panel fade-up" aria-label="IT community preview">
            <div className="hero-panel-card">
              <div className="hero-panel-top">
                <span className="hero-panel-dot" />
                <span className="hero-panel-dot" />
                <span className="hero-panel-dot" />
                <span className="hero-panel-title">community@itemployeez:~</span>
              </div>
              <div className="hero-panel-body">
                <p className="hero-panel-code">
                  <span className="code-kw">const</span> community ={" "}
                  <span className="code-str">&quot;IT Employeez&quot;</span>;
                </p>
                <p className="hero-panel-code">
                  <span className="code-kw">await</span> growCareer(
                  <span className="code-str">skills</span>);
                </p>
                <div className="hero-role-grid">
                  {ROLES.map((role) => (
                    <div key={role.label} className="hero-role">
                      <role.icon size={18} />
                      <span>{role.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hero-float hero-float-lock">
              <Lock size={14} /> IT Communities
            </div>
            <div className="hero-float hero-float-users">
              <Users size={14} /> Peer network
            </div>
          </div>
        </div>
      </section>

      {/* Live site: light blue — Search Company + logo grid */}
      <section className="home-companies-section">
        <div className="container">
          <div className="home-search home-search-company">
            <Search size={18} aria-hidden />
            <input
              type="search"
              placeholder="Search Company"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              aria-label="Search Company"
            />
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="home-companies-grid">
              {filteredCompanies.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="home-company-tile"
                  title={product.name}
                >
                  <img src={product.image_url} alt={product.name} loading="lazy" />
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredCompanies.length === 0 ? (
            <p className="empty-hint">No company matches your search.</p>
          ) : null}
        </div>
      </section>

      {/* Live site: white — Search products here + SAP ECC & macOS */}
      <section className="home-featured-section">
        <div className="container">
          <div className="home-search home-search-products">
            <Search size={18} aria-hidden />
            <input
              type="search"
              placeholder="Search products here..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>

          {loading ? (
            <div className="home-featured-row home-featured-skeleton">
              <div className="home-featured-tile" />
              <div className="home-featured-tile" />
            </div>
          ) : (
            <div className="home-featured-row">
              {filteredFeatured.map((detail) => (
                <Link
                  key={detail.slug}
                  to={`/product-details/${encodeURIComponent(detail.slug)}`}
                  className="home-featured-tile"
                >
                  <img src={detail.image_url} alt={detail.title} loading="lazy" />
                  <span className="home-featured-label">
                    {detail.slug === "macOS" ? "Mac OS X" : detail.title}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredFeatured.length === 0 ? (
            <p className="empty-hint">No featured product matches your search.</p>
          ) : null}
        </div>
      </section>

      {/* Why Join */}
      <section className="why-section-live">
        <div className="container">
          <div className="why-live-intro">
            <h2>Why Join IT Employeez</h2>
            <p>
              At IT Employeez, we&apos;re not just a community, we&apos;re a movement dedicated to
              empowering IT professionals. When you join IT Employeez, you become part of a dynamic
              network that values innovation, collaboration, and professional growth.
            </p>
          </div>
          <div className="why-live-grid">
            {WHY_JOIN_ITEMS.map((item) => (
              <article key={item.title} className="feature-card">
                <div className="feature-card-media">
                  <img src={item.image} alt="" loading="lazy" />
                </div>
                <div className="feature-card-body">
                  <h3>
                    <Link to={item.link}>{item.title}</Link>
                  </h3>
                  <p>{item.text}</p>
                  <Link to={item.link} className="feature-card-cta">
                    Learn more <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
