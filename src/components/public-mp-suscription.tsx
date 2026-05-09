import { Button } from "./ui/button";
import { createSubscriptionCheckout } from "@/lib/api/subscription";
import { useToast } from "@/hooks/use-toast";
import { ReactNode, useState } from "react";
import { SubscriptionStatus } from "@/types/subscription";

export function SubscriptionBadge({
  tenantId,
  subscriptionStatus,

  className,
  icon,
}: {
  tenantId: string;
  subscriptionStatus: SubscriptionStatus | null;
  className?: string;
  icon?: ReactNode;
}) {
  const { toast } = useToast();
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);

  if (!subscriptionStatus) {
    return null;
  }
  const buttonLabel = "Pagar y empezar";

  const handleClick = async () => {
    if (!subscriptionStatus.requiresPayment || isOpeningCheckout) {
      return;
    }

    setIsOpeningCheckout(true);

    try {
      const response = await createSubscriptionCheckout(tenantId);

      window.open(response.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "No pudimos iniciar el pago",
        description:
          error instanceof Error
            ? error.message
            : "Intentalo nuevamente en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setIsOpeningCheckout(false);
    }
  };

  return (
    <Button
      type="button"
      className={className}
      onClick={() => void handleClick()}
      disabled={isOpeningCheckout}
    >
      {icon}
      <span className="truncate">{buttonLabel}</span>
    </Button>
  );
}
