import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "./globals.css";

const outfit = localFont({
  src: "./fonts/Outfit-Variable.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 | asleep",
  description: "This page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html
      className={cn(outfit.variable, outfit.className, "h-full antialiased")}
      lang="en"
    >
      <body className="relative flex min-h-full flex-col items-center justify-center bg-white px-6 font-sans text-brand-dark">
        <p className="font-black text-6xl tracking-heading">404</p>
        <p className="mt-4 text-base text-brand-dark/70">
          This page does not exist.
        </p>
        <a
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-white transition-colors hover:bg-brand-dark"
          href="/"
        >
          Home
        </a>
      </body>
    </html>
  );
}
