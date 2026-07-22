import { useCallback } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export function useRazorpaySubscribe() {
  const { isAuthenticated, refreshSubscription } = useAuth();

  const subscribe = useCallback(
    async (planType: "monthly" | "yearly") => {
      if (!isAuthenticated) {
        return { needsLogin: true as const };
      }

      const checkout = await api.createSubscription(planType);

      if (checkout.mock_mode) {
        await refreshSubscription();
        return { success: true as const, mock: true as const };
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || checkout.key_id;

      return new Promise<{ success: true } | { cancelled: true }>((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error("Razorpay SDK not loaded. Add the script tag to index.html."));
          return;
        }

        const razorpay = new window.Razorpay({
          key: keyId,
          subscription_id: checkout.subscription_id,
          name: "IT Employeez",
          description: "Community Membership",
          handler: async () => {
            await refreshSubscription();
            resolve({ success: true });
          },
          modal: {
            ondismiss: () => resolve({ cancelled: true }),
          },
        });

        razorpay.open();
      });
    },
    [isAuthenticated, refreshSubscription],
  );

  return { subscribe };
}
