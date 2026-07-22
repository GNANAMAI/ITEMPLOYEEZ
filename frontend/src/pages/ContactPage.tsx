import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Input";
import { api } from "@/services/api";
import "./ContactPage.css";

const PHONE = import.meta.env.VITE_PHONE_NUMBER || "+91-8712956595";
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "santu.edi@gmail.com";
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "918712956594";

const QUICK_LINKS = [
  { label: "WhatsApp Us", href: `https://wa.me/${WHATSAPP}` },
  { label: "Call Us", href: `tel:${PHONE}` },
  { label: "IT Products", href: "/it-apps" },
  { label: "Our Services", href: "/services" },
];

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.submitContact(form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with the IT Employeez team. We're here to help."
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact Us" }]}
      />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <Card>
              <div className="contact-item">
                <Phone size={20} />
                <div>
                  <h4>Call Us</h4>
                  <a href={`tel:${PHONE}`}>{PHONE}</a>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={20} />
                <div>
                  <h4>Email</h4>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </div>
              </div>
              <div className="contact-item">
                <MapPin size={20} />
                <div>
                  <h4>Address</h4>
                  <p>Vizag</p>
                </div>
              </div>
            </Card>

            <div className="contact-quick-links">
              {QUICK_LINKS.map((link) =>
                link.href.startsWith("/") ? (
                  <Link key={link.label} to={link.href}>{link.label}</Link>
                ) : (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>

          <Card>
            <h3>Send Message</h3>
            {success ? (
              <p className="contact-success">Message sent successfully! We'll get back to you soon.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <Input label="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Email *" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <TextArea label="Message *" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {error ? <p className="contact-error">{error}</p> : null}
                <Button type="submit" variant="accent" loading={loading}>Send Message</Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
