import { Badge } from "@/components/ui/badge";
import {
  getSubscriptionStatusLabel,
  getSubscriptionStatusVariant,
} from "@/lib/subscription";

interface SubscriptionStatusBadgeProps {
  status?: string | null;
  shape?: "simple" | "bar" | "dot";
}

export function SubscriptionStatusBadge({
  status,
  shape = "simple",
}: SubscriptionStatusBadgeProps) {
  return (
    <Badge shape={shape} variant={getSubscriptionStatusVariant(status)}>
      {getSubscriptionStatusLabel(status)}
    </Badge>
  );
}
