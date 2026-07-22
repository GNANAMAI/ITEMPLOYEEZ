export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description: string | null;
  product_detail_slug: string | null;
  show_on_home: boolean;
}

export interface ProductDetail {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  gallery_urls: string[];
  category_id: number | null;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
}

export interface SubscriptionStatus {
  id: number;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  is_active: boolean;
}

export interface LegalPage {
  slug: string;
  title: string;
  content: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface RazorpayCheckout {
  subscription_id: string | null;
  key_id: string;
  plan_id: string;
  customer_notify: number;
  notes?: Record<string, string>;
  mock_mode: boolean;
}
