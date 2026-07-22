import type {
  ContactMessage,
  LegalPage,
  ProductCategory,
  ProductDetail,
  RazorpayCheckout,
  Service,
  SubscriptionStatus,
  TokenResponse,
  User,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ensureArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : [];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = (data as { detail?: string | Array<{ msg: string }> } | null)?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  if (data === null) {
    throw new ApiError("Invalid response from server", response.status);
  }

  return data as T;
}

async function requestArray<T>(path: string, options: RequestInit = {}): Promise<T[]> {
  const data = await request<unknown>(path, options);
  return ensureArray<T>(data);
}

export const api = {
  register: (body: Record<string, unknown>) =>
    request<User>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: Record<string, unknown>) =>
    request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  adminLogin: (body: Record<string, unknown>) =>
    request<TokenResponse>("/admin/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<User>("/auth/me"),

  forgotPassword: (email: string) =>
    request<{ message: string; reset_token: string | null }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    }),

  getProducts: () => requestArray<ProductCategory>("/products"),

  getHomeProducts: () => requestArray<ProductCategory>("/products/home"),

  getProduct: (id: number) => request<ProductCategory>(`/products/${id}`),

  getProductDetails: () => requestArray<ProductDetail>("/products/details/list"),

  getProductDetail: (slug: string) =>
    request<ProductDetail>(`/products/details/${encodeURIComponent(slug)}`),

  getServices: () => requestArray<Service>("/services"),

  getService: (slug: string) => request<Service>(`/services/${slug}`),

  submitContact: (body: ContactMessage) =>
    request("/contact", { method: "POST", body: JSON.stringify(body) }),

  getContactMessages: () => requestArray<ContactMessage>("/contact/messages"),

  getLegalPage: (slug: string) => request<LegalPage>(`/legal/${slug}`),

  getSubscriptionStatus: () => request<SubscriptionStatus>("/subscriptions/status"),

  createSubscription: (plan_type: "monthly" | "yearly") =>
    request<RazorpayCheckout>("/subscriptions/create", {
      method: "POST",
      body: JSON.stringify({ plan_type }),
    }),
};

export { ApiError, API_URL };
