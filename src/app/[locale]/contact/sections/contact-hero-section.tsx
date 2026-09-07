import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/app/[locale]/contact/contact-form";

type ContactMethod = {
  id: string;
  icon: "mail" | "phone" | "map";
  title: string;
  cta: string;
  href: string;
};

const ICONS = {
  mail: Mail,
  phone: Phone,
  map: MapPin,
} as const;

export async function ContactHeroSection() {
  const t = await getTranslations("contactPage");
  const methods = t.raw("methods") as ContactMethod[];

  return (
    <section className="scroll-mt-24 bg-white md:scroll-mt-28" id="form">
      <div className="mx-auto grid w-full max-w-screen-xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-muted px-3 py-1.5 font-medium text-brand text-sm">
            <Mail aria-hidden="true" className="size-3.5" strokeWidth={2} />
            {t("hero.badge")}
          </p>
          <h1 className="mt-5 max-w-[14ch] font-bold font-heading text-[2.25rem] text-brand-dark leading-[1.08] tracking-heading md:text-[3.25rem] md:leading-[1.02]">
            {t("hero.heading")}
          </h1>
          <p className="mt-4 max-w-md text-base text-brand-dark/70 leading-7 md:text-lg">
            {t("hero.body")}
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {methods.map((item) => {
              const Icon = ICONS[item.icon];
              const isHttp = item.href.startsWith("http");

              return (
                <li className="flex items-start gap-4" key={item.id}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
                    <Icon
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-brand-dark/55 text-sm">
                      {item.title}
                    </span>
                    <a
                      className="break-words font-semibold text-base text-brand-dark leading-snug transition-colors hover:text-brand"
                      href={item.href}
                      rel={isHttp ? "noopener noreferrer" : undefined}
                      target={isHttp ? "_blank" : undefined}
                    >
                      {item.cta}
                    </a>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="min-w-0">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
