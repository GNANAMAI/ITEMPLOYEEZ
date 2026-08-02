/** Build login/signup URLs that preserve where the user wanted to go. */
export function withReturnTo(path: "/login" | "/signup", returnTo?: string | null): string {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return path;
  }
  // Never bounce auth pages into themselves.
  if (
    returnTo.startsWith("/login") ||
    returnTo.startsWith("/signup") ||
    returnTo.startsWith("/candidate/forgot-password")
  ) {
    return path;
  }
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}

/** Safe post-auth destination with a clear default. */
export function resolveReturnTo(
  searchParams: URLSearchParams,
  fallback = "/it-apps",
): string {
  const raw = searchParams.get("returnTo");
  if (!raw) return fallback;
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
    if (
      decoded.startsWith("/login") ||
      decoded.startsWith("/signup") ||
      decoded.startsWith("/candidate/forgot-password")
    ) {
      return fallback;
    }
    return decoded;
  } catch {
    return fallback;
  }
}

/** Member product funnel destinations used for breadcrumbs / back links. */
export const FUNNEL = {
  home: "/",
  products: "/it-apps",
  communities: "/community-subscribe",
  services: "/services",
  category: (id: number | string) => `/product/${id}`,
  product: (slug: string) => `/product-details/${encodeURIComponent(slug)}`,
  checkout: (slug: string) => `/subscription-checkout/${encodeURIComponent(slug)}`,
  communityProduct: (slug: string) =>
    `/community-subscribe?product=${encodeURIComponent(slug)}`,
} as const;
