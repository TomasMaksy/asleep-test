import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ConfiguratorLink } from "@/components/configurator/configurator-link";
import { Logo } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PAYMENTS = [
  { id: "1", alt: "iDEAL" },
  { id: "21", alt: "PayPal" },
  { id: "9", alt: "AMEX" },
  { id: "7", alt: "Visa Mastercard" },
  { id: "19", alt: "in3" },
  { id: "20", alt: "SprayPay" },
] as const;

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumnData = {
  title: string;
  links: FooterLink[];
};

function isInternalHref(href: string) {
  return href.startsWith("/");
}

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const columns = t.raw("columns") as FooterColumnData[];

  return (
    <footer className="bg-[#2B2D41] pt-12 pb-24 text-white lg:pt-24">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-12 px-5 lg:flex-row lg:gap-8 xl:px-10">
        <div className="flex w-full min-w-0 flex-col lg:w-1/3">
          <div className="mb-8 w-[120px] md:mb-[43px]">
            <Logo className="h-[27px] w-auto" variant="white" />
          </div>

          <div className="mb-8 w-full max-w-full">
            <NewsletterForm />
          </div>

          <div>
            <p className="pb-2 font-bold text-rg text-white/50 leading-[2.5]">
              {t("payments")}
            </p>
            <div className="flex flex-wrap gap-5">
              {PAYMENTS.map((payment) => (
                <Image
                  alt={payment.alt}
                  className="h-10 w-auto"
                  height={40}
                  key={payment.id}
                  src={`/images/payments/${payment.id}.svg`}
                  width={40}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:w-2/3">
          {columns.map((column) => (
            <FooterColumn column={column} key={column.title} />
          ))}
        </div>
      </div>

      <div className="mt-10 overflow-hidden py-4 md:mt-14 md:py-6">
        <div className="footer-marquee flex w-max items-center gap-[50vw]">
          {[0, 1, 2, 3].map((index) => (
            <p
              aria-hidden={index > 0}
              className="shrink-0 whitespace-nowrap font-bold font-heading text-[clamp(3.5rem,12vw,10rem)] text-white leading-none tracking-heading"
              key={`marquee-${index}`}
            >
              {t("marquee")}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  column,
  className,
}: {
  column: FooterColumnData;
  className?: string;
}) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <h3 className="mb-3 font-bold text-rg text-white/50 leading-[2.5]">
        {column.title}
      </h3>
      <ul className="flex flex-col pl-0">
        {column.links.map((link) => (
          <li
            className="list-none text-rg text-white leading-[1.85]"
            key={link.label}
          >
            {link.href === "/configurator" ? (
              <ConfiguratorLink className="hover:underline">
                {link.label}
              </ConfiguratorLink>
            ) : isInternalHref(link.href) ? (
              <Link className="hover:underline" href={link.href}>
                {link.label}
              </Link>
            ) : (
              <a
                className="hover:underline"
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { rel: "noopener noreferrer", target: "_blank" as const }
                  : {})}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
