export const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Banner List", path: "/admin/banners" },
  { label: "Contact Details", path: "/admin/contact-details" },
  { label: "Sub Admin List", path: "/admin/sub-admins" },
  { label: "Subscription Amount", path: "/admin/subscription-amount" },
  { label: "Category List", path: "/admin/categories" },
  { label: "Product List", path: "/admin/products" },
  { label: "About Us", path: "/admin/about" },
  { label: "Privacy & Policy", path: "/admin/legal/privacy-policy" },
  { label: "Terms & Conditions", path: "/admin/legal/terms-conditions" },
  { label: "Refund Policy", path: "/admin/legal/cancel-policies" },
  { label: "Disclaimer", path: "/admin/legal/disclaimer" },
  { label: "Service List", path: "/admin/services" },
  { label: "Messages List", path: "/admin/messages" },
  { label: "Candidate Details", path: "/admin/candidates" },
  { label: "Contact Us Details", path: "/admin/contact-us" },
  { label: "Payment History", path: "/admin/payments" },
] as const;

export const SAMPLE_ADMIN_CREDS = {
  email: "admin@itemployeez.com",
  password: "Admin@12345",
};
