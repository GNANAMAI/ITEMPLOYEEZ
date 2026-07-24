/** Wait for Razorpay checkout.js to be available. */

export function waitForRazorpay(timeoutMs = 10000): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error("Razorpay SDK failed to load. Check your network or index.html script tag."));
        return;
      }
      requestAnimationFrame(check);
    };

    check();
  });
}

export function openRazorpayCheckout(options: {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  onSuccess: () => void | Promise<void>;
  onDismiss: () => void;
}): void {
  const razorpay = new window.Razorpay!({
    key: options.keyId,
    subscription_id: options.subscriptionId,
    name: options.name,
    description: options.description,
    theme: { color: "#0f172a" },
    handler: () => {
      void Promise.resolve(options.onSuccess());
    },
    modal: {
      ondismiss: options.onDismiss,
    },
  });

  razorpay.on("payment.failed", () => {
    options.onDismiss();
  });

  razorpay.open();
}
