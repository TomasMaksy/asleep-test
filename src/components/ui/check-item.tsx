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
    <div className={cn("flex items-center gap-x-2", className)}>
      <CheckIcon className={iconClassName} />
      <p>{children}</p>
    </div>
  );
}
