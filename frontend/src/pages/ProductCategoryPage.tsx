import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { ProductTile } from "@/components/ui/ProductTile";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/services/api";
import type { ProductCategory } from "@/types";
import "./ProductCategoryPage.css";

export function ProductCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductCategory | null>(null);
  const [related, setRelated] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const [category, all] = await Promise.all([
          api.getProduct(Number(id)),
          api.getProducts(),
        ]);
        setProduct(category);
        setRelated(
          (Array.isArray(all) ? all : []).filter((p) => p.id !== category.id).slice(0, 4),
        );
      } catch {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHero
          title="Loading..."
          breadcrumbs={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
          ]}
        />
        <section className="section">
          <div className="container">
            <Skeleton className="category-skeleton" />
          </div>
        </section>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <PageHero
          title="Not Found"
          breadcrumbs={[
            { label: "Home", path: "/" },
            { label: "IT Products", path: "/it-apps" },
          ]}
        />
        <section className="section">
          <div className="container">
            <p>{error}</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={product.name}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "IT Products", path: "/it-apps" },
          { label: product.name },
        ]}
      />

      <section className="section">
        <div className="container category-layout">
          <div className="category-main">
            <Card className="category-feature">
              <img src={product.image_url} alt={product.name} />
              <h2>{product.name}</h2>
              <p>
                {product.description ||
                  `Explore ${product.name} with IT professionals in the IT Employeez community.`}
              </p>
              {product.product_detail_slug ? (
                <Link
                  to={`/product-details/${encodeURIComponent(product.product_detail_slug)}`}
                  className="category-detail-link"
                >
                  View {product.product_detail_slug} →
                </Link>
              ) : (
                <Link to="/community-subscribe" className="category-detail-link">
                  Join the community to discuss {product.name} →
                </Link>
              )}
            </Card>
          </div>

          <aside>
            <h3>More IT Products</h3>
            <div className="related-grid">
              {related.map((item) => (
                <ProductTile key={item.id} product={item} />
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
