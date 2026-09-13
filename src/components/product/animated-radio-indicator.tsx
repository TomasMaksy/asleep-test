import { cn } from "@/lib/utils";

type AnimatedRadioIndicatorProps = {
  selected: boolean;
  size?: "sm" | "md";
};

export function AnimatedRadioIndicator({
  selected,
  size = "md",
}: AnimatedRadioIndicatorProps) {
  if (size === "sm") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "relative flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
          selected ? "border-brand-dark bg-brand-dark" : "border-grey bg-white",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full bg-white transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
            selected ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
        selected ? "border-brand-dark bg-brand-dark" : "border-grey bg-white",
      )}
    >
      <span
        className={cn(
          "absolute inset-1 rounded-full bg-white transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
          selected ? "scale-100 opacity-100" : "scale-0 opacity-0",
        )}
      />
    </span>
  );
}
