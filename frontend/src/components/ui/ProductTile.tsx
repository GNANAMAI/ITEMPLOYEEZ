import { Link } from "react-router-dom";
import type { ProductCategory } from "@/types";
import "./ProductTile.css";

interface ProductTileProps {
  product: ProductCategory;
}

/** Used on Home and related sections — logo-first, like live site tiles */
export function ProductTile({ product }: ProductTileProps) {
  return (
    <Link to={`/product/${product.id}`} className="product-tile" title={product.name}>
      <div className="product-tile-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </div>
      <span className="product-tile-name">{product.name}</span>
    </Link>
  );
}
