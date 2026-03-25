import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/types";

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  open: { label: "Open", variant: "default" },
  pending: { label: "Pending", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "secondary" },
};

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
