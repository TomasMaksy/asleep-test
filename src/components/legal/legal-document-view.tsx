import { LegalMarkdown } from "@/components/legal/legal-markdown";
import type { LegalDocument } from "@/lib/legal-content";

function ToggleIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-3 shrink-0 items-center justify-center text-brand-dark"
    >
      <span className="absolute h-3 w-px rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open/acc:scale-y-0" />
      <span className="absolute h-px w-3 rounded-full bg-current" />
    </span>
  );
}

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24 lg:px-10">
      <header className="max-w-xl">
        <h1 className="font-bold font-heading text-[2.25rem] text-brand-dark leading-[1.08] tracking-heading md:text-[3rem] md:leading-[1.05]">
          {document.title}
        </h1>
        {document.intro ? (
          <div className="legal-md mt-8">
            <LegalMarkdown source={document.intro} />
          </div>
        ) : null}
      </header>

      {document.sections.length > 0 ? (
        <div className="mt-14 border-grey border-t md:mt-20">
          {document.sections.map((section) => (
            <details
              className="acc group/acc border-grey border-b"
              id={section.id}
              key={section.id}
            >
              <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-6 py-6 text-left font-bold text-base text-brand-dark leading-snug marker:content-none focus-visible:outline-2 focus-visible:outline-brand focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
                <span>{section.title}</span>
                <ToggleIcon />
              </summary>
              <div className="pb-6">
                <LegalMarkdown source={section.body} />
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </article>
  );
}
