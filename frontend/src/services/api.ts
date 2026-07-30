import type {
  Banner,
  Candidate,
  CommunityComment,
  CommunityExpert,
  CommunityPost,
  CommunityPostCreateBody,
  CommunityStats,
  ContactDetails,
  ContactMessage,
  DashboardStats,
  ExpertMessage,
  LegalPage,
  Membership,
  MembershipCheck,
  MembershipGroup,
  PaymentHistoryItem,
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

  adminMe: () => request<User>("/admin/me"),

  adminStats: () => request<DashboardStats>("/admin/stats"),

  adminListBanners: () => requestArray<Banner>("/admin/banners"),
  adminCreateBanner: (body: Record<string, unknown>) =>
    request<Banner>("/admin/banners", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateBanner: (id: number, body: Record<string, unknown>) =>
    request<Banner>(`/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteBanner: (id: number) =>
    request<{ message: string }>(`/admin/banners/${id}`, { method: "DELETE" }),

  adminGetContactDetails: () => request<ContactDetails>("/admin/contact-details"),
  adminUpdateContactDetails: (body: ContactDetails) =>
    request<ContactDetails>("/admin/contact-details", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  adminGetAbout: () => request<{ title: string; content: string }>("/admin/about"),
  adminUpdateAbout: (body: { title: string; content: string }) =>
    request<{ title: string; content: string }>("/admin/about", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  adminListSubAdmins: () => requestArray<User>("/admin/sub-admins"),
  adminCreateSubAdmin: (body: Record<string, unknown>) =>
    request<User>("/admin/sub-admins", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateSubAdmin: (id: number, body: Record<string, unknown>) =>
    request<User>(`/admin/sub-admins/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteSubAdmin: (id: number) =>
    request<{ message: string }>(`/admin/sub-admins/${id}`, { method: "DELETE" }),

  adminListCategories: () => requestArray<ProductCategory>("/admin/categories"),
  adminCreateCategory: (body: Record<string, unknown>) =>
    request<ProductCategory>("/admin/categories", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateCategory: (id: number, body: Record<string, unknown>) =>
    request<ProductCategory>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteCategory: (id: number) =>
    request<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" }),

  adminListProducts: () => requestArray<ProductDetail>("/admin/products"),
  adminCreateProduct: (body: Record<string, unknown>) =>
    request<ProductDetail>("/admin/products", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateProduct: (id: number, body: Record<string, unknown>) =>
    request<ProductDetail>(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteProduct: (id: number) =>
    request<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" }),
  adminUpdateSubscriptionAmount: (
    id: number,
    body: { price_paise: number; billing_period: string },
  ) =>
    request<ProductDetail>(`/admin/products/${id}/subscription-amount`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  adminListServices: () => requestArray<Service>("/admin/services"),
  adminCreateService: (body: Record<string, unknown>) =>
    request<Service>("/admin/services", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateService: (id: number, body: Record<string, unknown>) =>
    request<Service>(`/admin/services/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteService: (id: number) =>
    request<{ message: string }>(`/admin/services/${id}`, { method: "DELETE" }),

  adminGetLegal: (slug: string) => request<LegalPage>(`/admin/legal/${slug}`),
  adminUpdateLegal: (slug: string, body: { title?: string; content?: string }) =>
    request<LegalPage>(`/admin/legal/${slug}`, { method: "PUT", body: JSON.stringify(body) }),

  getAbout: () => request<{ title: string; content: string }>("/about"),

  adminListMessages: () => requestArray<ContactMessage>("/admin/messages"),
  adminDeleteMessage: (id: number) =>
    request<{ message: string }>(`/admin/messages/${id}`, { method: "DELETE" }),

  adminListCandidates: () => requestArray<Candidate>("/admin/candidates"),
  adminToggleCandidate: (id: number) =>
    request<Candidate>(`/admin/candidates/${id}/toggle-active`, { method: "PUT" }),

  adminListPayments: () => requestArray<PaymentHistoryItem>("/admin/payments"),

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

  getProductDetailsForCategory: (id: number) =>
    requestArray<ProductDetail>(`/products/${id}/details`),

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

  createSubscription: (product_slug: string, plan_type: "monthly" | "yearly" = "yearly") =>
    request<RazorpayCheckout>("/subscriptions/create", {
      method: "POST",
      body: JSON.stringify({ product_slug, plan_type }),
    }),

  getMyMemberships: () => requestArray<Membership>("/memberships/mine"),

  getGroupedMemberships: () => requestArray<MembershipGroup>("/memberships/mine/grouped"),

  checkMembership: (slug: string) =>
    request<MembershipCheck>(`/memberships/check/${encodeURIComponent(slug)}`),

  getCommunityPosts: (slug: string, postType: string) =>
    requestArray<CommunityPost>(
      `/communities/${encodeURIComponent(slug)}/posts?post_type=${encodeURIComponent(postType)}`,
    ),

  getCommunityStats: (slug: string) =>
    request<CommunityStats>(`/communities/${encodeURIComponent(slug)}/stats`),

  createCommunityPost: (slug: string, body: CommunityPostCreateBody) =>
    request<CommunityPost>(`/communities/${encodeURIComponent(slug)}/posts`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updatePostStatus: (slug: string, postId: number, status: "open" | "resolved") =>
    request<CommunityPost>(`/communities/${encodeURIComponent(slug)}/posts/${postId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getPostComments: (slug: string, postId: number) =>
    requestArray<CommunityComment>(
      `/communities/${encodeURIComponent(slug)}/posts/${postId}/comments`,
    ),

  createPostComment: (
    slug: string,
    postId: number,
    body: { content: string; is_solution?: boolean },
  ) =>
    request<CommunityComment>(
      `/communities/${encodeURIComponent(slug)}/posts/${postId}/comments`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  getCommunityExperts: (slug: string) =>
    requestArray<CommunityExpert>(`/communities/${encodeURIComponent(slug)}/experts`),

  updateExpertProfile: (
    slug: string,
    body: { is_expert: boolean; expert_headline?: string; expert_bio?: string },
  ) =>
    request<CommunityExpert>(`/communities/${encodeURIComponent(slug)}/experts/me`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getExpertThread: (slug: string, userId: number) =>
    requestArray<ExpertMessage>(
      `/communities/${encodeURIComponent(slug)}/experts/${userId}/thread`,
    ),

  sendExpertMessage: (slug: string, userId: number, content: string) =>
    request<ExpertMessage>(
      `/communities/${encodeURIComponent(slug)}/experts/${userId}/thread`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
    ),
};

export { ApiError, API_URL };
