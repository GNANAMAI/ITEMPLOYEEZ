import { useCallback, useRef, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { openRazorpayCheckout, waitForRazorpay } from "@/utils/razorpay";
import type { RazorpayCheckout } from "@/types";

type SubscribeResult =
  | { needsLogin: true }
  | { success: true; productSlug: string }
  | { cancelled: true };

export function useRazorpaySubscribe() {
  const { isAuthenticated, refreshSubscription, refreshMemberships, user } = useAuth();
  const [mockCheckout, setMockCheckout] = useState<RazorpayCheckout | null>(null);
  const pendingResolveRef = useRef<((value: SubscribeResult) => void) | null>(null);

  const finishMockSuccess = useCallback(async () => {
    const slug = mockCheckout?.product_slug || "";
    await refreshSubscription();
    await refreshMemberships();
    setMockCheckout(null);
    pendingResolveRef.current?.({ success: true, productSlug: slug });
    pendingResolveRef.current = null;
  }, [mockCheckout, refreshSubscription, refreshMemberships]);

  const cancelMock = useCallback(() => {
    setMockCheckout(null);
    pendingResolveRef.current?.({ cancelled: true });
    pendingResolveRef.current = null;
  }, []);

  const subscribe = useCallback(
    async (productSlug: string, planType: "monthly" | "yearly" = "yearly") => {
      if (!isAuthenticated) {
        return { needsLogin: true as const };
      }

      const checkout = await api.createSubscription(productSlug, planType);

      if (checkout.mock_mode) {
        return new Promise<SubscribeResult>((resolve) => {
          pendingResolveRef.current = resolve;
          setMockCheckout(checkout);
        });
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || checkout.key_id;

      const subscriptionId = checkout.subscription_id;
      if (!subscriptionId) {
        throw new Error("Razorpay subscription was not created. Check backend logs and plan IDs.");
      }

      await waitForRazorpay();

      return new Promise<SubscribeResult>((resolve, reject) => {
        try {
          openRazorpayCheckout({
            keyId,
            subscriptionId,
            name: "IT Employeez",
            description: checkout.product_title || "Community Membership",
            onSuccess: async () => {
              await refreshSubscription();
              await refreshMemberships();
              resolve({ success: true, productSlug });
            },
            onDismiss: () => resolve({ cancelled: true }),
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Failed to open Razorpay checkout"));
        }
      });
    },
    [isAuthenticated, refreshSubscription, refreshMemberships],
  );

  return {
    subscribe,
    mockCheckout,
    cancelMock,
    finishMockSuccess,
    userEmail: user?.email,
  };
}
