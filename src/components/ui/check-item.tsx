import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function CheckItem({
  children,
  className,
  iconClassName,
}: {
  children: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-start gap-x-2", className)}>
      <CheckIcon className={cn("mt-0.5", iconClassName)} />
      <p className="leading-snug">{children}</p>
    </div>
  );
}
