import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { PageToolbar } from "@/components/layout/PageToolbar";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import type { ProductCategory } from "@/types";
import "./ProductsCatalogPage.css";
import "@/components/ui/BackLink.css";

export function ProductsCatalogPage() {
  const [products, setProducts] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    api
      .getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return products;
    return products.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, search]);

  return (
    <div className="it-products-page">
      <PageToolbar
        items={[
          { label: "Home", path: "/" },
          { label: "IT Products" },
        ]}
        backFallback="/"
        backLabel="Back"
      >
        <div className="it-products-search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            placeholder="Search Company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search Company"
          />
        </div>
      </PageToolbar>

      <section className="it-products-grid-section">
        <div className="container">
          {loading ? (
            <ProductGridSkeleton />
          ) : filtered.length === 0 ? (
            <p className="it-products-empty">
              {products.length === 0
                ? "Unable to load products. Please ensure the API is running."
                : "No company matches your search."}
            </p>
          ) : (
            <div className="it-products-grid">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={`it-product-tile ${activeId === product.id ? "is-active" : ""}`}
                  title={product.name}
                  onMouseEnter={() => setActiveId(product.id)}
                  onFocus={() => setActiveId(product.id)}
                >
                  <img src={product.image_url} alt={product.name} loading="lazy" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
