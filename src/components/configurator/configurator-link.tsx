"use client";

import type { ComponentProps } from "react";
import { Link, useRouter } from "@/i18n/navigation";

type ConfiguratorLinkProps = Omit<
  ComponentProps<typeof Link>,
  "href" | "prefetch"
>;

function preloadConfigurator() {
  void import("@/app/[locale]/configurator/sections/configurator-section");
}

export function ConfiguratorLink({
  onFocus,
  onMouseEnter,
  onPointerDown,
  ...props
}: ConfiguratorLinkProps) {
  const router = useRouter();

  function preload() {
    router.prefetch("/configurator");
    preloadConfigurator();
  }

  return (
    <Link
      {...props}
      href="/configurator"
      onFocus={(event) => {
        preload();
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        preload();
        onMouseEnter?.(event);
      }}
      onPointerDown={(event) => {
        preload();
        onPointerDown?.(event);
      }}
      prefetch={false}
    />
  );
}
