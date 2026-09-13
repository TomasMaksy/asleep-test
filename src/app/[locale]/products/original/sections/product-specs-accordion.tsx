import Image from "next/image";

export type SpecItem = {
  question: string;
  answer: string;
  image?: string;
};

function ToggleIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-5 shrink-0 items-center justify-center text-brand-dark"
    >
      <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
      <span className="absolute h-3.5 w-0.5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open/acc:scale-y-0" />
    </span>
  );
}

export function ProductSpecsAccordion({
  imageAlt,
  items,
}: {
  imageAlt: string;
  items: SpecItem[];
}) {
  return (
    <div className="border-grey border-t">
      {items.map((item) => (
        <details
          className="acc group/acc border-grey border-b"
          key={item.question}
          name="product-specs"
        >
          <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-bold text-base text-brand-dark leading-snug marker:content-none focus-visible:outline-2 focus-visible:outline-brand focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
            {item.question}
            <ToggleIcon />
          </summary>
          <div className="flex flex-col gap-4 pb-5 text-base text-brand-dark leading-7">
            <p className="whitespace-pre-line">{item.answer}</p>
            {item.image ? (
              <Image
                alt={imageAlt}
                className="h-auto w-auto max-w-full object-contain"
                height={1103}
                src={item.image}
                width={1200}
              />
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
