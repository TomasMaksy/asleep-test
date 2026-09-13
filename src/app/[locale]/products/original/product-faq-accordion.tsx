import { CheckItem } from "@/components/ui/check-item";

export type ProductFaqSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type ProductFaqItem = {
  question: string;
  answer?: string;
  materialsHeading?: string;
  materials?: string[];
  sections?: ProductFaqSection[];
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

function FaqSectionBlock({ section }: { section: ProductFaqSection }) {
  return (
    <div>
      <p className="mb-2 font-bold">{section.heading}</p>
      <p>{section.body}</p>
      {section.bullets?.length ? (
        <ul className="mt-3 flex flex-col gap-1">
          {section.bullets.map((bullet) => (
            <li key={bullet}>
              <CheckItem
                className="gap-x-2 text-brand-dark"
                iconClassName="mt-0.5 size-4 text-brand-dark/35"
              >
                {bullet}
              </CheckItem>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ProductFaqAccordion({
  items,
  defaultOpenIndex = null,
}: {
  items: ProductFaqItem[];
  defaultOpenIndex?: number | null;
}) {
  return (
    <div className="border-grey border-t">
      {items.map((item, index) => (
        <details
          className="acc group/acc border-grey border-b"
          key={item.question}
          name="product-faq"
          {...(index === defaultOpenIndex ? { open: true } : {})}
        >
          <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-bold text-base text-brand-dark leading-snug marker:content-none [&::-webkit-details-marker]:hidden">
            {item.question}
            <ToggleIcon />
          </summary>
          <div className="flex flex-col gap-5 pb-4 text-base text-brand-dark leading-7">
            {item.answer ? <p>{item.answer}</p> : null}

            {item.materials?.length ? (
              <div>
                {item.materialsHeading ? (
                  <p className="mb-2 font-bold">{item.materialsHeading}</p>
                ) : null}
                <ul className="flex flex-col gap-1">
                  {item.materials.map((material) => (
                    <li key={material}>
                      <CheckItem
                        className="gap-x-2 text-brand-dark"
                        iconClassName="mt-0.5 size-4 text-brand-dark/35"
                      >
                        {material}
                      </CheckItem>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {item.sections?.map((section) => (
              <FaqSectionBlock key={section.heading} section={section} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
