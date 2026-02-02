import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface EmptyPlaceholderProps {
  icon?: string;
  title?: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyPlaceholder({
  icon,
  title,
  description,
  action,
  className,
}: EmptyPlaceholderProps) {
  return (
    <Empty className={cn("h-full border-0", className)}>
      <EmptyHeader>
        {icon && (
          <EmptyMedia>
            <span className={cn(icon, "size-12 opacity-50")} />
          </EmptyMedia>
        )}
        {title && <EmptyTitle>{title}</EmptyTitle>}
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
