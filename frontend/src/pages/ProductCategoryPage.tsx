import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { PageToolbar } from "@/components/layout/PageToolbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import type { ProductCategory, ProductDetail } from "@/types";
import "./ProductCategoryPage.css";
import "@/components/ui/BackLink.css";

export function ProductCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const [cat, details] = await Promise.all([
          api.getProduct(Number(id)),
          api.getProductDetailsForCategory(Number(id)),
        ]);
        setCategory(cat);
        setProducts(details);
      } catch {
        setError("Company not found.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [products, search]);

  const searchBox = (
    <label className="company-search">
      <Search size={18} />
      <input
        type="search"
        placeholder="Search Product"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </label>
  );

  if (loading) {
    return (
      <div className="company-products-page">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: "Loading..." },
          ]}
          backFallback="/it-apps"
        />
        <section className="section">
          <div className="container">
            <Skeleton className="company-grid-skeleton" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="company-products-page">
        <PageToolbar
          items={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
            { label: "Not found" },
          ]}
          backFallback="/it-apps"
        />
        <section className="section">
          <div className="container">
            <p>{error}</p>
            <Link to="/it-apps">Browse IT Products</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="company-products-page">
      <PageToolbar
        items={[
          { label: "Home", path: "/" },
          { label: "IT Products", path: "/it-apps" },
          { label: category.name },
        ]}
        backFallback="/it-apps"
      >
        {searchBox}
      </PageToolbar>

      <section className="section company-products-section">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="company-empty">
              <img src={category.image_url} alt={category.name} className="company-empty-logo" />
              <h2>{category.name}</h2>
              <p>No products listed for this company yet. Check back soon or explore other companies.</p>
              <Link to="/it-apps" className="company-empty-link">
                Browse all companies →
              </Link>
            </div>
          ) : (
            <div className="company-product-grid">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/product-details/${encodeURIComponent(product.slug)}`}
                  className="company-product-tile"
                >
                  <div className="company-product-thumb">
                    <img src={product.image_url} alt={product.title} />
                  </div>
                  <span className="company-product-name">{product.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
