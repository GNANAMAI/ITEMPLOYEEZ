import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/types";
import "./ServiceCard.css";

const SERVICE_IMAGES: Record<string, string> = {
  "access-to-exclusive-resources":
    "https://itemployeez.com/public/uploads/images/1742202640.png",
  "Career-Advancement": "https://itemployeez.com/public/uploads/images/1742470879.jpg",
};

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const image =
    SERVICE_IMAGES[service.slug] ??
    "https://itemployeez.com/public/uploads/images/1742202640.png";

  return (
    <article className="feature-card">
      <div className="feature-card-media">
        <img src={image} alt="" loading="lazy" />
      </div>
      <div className="feature-card-body">
        <h3>
          <Link to={`/service-details/${service.slug}`}>{service.title}</Link>
        </h3>
        <p>{service.excerpt || service.content}</p>
        <Link to={`/service-details/${service.slug}`} className="feature-card-cta">
          Learn more <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
