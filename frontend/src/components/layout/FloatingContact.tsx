import { Phone, MessageCircle } from "lucide-react";
import "./FloatingContact.css";

const PHONE = import.meta.env.VITE_PHONE_NUMBER || "+918712956595";
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "918712956594";

export function FloatingContact() {
  return (
    <div className="floating-contact">
      <a href={`tel:${PHONE}`} className="float-btn float-phone" aria-label="Phone call">
        <Phone size={20} />
        <span>Phone Call</span>
      </a>
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        className="float-btn float-whatsapp"
        aria-label="WhatsApp"
      >
        <MessageCircle size={20} />
        <span>WhatsApp Now</span>
      </a>
    </div>
  );
}
