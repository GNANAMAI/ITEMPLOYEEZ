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
  subtitle: string | null;
  description: string | null;
  image_url: string;
  gallery_urls: string[];
  category_id: number | null;
  price_paise: number;
  billing_period: string;
  category_name: string | null;
  category_image_url: string | null;
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

export interface MembershipProduct {
  id: number;
  slug: string;
  title: string;
  image_url: string;
}

export interface MembershipCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string;
}

export interface Membership {
  id: number;
  product_detail_id: number;
  status: string;
  current_period_end: string | null;
  is_active: boolean;
  product: MembershipProduct;
  category: MembershipCategory | null;
}

export interface MembershipGroup {
  category: MembershipCategory;
  products: MembershipProduct[];
}

export interface MembershipCheck {
  has_access: boolean;
  membership: Membership | null;
}

export interface CommunityAuthor {
  id: number;
  name: string;
  job_title: string | null;
}

export interface CommunityPost {
  id: number;
  post_type: string;
  title: string | null;
  content: string;
  status: string;
  company: string | null;
  location: string | null;
  contact_info: string | null;
  comment_count: number;
  created_at: string;
  resolved_at: string | null;
  author: CommunityAuthor;
  product_slug: string;
}

export interface CommunityComment {
  id: number;
  post_id: number;
  content: string;
  is_solution: boolean;
  created_at: string;
  author: CommunityAuthor;
}

export interface CommunityExpert {
  user_id: number;
  name: string;
  job_title: string | null;
  expert_headline: string | null;
  expert_bio: string | null;
  is_self: boolean;
}

export interface ExpertMessage {
  id: number;
  from_user_id: number;
  to_user_id: number;
  content: string;
  created_at: string;
  from_user_name: string;
  to_user_name: string;
}

export interface CommunityStats {
  open_issues: number;
  active_jobs: number;
  blog_count: number;
  expert_count: number;
  member_count: number;
}

export type CommunityTab = "issue" | "blog" | "job" | "expert";

export interface CommunityPostCreateBody {
  post_type: string;
  title?: string;
  content: string;
  company?: string;
  location?: string;
  contact_info?: string;
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
  product_slug?: string;
  product_title?: string;
  amount_paise?: number;
}
