import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";
import { FOOTER } from "@/lib/copy";
import { cn } from "@/lib/utils";

const PAYMENTS = [
  { id: "1", alt: "iDEAL" },
  { id: "21", alt: "PayPal" },
  { id: "9", alt: "AMEX" },
  { id: "7", alt: "Visa Mastercard" },
  { id: "19", alt: "in3" },
  { id: "20", alt: "SprayPay" },
] as const;

export function SiteFooter() {
  const questions = FOOTER.columns[0];
  const follow = FOOTER.columns[1];
  const about = FOOTER.columns[2];
  const sleepinducing = FOOTER.columns[3];
  const products = FOOTER.columns[4];

  return (
    <footer className="bg-[#2B2D41] pt-12 pb-24 text-white lg:pt-24">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-12 px-5 lg:flex-row lg:gap-8 xl:px-10">
        <div className="flex w-full min-w-0 flex-col lg:w-1/3">
          <div className="mb-[43px] hidden w-[120px] md:block">
            <Logo className="h-[27px] w-auto" variant="white" />
          </div>

          <div className="mb-8 w-full max-w-full">
            <NewsletterForm />
          </div>

          <div>
            <p className="pb-2 font-bold text-rg text-white/50 leading-[2.5]">
              {FOOTER.payments}
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

        <div className="grid w-full min-w-0 grid-cols-2 gap-x-6 gap-y-12 md:hidden">
          <FooterColumn column={questions} />
          <FooterColumn column={follow} />
          <FooterColumn column={about} />
          <FooterColumn column={sleepinducing} />
          <FooterColumn className="col-span-2" column={products} />
        </div>

        <div className="hidden w-full min-w-0 grid-cols-3 gap-8 md:grid lg:w-2/3">
          <div className="flex flex-col gap-12 lg:gap-[30px]">
            <FooterColumn column={questions} />
            <FooterColumn column={follow} />
          </div>

          <div className="flex flex-col gap-12 lg:gap-[30px]">
            <FooterColumn column={about} />
            <FooterColumn column={sleepinducing} />
          </div>

          <FooterColumn column={products} />
        </div>
      </div>

      <div className="container block py-8 md:hidden">
        <Logo className="h-[27px] w-auto" variant="white" />
      </div>

      <div className="mt-10 overflow-hidden py-4 md:mt-14 md:py-6">
        <div className="footer-marquee flex w-max items-center gap-[50vw]">
          {[0, 1, 2, 3].map((index) => (
            <p
              aria-hidden={index > 0}
              className="shrink-0 whitespace-nowrap font-bold font-heading text-[clamp(3.5rem,12vw,10rem)] text-white leading-none tracking-[-0.04em]"
              key={`marquee-${index}`}
            >
              {FOOTER.marquee}
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
  column: { title: string; links: string[] };
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
            key={link}
          >
            <Link className="hover:underline" href="#">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
