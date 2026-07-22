import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/services/api";
import type { SubscriptionStatus, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  subscription: SubscriptionStatus | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    try {
      const status = await api.getSubscriptionStatus();
      setSubscription(status);
    } catch {
      setSubscription(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.me();
      setUser(profile);
      await refreshSubscription();
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [refreshSubscription]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setTokens = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      refreshUser();
    },
    [refreshUser],
  );

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const tokens = await api.login({ email, password, remember_me: rememberMe });
      setTokens(tokens.access_token, tokens.refresh_token);
    },
    [setTokens],
  );

  const register = useCallback(
    async (payload: Record<string, unknown>) => {
      await api.register(payload);
      await login(payload.email as string, payload.password as string);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setSubscription(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      subscription,
      loading,
      isAuthenticated: Boolean(user),
      hasActiveSubscription: Boolean(subscription?.is_active),
      login,
      register,
      logout,
      refreshUser,
      refreshSubscription,
      setTokens,
    }),
    [user, subscription, loading, login, register, logout, refreshUser, refreshSubscription, setTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
