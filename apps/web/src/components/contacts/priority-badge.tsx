import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={priority}>{priority}</Badge>;
}

