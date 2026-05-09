export type SubscriptionPhase = "trial" | "active" | "grace" | "paused";

export type SubscriptionPaymentStatus = string | null;

export type SubscriptionStatusValue = string | null;

export type SubscriptionStatus = {
  currentPhase: SubscriptionPhase;
  daysRemaining: number | null;
  validUntil: string | null;
  requiresPayment: boolean;
  accessAllowed: boolean;
  planName: string | null;
  paymentStatus: SubscriptionPaymentStatus;
  subscriptionStatus: SubscriptionStatusValue;
};

export type SubscriptionCheckoutResponse = {
  checkoutUrl: string;
};
